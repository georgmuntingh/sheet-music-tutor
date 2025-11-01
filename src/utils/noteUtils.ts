import { Note } from '../types';

// Generate all notes from C2 to C6 (88 key piano range subset)
export const generateNoteSet = (): Note[] => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const notes: Note[] = [];

  // Generate notes from C2 to C6
  for (let octave = 2; octave <= 6; octave++) {
    for (const noteName of noteNames) {
      notes.push({
        name: noteName,
        octave,
        frequency: getFrequency(noteName, octave),
      });
    }
  }

  return notes;
};

// Calculate frequency for a given note
// A4 = 440 Hz
export const getFrequency = (noteName: string, octave: number): number => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = noteNames.indexOf(noteName);

  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  // Calculate semitones from A4
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);

  // Use equal temperament formula: f = 440 * 2^(n/12)
  return 440 * Math.pow(2, semitonesFromA4 / 12);
};

// Get note name from frequency (with tolerance for tuning variations)
export const getNoteFromFrequency = (frequency: number, tolerance: number = 0.5): Note | null => {
  const allNotes = generateNoteSet();

  for (const note of allNotes) {
    const semitoneDiff = 12 * Math.log2(frequency / note.frequency);

    // Check if frequency is within tolerance (in semitones)
    if (Math.abs(semitoneDiff) < tolerance) {
      return note;
    }
  }

  return null;
};

// Convert note to VexFlow format (e.g., "C/4" for middle C)
export const toVexFlowNote = (note: Note): string => {
  return `${note.name}/${note.octave}`;
};

// Get the clef for a note (treble or bass)
export const getClef = (_note: Note): 'treble' | 'bass' => {
  // Always use treble clef (G-clef) for all lessons
  return 'treble';
};
