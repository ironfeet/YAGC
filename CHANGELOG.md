# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.9] - 02-06-2026

### Security & CI
- **CodeQL Integration:** Switched from "Default Setup" to an explicit `codeql.yml` workflow, restricting analysis to JavaScript/TypeScript to prevent crashes caused by false-positive Python detection in `node_modules`.
- **CI Hardening:** Implemented `check-build.yml` workflow with explicit least-privilege `contents: read` permissions.
- **CodeQL Alerts Resolved:** Cleaned up several dead stores and useless assignments across `useSpeech`, `ConnectDots`, `Arithmetics`, `NestedLogic`, and `CountEverything` to resolve all active CodeQL dashboard alerts.

### Fixed
- **Invisible Replay Button (Light/Colorful Themes):** Fixed a CSS variable inheritance issue where the global `--color-orange` definition was missing, causing the Replay button to render as white text on a transparent background in non-dark themes. Added the missing variable to `variables.scss` so the button is always highly visible across all themes.

## [0.0.8] - 01-06-2026

### Fixed
- **Memory Game Listening Cover:** Fixed a bug where the "Listen Closely" cover in memory games would flash and disappear immediately when a voice instruction was replayed. The cover will now consistently lock the screen for the entire duration of the audio prompt.
- **Deep Scan Bug Fixes (18 total):**
  - Resolved module ID mismatch where Matching Cars/Animals were saving progress to a detached key.
  - Fixed dead "Menu" button routes in 6 Fun Games, ensuring safe return to the home screen.
  - Corrected double-counting of stats on successful phase completion in FlexibleLanguageMemory.
  - Eliminated double-firing on touch screens in SelectiveAttention by migrating to exclusive `pointerdown`.
  - Closed severe memory leaks caused by unmanaged `setTimeout` loops in MemoryMatch and ConnectDots.
  - Repaired `StatisticsView` crashes caused by hard-deleting keys from the persistent store instead of re-initializing them.
  - Fixed false-positive drops on `pointercancel` system interrupts in `useTouchDrag`.
  - Resolved progression stalls in `useProgressStore` where max-difficulty levels would silently reset to 0% success.
  - Fixed global `pointerdown` duplication across multiple `usePromptFading` components by centralizing the DOM listener.
  - Introduced a true Fisher-Yates `shuffle()` utility to replace statistically biased inline `sort(Math.random)` implementations across 30+ modules.
  - Fixed ConnectDots hint logic off-by-one text mapping and swallowing events on destination dots.
  - Fixed hardcoded distractor color logic and uninitialized reactive states across various modules.
  - Fixed a progression logic flaw where `ColorBoard` and `ShapeSorter` would unintentionally reset their difficulty (shrinking the grid back to 2 items) after maxing out, due to a misconfigured hidden `highestPhase`.

## [0.0.7] - 01-06-2026

### Added
- **Global Theme Switching:** Introduced a fully dynamic global theme system. The app now supports independent, switchable themes for MITA Games (e.g., Light, Dark, Colorful) and Fun Games, which seamlessly synchronize across the entire application interface and inside individual game boards.

### Fixed
- **Menu Navigation:** The app now remembers which menu you were looking at (MITA or Fun Games) when you play a game. When you click "Back to Menu", it will return you to exactly where you left off, rather than always jumping back to the default home screen.

## [0.0.6] - 01-06-2026

### Added
- **Category Bins Game:** Added a new sorting game where children organize objects (animals vs vehicles) into matching bins.
- **Connect Dots Game:** Added a new drawing game where children connect numbered dots in sequence to reveal hidden pictures. Features dynamic animal outlines and textured backgrounds.
- **Memory Match Game:** Added a classic card-flipping memory game with progressive grid sizes and varied asset themes.
- **Pattern Train Game:** Added a sequencing puzzle where children complete visual patterns (AB, AAB, ABC) by dragging shapes onto empty train cars.
- **Shadow Match Game:** Added a visual discrimination game requiring children to match colorful objects to their corresponding black silhouettes.
- **Size Sorter Game:** Added a physical stacking game where children must place numbered rings onto a peg strictly from biggest to smallest.

## [0.0.5] - 01-06-2026

### Added
- **Color Board Game:** Added a new progressive Color Board module featuring 10 vibrant, interactive 3D pegs (Red, Blue, Yellow, Green, Orange, Purple, Pink, Cyan, Teal, Lime) that snap into matching colored slots.
- **Shape Sorter Game:** Added a new progressive Shape Sorter module featuring 10 dynamic SVG shapes (Circle, Square, Triangle, Star, Pentagon, Hexagon, Heart, Cross, Diamond, Crescent) with responsive physical slots.

### Fixed

- **Audio Cancellation Race Condition:** Refactored `useSpeech` to manage audio state globally, preventing Vue Router transitions from immediately canceling voice prompts for newly mounted games.
- **Voice Guide Pacing:** Refactored `NumberPuzzle`, `ColorBoard`, and `ShapeSorter` to use the unified `useSpeech` engine. This ensures voice pacing (0.85x rate) and pitch (1.1) match Patches and other core MITA modules, while enabling the WebOS resilient TTS fallback system.
- **Drag & Drop Precision:** Completely re-engineered collision detection for grid-based Fun Games (`NumberPuzzle`, `ColorBoard`, `ShapeSorter`) to use strict center-based proximity checks (within 40px), eliminating premature or incorrect snapping.

#### Deep Scan Bug Fixes

**🔴 Critical**
- **Number Puzzle:** Fixed a copy-paste bug causing `activePointers` to delete the same pointer twice, preventing silent failures.
- **ABA Difficulty Scaling:** Fixed a regression in `useProgressStore` where all games reset to 3 options on phase-up. Added `minOptionCount` per game to properly scale progression (e.g., Color Board now resets to 2, Tier 3 resets to 4).
- **TTS Fallback Reliability:** Hardened the TTS priority chain to strictly attempt the webOS Luna endpoint first, falling back gracefully to a Google TTS audio helper on failure.

**🟠 High**
- **Statistics View Defaults:** Removed unsafe `onMounted` logic that auto-created stats entries with incorrect maximums (e.g., forcing max phase 5 on games with only 3 phases).
- **ABA Prompt Suppression:** Replaced duplicate `touchstart`/`mousedown` window listeners with a single debounced `pointerdown` event, preventing hybrid touch devices from spamming interactions and permanently suppressing the idle prompt timer.
- **Animal Jigsaw:** Restored the missing celebratory voice line ("Great job! You built the {animal}!") upon level completion.
- **Animal Jigsaw Icon:** Fixed a broken start screen layout caused by passing an invalid `gameId` to the Menu Icon component.

**🟡 Medium**
- **Number Puzzle Collisions:** Expanded the color palette to 16 entries to prevent the number `15` from sharing the exact same color as `0` via modulo collision.
- **ColorBoard & ShapeSorter ABA Sync:** Updated these games to read `currentOptionCount` from the progression store instead of relying entirely on static phases, allowing their difficulty to dynamically scale piece-by-piece based on user success.
- **Global Menu CSS:** Removed duplicate `.fun-card-icon` CSS blocks.
- **Drag & Drop Scroll-Snap:** Fixed a visual bug where dropping a piece after scrolling the page caused it to snap to the wrong offset. Coordinates are now cached in an absolute, scroll-safe format at drag start.
- **Statistics Wipe Mutation:** Fixed a crash caused by deleting store keys while concurrently iterating over them during a factory reset.

**🔵 Low**
- **Store Ordering:** Relocated `tier3-combinetoys` to its correct tier grouping inside `useProgressStore.ts`.
- **Animal Jigsaw Scoring:** Ensured the internal score resets to `0` automatically upon starting a new session.

## [0.0.4] - 31-05-2026

### Added
- **Vehicle Jigsaw Game:** Added a brand new Vehicle Jigsaw module featuring 8 custom kawaii-style vehicles (Car, Truck, Bus, Train, Airplane, Rocket, Boat, Submarine).
- **Nature Jigsaw Game:** Added a new Nature Jigsaw module featuring 8 custom colorful nature assets (Tree, Flower, Sun, Cloud, Mountain, Rainbow, Leaf, Mushroom).

## [0.0.3] - 30-05-2026

### Added
- **Multi-Touch Puzzles:** Players can now grab and move multiple puzzle pieces at the exact same time using multiple fingers, making the jigsaw experience much more natural and interactive.

### Fixed
- **Smoother Controls:** Resolved glitches and ghosting issues when dragging pieces, ensuring a much more reliable and smooth experience whether you are using a touchscreen or a mouse.

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
