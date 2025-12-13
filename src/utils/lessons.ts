import { Lesson, Note, Chord, MathProblem } from '../types';
import { getFrequency } from './noteUtils';
import {
  generateWholeHourProblems,
  generateHalfPastProblems,
  generateQuarterPastProblems,
  generateQuarterToProblems,
  generateFiveMinuteProblems,
} from './clockUtils';

// Helper function to generate natural notes for a specific octave range
const generateNotesForOctave = (octave: number): Note[] => {
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return noteNames.map(name => ({
    name,
    octave,
    frequency: getFrequency(name, octave),
  }));
};

// Helper function to generate sharps and flats for a specific octave range
const generateAccidentalsForOctave = (octave: number): Note[] => {
  // Include both sharps and flats for comprehensive coverage
  const accidentalNames = ['C#', 'Db', 'D#', 'Eb', 'F#', 'Gb', 'G#', 'Ab', 'A#', 'Bb'];
  return accidentalNames.map(name => ({
    name,
    octave,
    frequency: getFrequency(name, octave),
  }));
};

// Helper function to generate bass clef notes (E to D across two octaves)
// This covers the typical range of bass clef staff
const generateBassClefNotes = (startOctave: number): Note[] => {
  const lowerOctaveNotes = ['E', 'F', 'G', 'A', 'B'];
  const upperOctaveNotes = ['C', 'D'];

  const notes: Note[] = [
    ...lowerOctaveNotes.map(name => ({
      name,
      octave: startOctave,
      frequency: getFrequency(name, startOctave),
    })),
    ...upperOctaveNotes.map(name => ({
      name,
      octave: startOctave + 1,
      frequency: getFrequency(name, startOctave + 1),
    })),
  ];

  return notes;
};

// Helper function to generate bass clef accidentals (E to D across two octaves)
const generateBassClefAccidentals = (startOctave: number): Note[] => {
  // E#/Fb, F#/Gb, G#/Ab, A#/Bb in lower octave
  // C#/Db, D#/Eb in upper octave
  const lowerOctaveAccidentals = ['F#', 'Gb', 'G#', 'Ab', 'A#', 'Bb'];
  const upperOctaveAccidentals = ['C#', 'Db', 'D#', 'Eb'];

  const notes: Note[] = [
    ...lowerOctaveAccidentals.map(name => ({
      name,
      octave: startOctave,
      frequency: getFrequency(name, startOctave),
    })),
    ...upperOctaveAccidentals.map(name => ({
      name,
      octave: startOctave + 1,
      frequency: getFrequency(name, startOctave + 1),
    })),
  ];

  return notes;
};

// Helper function to create a major chord with a specific root note
const createMajorChord = (rootName: string, octave: number): Chord => {
  // Major chord intervals: Root, Major Third (+4 semitones), Perfect Fifth (+7 semitones)
  const root: Note = {
    name: rootName,
    octave,
    frequency: getFrequency(rootName, octave),
  };

  // Calculate the third and fifth
  const noteSequence = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = noteSequence.indexOf(rootName);

  // Major third is 4 semitones above root
  const thirdIndex = (rootIndex + 4) % 12;
  const thirdOctave = octave + Math.floor((rootIndex + 4) / 12);
  const thirdName = noteSequence[thirdIndex];
  const third: Note = {
    name: thirdName,
    octave: thirdOctave,
    frequency: getFrequency(thirdName, thirdOctave),
  };

  // Perfect fifth is 7 semitones above root
  const fifthIndex = (rootIndex + 7) % 12;
  const fifthOctave = octave + Math.floor((rootIndex + 7) / 12);
  const fifthName = noteSequence[fifthIndex];
  const fifth: Note = {
    name: fifthName,
    octave: fifthOctave,
    frequency: getFrequency(fifthName, fifthOctave),
  };

  return {
    name: rootName,
    notes: [root, third, fifth],
    type: 'major',
  };
};

// Helper function to create chord inversions
const createChordInversions = (rootName: string, octave: number): Chord[] => {
  const baseChord = createMajorChord(rootName, octave);
  const [root, third, fifth] = baseChord.notes;

  // Root position (e.g., C-E-G)
  const rootPosition: Chord = {
    name: rootName,
    notes: [root, third, fifth],
    type: 'major',
  };

  // First inversion (e.g., E-G-C)
  // Move root up an octave
  const firstInversion: Chord = {
    name: rootName,
    notes: [
      third,
      fifth,
      { ...root, octave: root.octave + 1, frequency: getFrequency(root.name, root.octave + 1) },
    ],
    type: 'major',
  };

  // Second inversion (e.g., G-C-E)
  // Move root and third up an octave
  const secondInversion: Chord = {
    name: rootName,
    notes: [
      fifth,
      { ...root, octave: root.octave + 1, frequency: getFrequency(root.name, root.octave + 1) },
      { ...third, octave: third.octave + 1, frequency: getFrequency(third.name, third.octave + 1) },
    ],
    type: 'major',
  };

  return [rootPosition, firstInversion, secondInversion];
};

// Helper function to generate all major chords with inversions
const generateMajorChordsWithInversions = (rootNotes: string[], octave: number): Chord[] => {
  const allChords: Chord[] = [];

  for (const rootNote of rootNotes) {
    const inversions = createChordInversions(rootNote, octave);
    allChords.push(...inversions);
  }

  return allChords;
};

// Lesson 1: Middle C to B (C4 to B4) - "The Staff Basics"
const lesson1: Lesson = {
  id: 'lesson-1-c4-b4',
  name: '1: Treble Clef Basics',
  description: 'Learn the fundamental notes on the treble staff from Middle C (C4) to B4',
  mode: 'music',
  notes: generateNotesForOctave(4),
};

// Lesson 2: Upper register (C5 to B5) - "Higher Notes"
const lesson2: Lesson = {
  id: 'lesson-2-c5-b5',
  name: '2: Treble Clef Higher Notes',
  description: 'Practice the higher notes on the treble staff from C5 to B5',
  mode: 'music',
  notes: generateNotesForOctave(5),
};

// Lesson 3: Lower register (C3 to B3) - "Lower Notes"
const lesson3: Lesson = {
  id: 'lesson-3-c3-b3',
  name: '3: Treble Clef Lower Notes',
  description: 'Master the lower notes on the treble staff from C3 to B3',
  mode: 'music',
  notes: generateNotesForOctave(3),
};

// Lesson 4: Sharps and flats in middle register (C4 to B4)
const lesson4: Lesson = {
  id: 'lesson-4-accidentals-c4-b4',
  name: '4: Sharps & Flats (Middle)',
  description: 'Master sharps and flats on the treble staff from C4 to B4',
  mode: 'music',
  notes: generateAccidentalsForOctave(4),
};

// Lesson 5: Sharps and flats in upper register (C5 to B5)
const lesson5: Lesson = {
  id: 'lesson-5-accidentals-c5-b5',
  name: '5: Sharps & Flats (Higher)',
  description: 'Practice sharps and flats on the treble staff from C5 to B5',
  mode: 'music',
  notes: generateAccidentalsForOctave(5),
};

// Lesson 6: Sharps and flats in lower register (C3 to B3)
const lesson6: Lesson = {
  id: 'lesson-6-accidentals-c3-b3',
  name: '6: Sharps & Flats (Lower)',
  description: 'Learn sharps and flats on the treble staff from C3 to B3',
  mode: 'music',
  notes: generateAccidentalsForOctave(3),
};

// Lesson 7: Bass Clef Basics (E2 to D3)
const lesson7: Lesson = {
  id: 'lesson-7-bass-e2-d3',
  name: '7: Bass Clef Basics',
  description: 'Learn the fundamental notes on the bass staff from E2 to D3',
  mode: 'music',
  notes: generateBassClefNotes(2),
};

// Lesson 8: Bass Clef Higher Notes (E3 to D4)
const lesson8: Lesson = {
  id: 'lesson-8-bass-e3-d4',
  name: '8: Bass Clef Higher Notes',
  description: 'Practice the higher notes on the bass staff from E3 to D4',
  mode: 'music',
  notes: generateBassClefNotes(3),
};

// Lesson 9: Bass Clef Lower Notes (E1 to D2)
const lesson9: Lesson = {
  id: 'lesson-9-bass-e1-d2',
  name: '9: Bass Clef Lower Notes',
  description: 'Master the lower notes on the bass staff from E1 to D2',
  mode: 'music',
  notes: generateBassClefNotes(1),
};

// Lesson 10: Bass Clef Sharps & Flats (Middle E2 to D3)
const lesson10: Lesson = {
  id: 'lesson-10-bass-accidentals-e2-d3',
  name: '10: Bass Sharps & Flats (Middle)',
  description: 'Master sharps and flats on the bass staff from E2 to D3',
  mode: 'music',
  notes: generateBassClefAccidentals(2),
};

// Lesson 11: Bass Clef Sharps & Flats (Higher E3 to D4)
const lesson11: Lesson = {
  id: 'lesson-11-bass-accidentals-e3-d4',
  name: '11: Bass Sharps & Flats (Higher)',
  description: 'Practice sharps and flats on the bass staff from E3 to D4',
  mode: 'music',
  notes: generateBassClefAccidentals(3),
};

// Lesson 12: Bass Clef Sharps & Flats (Lower E1 to D2)
const lesson12: Lesson = {
  id: 'lesson-12-bass-accidentals-e1-d2',
  name: '12: Bass Sharps & Flats (Lower)',
  description: 'Learn sharps and flats on the bass staff from E1 to D2',
  mode: 'music',
  notes: generateBassClefAccidentals(1),
};

// Lesson 13: Major Chords - Natural Notes (C, D, E, F, G, A, B)
const lesson13: Lesson = {
  id: 'lesson-13-major-chords-natural',
  name: '13: Major Chords (Natural)',
  description: 'Learn major chords built on natural notes (C, D, E, F, G, A, B) with all inversions',
  mode: 'music',
  chords: generateMajorChordsWithInversions(['C', 'D', 'E', 'F', 'G', 'A', 'B'], 4),
};

// Lesson 14: Major Chords - Sharp Notes (C#, D#, F#, G#, A#)
const lesson14: Lesson = {
  id: 'lesson-14-major-chords-sharp',
  name: '14: Major Chords (Sharps)',
  description: 'Practice major chords built on sharp notes (C#, D#, F#, G#, A#) with all inversions',
  mode: 'music',
  chords: generateMajorChordsWithInversions(['C#', 'D#', 'F#', 'G#', 'A#'], 4),
};

// Lesson 15: Major Chords - Flat Notes (Db, Eb, Gb, Ab, Bb)
const lesson15: Lesson = {
  id: 'lesson-15-major-chords-flat',
  name: '15: Major Chords (Flats)',
  description: 'Master major chords built on flat notes (Db, Eb, Gb, Ab, Bb) with all inversions',
  mode: 'music',
  chords: generateMajorChordsWithInversions(['Db', 'Eb', 'Gb', 'Ab', 'Bb'], 4),
};

// Helper function to generate math problems
const generateMathProblems = (
  operation: string,
  range1: [number, number],
  range2: [number, number],
  count: number = 20
): MathProblem[] => {
  const problems: MathProblem[] = [];
  const [min1, max1] = range1;
  const [min2, max2] = range2;

  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
    const b = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;

    let question: string;
    let answer: string;

    switch (operation) {
      case 'addition':
        question = `${a} + ${b}`;
        answer = String(a + b);
        break;
      case 'subtraction':
        question = `${a} - ${b}`;
        answer = String(a - b);
        break;
      case 'multiplication':
        question = `${a} × ${b}`;
        answer = String(a * b);
        break;
      case 'division':
        // Ensure division results in whole numbers
        const product = a * b;
        question = `${product} / ${b}`;
        answer = String(a);
        break;
      default:
        question = `${a} + ${b}`;
        answer = String(a + b);
    }

    problems.push({ question, answer, operation });
  }

  return problems;
};

// Helper function to generate multiplication table problems for a specific number
const generateMultiplicationTable = (
  tableNumber: number
): MathProblem[] => {
  const problems: MathProblem[] = [];

  // Generate exactly 11 problems: N × 0, N × 1, ..., N × 10
  for (let multiplier = 0; multiplier <= 10; multiplier++) {
    const question = `${tableNumber} × ${multiplier}`;
    const answer = String(tableNumber * multiplier);

    problems.push({ question, answer, operation: 'multiplication' });
  }

  return problems;
};

// Math Lesson 1: Addition (0-10)
const mathLesson1: Lesson = {
  id: 'math-lesson-1-addition-basic',
  name: 'M1: Addition (0-10)',
  description: 'Practice basic addition with numbers from 0 to 10',
  mode: 'math',
  mathProblems: generateMathProblems('addition', [0, 10], [0, 10], 20),
};

// Math Lesson 2: Addition (0-20)
const mathLesson2: Lesson = {
  id: 'math-lesson-2-addition-medium',
  name: 'M2: Addition (0-20)',
  description: 'Practice addition with numbers from 0 to 20',
  mode: 'math',
  mathProblems: generateMathProblems('addition', [0, 20], [0, 20], 20),
};

// Math Lesson 3: Addition (0-100)
const mathLesson3: Lesson = {
  id: 'math-lesson-3-addition-advanced',
  name: 'M3: Addition (0-100)',
  description: 'Practice addition with larger numbers from 0 to 100',
  mode: 'math',
  mathProblems: generateMathProblems('addition', [0, 100], [0, 100], 20),
};

// Math Lesson 4: Subtraction (0-10)
const mathLesson4: Lesson = {
  id: 'math-lesson-4-subtraction-basic',
  name: 'M4: Subtraction (0-10)',
  description: 'Practice basic subtraction with numbers from 0 to 10',
  mode: 'math',
  mathProblems: generateMathProblems('subtraction', [0, 10], [0, 10], 20),
};

// Math Lesson 5: Subtraction (0-20)
const mathLesson5: Lesson = {
  id: 'math-lesson-5-subtraction-medium',
  name: 'M5: Subtraction (0-20)',
  description: 'Practice subtraction with numbers from 0 to 20',
  mode: 'math',
  mathProblems: generateMathProblems('subtraction', [0, 20], [0, 20], 20),
};

// Math Lesson 6: Subtraction (0-100)
const mathLesson6: Lesson = {
  id: 'math-lesson-6-subtraction-advanced',
  name: 'M6: Subtraction (0-100)',
  description: 'Practice subtraction with larger numbers from 0 to 100',
  mode: 'math',
  mathProblems: generateMathProblems('subtraction', [0, 100], [0, 100], 20),
};

// Math Lesson 7: Multiplication Table of 1
const mathLesson7: Lesson = {
  id: 'math-lesson-7-multiplication-table-1',
  name: 'M7: Multiplication Table of 1',
  description: 'Practice the multiplication table of 1',
  mode: 'math',
  mathProblems: generateMultiplicationTable(1),
};

// Math Lesson 8: Multiplication Table of 2
const mathLesson8: Lesson = {
  id: 'math-lesson-8-multiplication-table-2',
  name: 'M8: Multiplication Table of 2',
  description: 'Practice the multiplication table of 2',
  mode: 'math',
  mathProblems: generateMultiplicationTable(2),
};

// Math Lesson 9: Multiplication Table of 3
const mathLesson9: Lesson = {
  id: 'math-lesson-9-multiplication-table-3',
  name: 'M9: Multiplication Table of 3',
  description: 'Practice the multiplication table of 3',
  mode: 'math',
  mathProblems: generateMultiplicationTable(3),
};

// Math Lesson 10: Multiplication Table of 4
const mathLesson10: Lesson = {
  id: 'math-lesson-10-multiplication-table-4',
  name: 'M10: Multiplication Table of 4',
  description: 'Practice the multiplication table of 4',
  mode: 'math',
  mathProblems: generateMultiplicationTable(4),
};

// Math Lesson 11: Multiplication Table of 5
const mathLesson11: Lesson = {
  id: 'math-lesson-11-multiplication-table-5',
  name: 'M11: Multiplication Table of 5',
  description: 'Practice the multiplication table of 5',
  mode: 'math',
  mathProblems: generateMultiplicationTable(5),
};

// Math Lesson 12: Multiplication Table of 6
const mathLesson12: Lesson = {
  id: 'math-lesson-12-multiplication-table-6',
  name: 'M12: Multiplication Table of 6',
  description: 'Practice the multiplication table of 6',
  mode: 'math',
  mathProblems: generateMultiplicationTable(6),
};

// Math Lesson 13: Multiplication Table of 7
const mathLesson13: Lesson = {
  id: 'math-lesson-13-multiplication-table-7',
  name: 'M13: Multiplication Table of 7',
  description: 'Practice the multiplication table of 7',
  mode: 'math',
  mathProblems: generateMultiplicationTable(7),
};

// Math Lesson 14: Multiplication Table of 8
const mathLesson14: Lesson = {
  id: 'math-lesson-14-multiplication-table-8',
  name: 'M14: Multiplication Table of 8',
  description: 'Practice the multiplication table of 8',
  mode: 'math',
  mathProblems: generateMultiplicationTable(8),
};

// Math Lesson 15: Multiplication Table of 9
const mathLesson15: Lesson = {
  id: 'math-lesson-15-multiplication-table-9',
  name: 'M15: Multiplication Table of 9',
  description: 'Practice the multiplication table of 9',
  mode: 'math',
  mathProblems: generateMultiplicationTable(9),
};

// Math Lesson 16: Multiplication Table of 10
const mathLesson16: Lesson = {
  id: 'math-lesson-16-multiplication-table-10',
  name: 'M16: Multiplication Table of 10',
  description: 'Practice the multiplication table of 10',
  mode: 'math',
  mathProblems: generateMultiplicationTable(10),
};

// Math Lesson 17: Division (0-10)
const mathLesson17: Lesson = {
  id: 'math-lesson-17-division-basic',
  name: 'M17: Division (0-10)',
  description: 'Practice basic division with numbers from 0 to 10',
  mode: 'math',
  mathProblems: generateMathProblems('division', [1, 10], [1, 10], 20),
};

// Math Lesson 18: Division (0-12)
const mathLesson18: Lesson = {
  id: 'math-lesson-18-division-medium',
  name: 'M18: Division (0-12)',
  description: 'Practice division with numbers from 0 to 12',
  mode: 'math',
  mathProblems: generateMathProblems('division', [1, 12], [1, 12], 20),
};

// Clock Lesson 1: Whole Hours
const clockLesson1: Lesson = {
  id: 'clock-lesson-1-whole-hours',
  name: 'C1: Whole Hours',
  description: 'Learn to read whole hours on an analog clock (1:00, 2:00, etc.)',
  mode: 'clock',
  clockProblems: generateWholeHourProblems('no'),
};

// Clock Lesson 2: Half Past
const clockLesson2: Lesson = {
  id: 'clock-lesson-2-half-past',
  name: 'C2: Half Past',
  description: 'Learn to read half past times on an analog clock (:30)',
  mode: 'clock',
  clockProblems: generateHalfPastProblems('no'),
};

// Clock Lesson 3: Quarter Past
const clockLesson3: Lesson = {
  id: 'clock-lesson-3-quarter-past',
  name: 'C3: Quarter Past',
  description: 'Learn to read quarter past times on an analog clock (:15)',
  mode: 'clock',
  clockProblems: generateQuarterPastProblems('no'),
};

// Clock Lesson 4: Quarter To
const clockLesson4: Lesson = {
  id: 'clock-lesson-4-quarter-to',
  name: 'C4: Quarter To',
  description: 'Learn to read quarter to times on an analog clock (:45)',
  mode: 'clock',
  clockProblems: generateQuarterToProblems('no'),
};

// Clock Lesson 5: Five Minutes Past/To
const clockLesson5: Lesson = {
  id: 'clock-lesson-5-five-minutes',
  name: 'C5: Five Minutes Past/To',
  description: 'Learn to read times at 5 minutes past and 5 minutes to the hour (:05, :55)',
  mode: 'clock',
  clockProblems: generateFiveMinuteProblems([5, 55], 'no'),
};

// Clock Lesson 6: Ten Minutes Past/To
const clockLesson6: Lesson = {
  id: 'clock-lesson-6-ten-minutes',
  name: 'C6: Ten Minutes Past/To',
  description: 'Learn to read times at 10 minutes past and 10 minutes to the hour (:10, :50)',
  mode: 'clock',
  clockProblems: generateFiveMinuteProblems([10, 50], 'no'),
};

// Clock Lesson 7: Twenty Minutes Past/To Half
const clockLesson7: Lesson = {
  id: 'clock-lesson-7-twenty-minutes',
  name: 'C7: Twenty Minutes Past/Forty Past',
  description: 'Learn to read times at 20 and 40 minutes past the hour (:20, :40)',
  mode: 'clock',
  clockProblems: generateFiveMinuteProblems([20, 40], 'no'),
};

// Clock Lesson 8: Twenty-Five/Thirty-Five Minutes
const clockLesson8: Lesson = {
  id: 'clock-lesson-8-twentyfive-thirtyfive',
  name: 'C8: Twenty-Five/Thirty-Five Past',
  description: 'Learn to read times at 25 and 35 minutes past the hour (:25, :35)',
  mode: 'clock',
  clockProblems: generateFiveMinuteProblems([25, 35], 'no'),
};

// All available lessons
export const LESSONS: Lesson[] = [
  // Music lessons
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
  lesson9,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
  // Math lessons
  mathLesson1,
  mathLesson2,
  mathLesson3,
  mathLesson4,
  mathLesson5,
  mathLesson6,
  mathLesson7,
  mathLesson8,
  mathLesson9,
  mathLesson10,
  mathLesson11,
  mathLesson12,
  mathLesson13,
  mathLesson14,
  mathLesson15,
  mathLesson16,
  mathLesson17,
  mathLesson18,
  // Clock lessons
  clockLesson1,
  clockLesson2,
  clockLesson3,
  clockLesson4,
  clockLesson5,
  clockLesson6,
  clockLesson7,
  clockLesson8,
];

// Get a lesson by ID
export const getLessonById = (id: string): Lesson | undefined => {
  return LESSONS.find(lesson => lesson.id === id);
};
