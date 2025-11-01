import { Lesson, Note } from '../types';
import { getFrequency } from './noteUtils';

// Helper function to generate notes for a specific octave range
const generateNotesForOctave = (octave: number): Note[] => {
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return noteNames.map(name => ({
    name,
    octave,
    frequency: getFrequency(name, octave),
  }));
};

// Lesson 1: Middle C to B (C4 to B4) - "The Staff Basics"
const lesson1: Lesson = {
  id: 'lesson-1-c4-b4',
  name: 'Treble Clef Basics',
  description: 'Learn the fundamental notes on the treble staff from Middle C (C4) to B4',
  notes: generateNotesForOctave(4),
};

// Lesson 2: Upper register (C5 to B5) - "Higher Notes"
const lesson2: Lesson = {
  id: 'lesson-2-c5-b5',
  name: 'Treble Clef Higher Notes',
  description: 'Practice the higher notes on the treble staff from C5 to B5',
  notes: generateNotesForOctave(5),
};

// Lesson 3: Lower register (C3 to B3) - "Lower Notes"
const lesson3: Lesson = {
  id: 'lesson-3-c3-b3',
  name: 'Treble Clef Lower Notes',
  description: 'Master the lower notes on the treble staff from C3 to B3',
  notes: generateNotesForOctave(3),
};

// All available lessons
export const LESSONS: Lesson[] = [lesson1, lesson2, lesson3];

// Get a lesson by ID
export const getLessonById = (id: string): Lesson | undefined => {
  return LESSONS.find(lesson => lesson.id === id);
};
