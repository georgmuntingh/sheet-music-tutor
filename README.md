# 🎹 Piano Sheet Music Tutor

An interactive web application for learning to read piano sheet music using spaced repetition and real-time pitch detection.

## Features

- **Interactive Music Notation**: Display notes on a proper music staff using VexFlow
- **Real-time Pitch Detection**: Recognizes piano notes played on a physical piano using your microphone
- **Spaced Repetition Learning**: Implements the Leitner system with 5 boxes for optimal learning
- **Progress Tracking**: Visualize your learning progress and accuracy over time
- **Piano-Optimized Recognition**: Specialized pitch detection that handles the complex harmonic content of piano notes
- **Persistent Progress**: Your learning progress is automatically saved to browser local storage

## How It Works

### Flash Card System

The app uses a spaced repetition system (Leitner method) to help you learn efficiently:

1. **5 Learning Boxes**: Cards move between boxes based on your performance
   - Box 1: Review immediately
   - Box 2: Review after 1 day
   - Box 3: Review after 3 days
   - Box 4: Review after 7 days
   - Box 5: Review after 14 days

2. **Smart Progression**:
   - Play the correct note → card moves to the next box
   - Play an incorrect note → card moves back to box 1
   - New cards are introduced when no existing cards are due for review

### Pitch Detection

The app uses advanced pitch detection optimized for piano:

- **Autocorrelation Algorithm**: Uses the Pitchy library for accurate fundamental frequency detection
- **Consensus Detection**: Requires multiple consistent detections to confirm a note
- **Piano-Specific Tuning**: Optimized buffer size and clarity thresholds for piano harmonics
- **Wide Range Support**: Recognizes notes from C2 to C6 (expandable)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A physical piano or keyboard
- A microphone (built-in or external)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sheet-music-tutor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Grant Microphone Access**: When you click "Start Listening", the browser will request microphone access. Allow this for the app to work.

2. **Play the Note**: Look at the music notation displayed on the screen and play the corresponding note on your piano.

3. **Get Feedback**: The app will detect your note and provide immediate feedback:
   - ✓ Correct: The card advances to the next box
   - ✗ Incorrect: The card returns to box 1, and you'll see the correct answer

4. **Track Progress**: Click "Show Progress" to see:
   - Active cards in each box
   - Overall accuracy
   - Total reviews completed
   - Cards due for review

5. **Continue Learning**: The app automatically selects the next card based on:
   - Cards due for review (prioritized)
   - New cards (when no reviews are due)

## Tips for Best Results

- **Quiet Environment**: Use the app in a quiet room for better pitch detection
- **Clear Notes**: Play notes clearly and hold them for at least 0.5 seconds
- **Microphone Placement**: Position your microphone close to the piano for better recognition
- **Regular Practice**: Come back daily to review cards that are due
- **Patience**: The spaced repetition system is designed for long-term retention, not quick memorization

## Technical Details

### Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **VexFlow** for music notation rendering
- **Pitchy** for pitch detection using autocorrelation
- **Web Audio API** for microphone input processing

### Architecture

```
src/
├── components/          # React components
│   ├── FlashCard.tsx   # Individual flash card display
│   ├── MusicNotation.tsx # VexFlow music notation
│   └── ProgressDisplay.tsx # Learning statistics
├── utils/              # Core logic
│   ├── leitnerSystem.ts    # Spaced repetition algorithm
│   ├── noteUtils.ts        # Musical note utilities
│   ├── pitchDetection.ts   # Piano pitch detection
│   └── storage.ts          # Local storage management
└── types.ts            # TypeScript type definitions
```

### Future Enhancements

The current version supports individual notes. Planned features include:

- **Chord Recognition**: Support for 2+ simultaneous notes
- **Customizable Note Ranges**: Allow users to select specific octaves or note ranges
- **Different Clefs**: Practice with bass clef, treble clef, or both
- **Rhythm Training**: Add timing elements to the practice
- **Statistics Dashboard**: More detailed analytics and progress charts
- **Custom Flash Card Sets**: Create your own practice sets
- **Mobile Support**: Optimize for tablet and mobile devices

## Troubleshooting

### Microphone Not Working
- Ensure you've granted microphone permissions in your browser
- Check that your microphone is working in other applications
- Try refreshing the page and allowing permissions again

### Notes Not Being Recognized
- Ensure you're in a quiet environment
- Play notes clearly and hold them for at least 0.5 seconds
- Try moving your microphone closer to the piano
- Make sure you're playing within the supported range (C2-C6)

### Progress Not Saving
- Check that your browser allows local storage
- Try a different browser
- Clear browser cache and reload the page

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
