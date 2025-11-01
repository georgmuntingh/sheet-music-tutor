import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Accidental, Voice } from 'vexflow';
import { Note } from '../types';
import { getClef } from '../utils/noteUtils';

interface MusicNotationProps {
  note: Note;
  width?: number;
  height?: number;
}

export const MusicNotation: React.FC<MusicNotationProps> = ({
  note,
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

    // Determine clef based on note
    const clef = getClef(note);

    // Create stave
    const stave = new Stave(10, 40, width - 20);
    stave.addClef(clef);
    stave.setContext(context).draw();

    // Handle accidentals (sharps and flats)
    const hasAccidental = note.name.includes('#') || note.name.includes('b');
    const baseNote = note.name.replace('#', '').replace('b', '');
    const accidental = note.name.includes('#') ? '#' : note.name.includes('b') ? 'b' : null;

    // Create the stave note
    const keys = [`${baseNote}/${note.octave}`];
    const staveNote = new StaveNote({
      keys,
      duration: 'w', // Whole note
      clef,
    });

    // Add accidental if needed
    if (hasAccidental && accidental) {
      staveNote.addModifier(new Accidental(accidental), 0);
    }

    // Create a voice and add the note
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([staveNote]);

    // Format and draw
    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], width - 100);

    staveNote.setContext(context).setStave(stave);
    staveNote.draw();

  }, [note, width, height]);

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
