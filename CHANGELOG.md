# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 17-05-2026

### Added
- **Colorful Animal Jigsaw Assets:** Introduced a new `ColorfulAnimal.vue` component containing an expansive roster of 24 vibrantly colored, "kawaii-style" multi-layered SVG animals (Cat, Dog, Rabbit, Frog, Pig, Lion, Elephant, Penguin, Fox, Bear, Monkey, Owl, Duck, Turtle, Fish, Ladybug, Cow, Sheep, Horse, Hippo, Rhino, Crocodile, Tiger, and Zebra). 
- **Premium 3D Puzzle Styling:** Upgraded the visual style of all jigsaw puzzle pieces by adding a faux-3D bevel and emboss effect using layered, translated SVG strokes, giving the pieces a premium tactile appearance. 

### Fixed
- **Jigsaw Puzzle Tabs Clipping:** Fixed a CSS bug where `overflow: hidden` on `.board`, `.board-slot`, and `.piece-tray-item` containers was visually cropping the interlocking jigsaw tabs. Pieces now correctly display their outward tabs across all 5 difficulty phases.
- **Jigsaw Phase Progression:** Fixed an issue where completing a puzzle did not notify the global progress store. The game now correctly calls `progressStore.updateStats`, allowing the difficulty phase to dynamically scale up automatically.
- **Statistics View Missing Game:** Added `fun-animal-jigsaw` to the initial dictionary state in `useProgressStore.ts` so it correctly renders in the Admin Statistics table and can be manually overridden by parents/clinicians.

### Changed
- **Jigsaw Animal Shuffling:** Replaced the static, sequential animal progression in `AnimalJigsaw` with a dynamic `playQueue`. The pool of 24 animals is now randomized via a Fisher-Yates shuffle every time a session begins (and automatically reshuffles when exhausted) to ensure unpredictable gameplay.
- Refactored `AnimalJigsaw` to render the newly crafted `ColorfulAnimal` assets inside its dynamic `<clipPath>` templates, replacing the old monochromatic placeholders.
- Updated `README.md` to properly document the Fun Games category, the recent Animal Jigsaw overhaul, and the roadmap for upcoming puzzle features.

## [0.0.1] - 17-05-2026

### Added
- **Initial Open-Source Release:** Launch of "YAGC — Yet Another Game Collection".
- **Fun Games Category:** Elevated casual puzzles to a dedicated, first-class tab in the Global Menu.
- **Therapeutic Curriculum:** 26 clinical cognitive-training modules across 3 difficulty tiers designed for children with ASD.
- **ABA Prompt Fading Engine:** Built-in auto-scaffolding (Full → Partial → None) utilizing time-delay mechanisms.
- **Procedural Generation:** Dynamic SVG asset generation and endless procedural levels to prevent memorization.
- **Web Speech API Integration:** Fully voiced instructions for every module.
- **Touch-Optimized UX:** Custom drag-and-drop engine designed specifically for the LG StanbyME 27" webOS touchscreen.
- **Persistent Statistics:** Cross-session clinical progress tracking and adaptive difficulty scaling.
