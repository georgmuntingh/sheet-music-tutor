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

  // Map flat notes to their sharp equivalents for frequency calculation
  const flatToSharpMap: { [key: string]: string } = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };

  // Convert flats to sharps for consistent frequency calculation
  const normalizedNoteName = flatToSharpMap[noteName] || noteName;
  const noteIndex = noteNames.indexOf(normalizedNoteName);

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

// Compare two note strings considering enharmonic equivalents
// Returns true if the notes are the same pitch (e.g., C#4 and Db4)
export const areNotesEquivalent = (note1: string, note2: string): boolean => {
  // Parse note name and octave from strings like "C#4" or "Db5"
  const parseNote = (noteStr: string): { name: string; octave: string } => {
    const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${noteStr}`);
    }
    return { name: match[1], octave: match[2] };
  };

  const parsed1 = parseNote(note1);
  const parsed2 = parseNote(note2);

  // If octaves are different, notes can't be equivalent
  if (parsed1.octave !== parsed2.octave) {
    return false;
  }

  // Map flat notes to their sharp equivalents
  const flatToSharpMap: { [key: string]: string } = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };

  // Normalize both note names to sharps
  const normalized1 = flatToSharpMap[parsed1.name] || parsed1.name;
  const normalized2 = flatToSharpMap[parsed2.name] || parsed2.name;

  // Compare normalized note names
  return normalized1 === normalized2;
};
