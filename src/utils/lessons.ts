import { Lesson, Note } from '../types';
import { getFrequency } from './noteUtils';

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

// Lesson 1: Middle C to B (C4 to B4) - "The Staff Basics"
const lesson1: Lesson = {
  id: 'lesson-1-c4-b4',
  name: '1: Treble Clef Basics',
  description: 'Learn the fundamental notes on the treble staff from Middle C (C4) to B4',
  notes: generateNotesForOctave(4),
};

// Lesson 2: Upper register (C5 to B5) - "Higher Notes"
const lesson2: Lesson = {
  id: 'lesson-2-c5-b5',
  name: '2: Treble Clef Higher Notes',
  description: 'Practice the higher notes on the treble staff from C5 to B5',
  notes: generateNotesForOctave(5),
};

// Lesson 3: Lower register (C3 to B3) - "Lower Notes"
const lesson3: Lesson = {
  id: 'lesson-3-c3-b3',
  name: '3: Treble Clef Lower Notes',
  description: 'Master the lower notes on the treble staff from C3 to B3',
  notes: generateNotesForOctave(3),
};

// Lesson 4: Sharps and flats in middle register (C4 to B4)
const lesson4: Lesson = {
  id: 'lesson-4-accidentals-c4-b4',
  name: '4: Sharps & Flats (Middle)',
  description: 'Master sharps and flats on the treble staff from C4 to B4',
  notes: generateAccidentalsForOctave(4),
};

// Lesson 5: Sharps and flats in upper register (C5 to B5)
const lesson5: Lesson = {
  id: 'lesson-5-accidentals-c5-b5',
  name: '5: Sharps & Flats (Higher)',
  description: 'Practice sharps and flats on the treble staff from C5 to B5',
  notes: generateAccidentalsForOctave(5),
};

// Lesson 6: Sharps and flats in lower register (C3 to B3)
const lesson6: Lesson = {
  id: 'lesson-6-accidentals-c3-b3',
  name: '6: Sharps & Flats (Lower)',
  description: 'Learn sharps and flats on the treble staff from C3 to B3',
  notes: generateAccidentalsForOctave(3),
};

// Lesson 7: Bass Clef Basics (E2 to D3)
const lesson7: Lesson = {
  id: 'lesson-7-bass-e2-d3',
  name: '7: Bass Clef Basics',
  description: 'Learn the fundamental notes on the bass staff from E2 to D3',
  notes: generateBassClefNotes(2),
};

// Lesson 8: Bass Clef Higher Notes (E3 to D4)
const lesson8: Lesson = {
  id: 'lesson-8-bass-e3-d4',
  name: '8: Bass Clef Higher Notes',
  description: 'Practice the higher notes on the bass staff from E3 to D4',
  notes: generateBassClefNotes(3),
};

// Lesson 9: Bass Clef Lower Notes (E1 to D2)
const lesson9: Lesson = {
  id: 'lesson-9-bass-e1-d2',
  name: '9: Bass Clef Lower Notes',
  description: 'Master the lower notes on the bass staff from E1 to D2',
  notes: generateBassClefNotes(1),
};

// Lesson 10: Bass Clef Sharps & Flats (Middle E2 to D3)
const lesson10: Lesson = {
  id: 'lesson-10-bass-accidentals-e2-d3',
  name: '10: Bass Sharps & Flats (Middle)',
  description: 'Master sharps and flats on the bass staff from E2 to D3',
  notes: generateBassClefAccidentals(2),
};

// Lesson 11: Bass Clef Sharps & Flats (Higher E3 to D4)
const lesson11: Lesson = {
  id: 'lesson-11-bass-accidentals-e3-d4',
  name: '11: Bass Sharps & Flats (Higher)',
  description: 'Practice sharps and flats on the bass staff from E3 to D4',
  notes: generateBassClefAccidentals(3),
};

// Lesson 12: Bass Clef Sharps & Flats (Lower E1 to D2)
const lesson12: Lesson = {
  id: 'lesson-12-bass-accidentals-e1-d2',
  name: '12: Bass Sharps & Flats (Lower)',
  description: 'Learn sharps and flats on the bass staff from E1 to D2',
  notes: generateBassClefAccidentals(1),
};

// All available lessons
export const LESSONS: Lesson[] = [
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
];

// Get a lesson by ID
export const getLessonById = (id: string): Lesson | undefined => {
  return LESSONS.find(lesson => lesson.id === id);
};
