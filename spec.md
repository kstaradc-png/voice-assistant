# सारथी – Voice Assistant for Visually Impaired

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Pure black, high-contrast accessibility UI
- Large centered mic button with "Tap to Speak" label
- Blue audio waveform animation at bottom (activates on voice)
- Wake word detection: "सुनो जी" triggers listening mode
- Web Speech API voice recognition (Hindi + English)
- Text-to-speech responses with voice selection
- Voice commands: time, date, greetings, help/tutorial
- Camera section with live feed and TensorFlow.js object detection (COCO-SSD)
- Guided voice tutorial for new users (step-by-step commands)
- Simulated calling UI (voice command: "राज को कॉल करो")
- Simulated messaging UI (WhatsApp/SMS demo)
- Settings: voice selection (male/female), language toggle Hindi/English
- Nav: Home, Features, Guide, About, Language Toggle
- Feature cards: Offline Access, Voice Control, Camera Vision, Daily Assistant
- "How It Works" section with numbered steps
- Footer with links
- Fully responsive, ARIA-accessible markup

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal actor (store user voice settings, tutorial progress)
2. Frontend: full single-page app with sections
   - Header with nav and language toggle
   - Hero: mic button + waveform animation
   - Features section
   - How It Works
   - Voice Tutorial modal
   - Camera/Object Detection panel
   - Simulated Calling overlay
   - Settings panel
   - Footer
3. Web Speech API integration for recognition + synthesis
4. TensorFlow.js COCO-SSD for camera object detection
5. Wake word detection loop
6. Accessibility: ARIA labels, high contrast, keyboard nav
