# Spelling Bee Practice

A fun, kid-friendly web app for 2nd graders to practice their spelling bee words. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **220 spelling words** from the School Competitions 2026 (2nd Grade)
- **Text-to-Speech** pronounces each word aloud
- **On-screen keyboard** for letter-by-letter spelling
- **Voice input** (optional) via Web Speech API
- **Repeat Word button** to hear the word again
- **Instant feedback** with sounds for correct/incorrect letters
- **Results screen** with star rating and word-by-word breakdown
- **Confetti celebration** for good scores
- **Responsive design** works on mobile, tablet, and desktop

## How to Run Locally

### Option 1: Direct file open
Open `index.html` in your browser. All features work except speech recognition (which requires HTTPS or localhost).

### Option 2: Local server (recommended)
```bash
# Python 3
python3 -m http.server 8080

# Then open http://localhost:8080
```

### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live" from the status bar.

## How It Works

1. Click **Start Practice** to begin a session of 10 random words
2. The app **speaks the word** aloud
3. A **5-second countdown** gives you time to get ready
4. **Spell the word** letter by letter using the on-screen keyboard or your physical keyboard
5. After spelling, see which letters were **correct or incorrect**
6. Click **Next Word** to continue
7. After 10 words, see your **score and star rating**

## Tech Stack

- **HTML5** — semantic markup, accessibility attributes
- **CSS3** — custom properties, grid layout, animations, responsive design
- **JavaScript** — vanilla ES5, no frameworks or dependencies
- **Web Speech API** — SpeechSynthesis (text-to-speech) + SpeechRecognition (voice input)
- **Web Audio API** — procedural sound effects (no audio files)

## Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Core app | Yes | Yes | Yes | Yes |
| Text-to-Speech | Yes | Yes | Yes | Yes |
| Voice input | Yes | Yes | Partial | No |
| Sound effects | Yes | Yes | Yes | Yes |

## Deployment

The app deploys automatically to GitHub Pages on push to `main` via GitHub Actions. No build step required.

## Project Structure

```
├── index.html          # Single-page app shell
├── css/
│   └── styles.css      # Kid-friendly design system
├── js/
│   ├── words.js        # Word list and selection logic
│   ├── audio.js        # Web Audio API sound effects
│   ├── speech.js       # Speech synthesis and recognition
│   ├── ui.js           # DOM manipulation and rendering
│   └── app.js          # Main application controller
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
└── README.md
```
