import { PitchDetector } from 'pitchy';
import { Note } from '../types';
import { getNoteFromFrequency } from './noteUtils';

export interface PitchDetectionResult {
  frequency: number;
  clarity: number; // 0-1, how clear the pitch is
  note: Note | null;
}

export class PianoPitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private detector: PitchDetector<Float32Array> | null = null;
  private inputBuffer: Float32Array | null = null;
  private mediaStream: MediaStream | null = null;
  private isRunning: boolean = false;

  // Piano-specific configuration
  private readonly SAMPLE_RATE = 44100;
  private readonly BUFFER_SIZE = 4096; // Larger buffer for better low frequency detection
  private readonly CLARITY_THRESHOLD = 0.85; // High threshold for piano clarity
  private readonly MIN_FREQUENCY = 60; // ~B1, lowest piano note we care about
  private readonly MAX_FREQUENCY = 4200; // ~C8, highest piano note

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: this.SAMPLE_RATE,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.BUFFER_SIZE * 2;
      this.analyser.smoothingTimeConstant = 0.0; // No smoothing for better piano transient detection

      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      // Initialize pitch detector
      this.inputBuffer = new Float32Array(this.BUFFER_SIZE);
      this.detector = PitchDetector.forFloat32Array(this.BUFFER_SIZE) as PitchDetector<Float32Array>;

      this.isRunning = true;
    } catch (error) {
      console.error('Failed to initialize pitch detector:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  detectPitch(): PitchDetectionResult | null {
    if (!this.isRunning || !this.analyser || !this.detector || !this.inputBuffer) {
      return null;
    }

    // Get audio data from analyser
    // @ts-ignore - Type compatibility with analyser node
    this.analyser.getFloatTimeDomainData(this.inputBuffer);

    // Detect pitch using autocorrelation (works well with piano harmonics)
    // @ts-ignore - Type compatibility issue with pitchy library
    const [frequency, clarity] = this.detector.findPitch(
      this.inputBuffer,
      this.audioContext!.sampleRate
    );

    // Validate frequency is in piano range and has sufficient clarity
    if (
      frequency < this.MIN_FREQUENCY ||
      frequency > this.MAX_FREQUENCY ||
      clarity < this.CLARITY_THRESHOLD
    ) {
      return null;
    }

    // Convert frequency to note
    const note = getNoteFromFrequency(frequency, 0.4); // Slightly tighter tolerance for piano

    return {
      frequency,
      clarity,
      note,
    };
  }

  // Get multiple detections over a short period for more reliable results
  async detectPitchStable(durationMs: number = 500, requiredConsensus: number = 3): Promise<Note | null> {
    const detections: Map<string, number> = new Map();
    const startTime = Date.now();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const result = this.detectPitch();

        if (result && result.note) {
          const noteKey = `${result.note.name}${result.note.octave}`;
          detections.set(noteKey, (detections.get(noteKey) || 0) + 1);

          // Check if we have consensus
          for (const [, count] of detections.entries()) {
            if (count >= requiredConsensus) {
              clearInterval(interval);
              // Parse the note from the key
              const note = result.note; // We know this matches the consensus
              resolve(note);
              return;
            }
          }
        }

        // Timeout
        if (Date.now() - startTime > durationMs) {
          clearInterval(interval);
          // Return the most detected note if any
          let maxCount = 0;
          let bestNote: Note | null = null;

          for (const [, count] of detections.entries()) {
            if (count > maxCount) {
              maxCount = count;
              // We need to get the note object from the last detection
              const lastResult = this.detectPitch();
              if (lastResult && lastResult.note) {
                bestNote = lastResult.note;
              }
            }
          }

          resolve(bestNote);
        }
      }, 50); // Check every 50ms
    });
  }

  stop(): void {
    this.isRunning = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.detector = null;
    this.inputBuffer = null;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
