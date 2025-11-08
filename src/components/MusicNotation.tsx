import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Accidental, Voice } from 'vexflow';
import { Note, Chord } from '../types';
import { getClef } from '../utils/noteUtils';

interface MusicNotationProps {
  note?: Note;
  chord?: Chord;
  lessonId?: string;
  width?: number;
  height?: number;
}

export const MusicNotation: React.FC<MusicNotationProps> = ({
  note,
  chord,
  lessonId,
  width = 400,
  height = 200,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create VexFlow renderer
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    // Determine clef based on note/chord and lesson
    const referenceNote = chord ? chord.notes[0] : note;
    if (!referenceNote) return;

    const clef = getClef(referenceNote, lessonId);

    // Create stave
    const stave = new Stave(10, 40, width - 20);
    stave.addClef(clef);
    stave.setContext(context).draw();

    let staveNote: StaveNote;

    if (chord) {
      // Render chord (multiple notes)
      const keys: string[] = [];
      const accidentals: { index: number; accidental: string }[] = [];

      // Process each note in the chord
      chord.notes.forEach((n, index) => {
        const hasAccidental = n.name.includes('#') || n.name.includes('b');
        const baseNote = n.name.replace('#', '').replace('b', '');
        keys.push(`${baseNote}/${n.octave}`);

        if (hasAccidental) {
          const accidental = n.name.includes('#') ? '#' : 'b';
          accidentals.push({ index, accidental });
        }
      });

      // Create the stave note with all chord notes
      staveNote = new StaveNote({
        keys,
        duration: 'w', // Whole note
        clef,
      });

      // Add accidentals
      accidentals.forEach(({ index, accidental }) => {
        staveNote.addModifier(new Accidental(accidental), index);
      });
    } else if (note) {
      // Render single note
      const hasAccidental = note.name.includes('#') || note.name.includes('b');
      const baseNote = note.name.replace('#', '').replace('b', '');
      const accidental = note.name.includes('#') ? '#' : note.name.includes('b') ? 'b' : null;

      // Create the stave note
      const keys = [`${baseNote}/${note.octave}`];
      staveNote = new StaveNote({
        keys,
        duration: 'w', // Whole note
        clef,
      });

      // Add accidental if needed
      if (hasAccidental && accidental) {
        staveNote.addModifier(new Accidental(accidental), 0);
      }
    } else {
      return;
    }

    // Create a voice and add the note
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([staveNote]);

    // Format and draw
    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], width - 100);

    staveNote.setContext(context).setStave(stave);
    staveNote.draw();

  }, [note, chord, lessonId, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: '0 auto',
      }}
    />
  );
};
