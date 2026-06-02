<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import HouseGrid from '../NestedLogic/HouseGrid.vue';
import type {
  FlexLangLevelConfig, FlexLangItem, FlexLangDropZone, FlexSyntaxStep, VocabularyNoun, HouseCell
} from '../../../types';

const moduleId = 'tier3-flexible-language-memory';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<FlexLangLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);
const showSuccess = ref(false);

// Interaction queue (mutable copy so we can shift())
const actionQueue = ref<FlexSyntaxStep[]>([]);

// Locked / completed item ids
const lockedItems = ref<Set<string>>(new Set());
// Locked zones (filled) — maps zoneId → itemId placed there
const filledZones = ref<Map<string, string>>(new Map());
// Multi-select: tapped items
const selectedItems = ref<Set<string>>(new Set());

// House Grid state
const placedGrid = ref<Map<string, string>>(new Map());   // zoneId → itemId
const yardItemIds = ref<string[]>([]);                  // items still in yard
const lockedCells = ref<Set<string>>(new Set());
const shakingCells = ref<Set<string>>(new Set());
const confetti = ref<Array<{ x: number; y: number; color: string; angle: number; id: number }>>([]);

// ── Vocabulary ────────────────────────────────────────────────────────────────
const NOUNS: VocabularyNoun[] = ['dog', 'cup', 'ball', 'car', 'book', 'chair', 'couch', 'bed'];
const HOUSE_ANIMALS: VocabularyNoun[] = ['dog', 'cat', 'bird', 'rabbit', 'fish'];

const COLORS = [
  { hex: '#ef4444', name: 'red' },
  { hex: '#3b82f6', name: 'blue' },
  { hex: '#22c55e', name: 'green' },
  { hex: '#f97316', name: 'orange' },
  { hex: '#a855f7', name: 'purple' },
  { hex: '#eab308', name: 'yellow' },
];
const CONTAINERS = [
  { id: 'bed',   label: 'Bed',   prep: 'on' },
  { id: 'table', label: 'Table', prep: 'under' },
  { id: 'box',   label: 'Box',   prep: 'inside' },
];
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';
const pick = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

// ── Procedural Generation ─────────────────────────────────────────────────────
const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  showSuccess.value = false;
  lockedItems.value.clear();
  filledZones.value.clear();
  selectedItems.value.clear();
  placedGrid.value.clear();
  lockedCells.value.clear();
  shakingCells.value.clear();
  confetti.value = [];

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1;
  const phase = Math.min(5, span) as 1 | 2 | 3 | 4 | 5;

  const shuffledNouns = shuffle([...NOUNS]);
  const shuffledColors = shuffle([...COLORS]);

  let displayItems: FlexLangItem[] = [];
  let dropZones: FlexLangDropZone[] = [];
  let expectedActionQueue: FlexSyntaxStep[] = [];
  let targetItemIds: string[] = [];
  let audioPrompt = '';
  let negationExcludedColorName: string | undefined;
  
  let rows = 0, cols = 0;
  let cells: HouseCell[] = [];

  // ── PHASE 1: NEGATION ──────────────────────────────────────────────────────
  if (phase === 1) {
    const targetNoun = shuffledNouns[0];
    const forbiddenColor = shuffledColors[0];
    const correctColor = shuffledColors[1];

    // The correct answer
    const correctItem: FlexLangItem = { id: 'target-0', noun: targetNoun, color: correctColor.hex, colorName: correctColor.name };
    // The decoy (what "NOT" explicitly forbids — must always appear)
    const decoyItem: FlexLangItem = { id: 'decoy-0', noun: targetNoun, color: forbiddenColor.hex, colorName: forbiddenColor.name, isNegationDecoy: true };
    // 2 completely different fillers
    const fillerA: FlexLangItem = { id: 'filler-0', noun: shuffledNouns[1], color: shuffledColors[2].hex, colorName: shuffledColors[2].name };
    const fillerB: FlexLangItem = { id: 'filler-1', noun: shuffledNouns[2], color: shuffledColors[3].hex, colorName: shuffledColors[3].name };

    displayItems = shuffle([correctItem, decoyItem, fillerA, fillerB]);
    dropZones = [{ id: 'zone-select', label: 'Drop Here', containerType: 'box', preposition: 'in' }];
    targetItemIds = [correctItem.id];
    negationExcludedColorName = forbiddenColor.name;
    audioPrompt = `Find the ${targetNoun} that is NOT ${forbiddenColor.name}.`;
    expectedActionQueue = [
      { stepIndex: 0, actionType: 'select', itemId: correctItem.id, targetZoneId: 'zone-select' }
    ];
  }

  // ── PHASE 2: MULTI-SELECT ─────────────────────────────────────────────────
  else if (phase === 2) {
    const [colorA, colorB, colorC] = shuffledColors;
    const [nounA, nounB, nounC] = shuffledNouns;
    const sizeA = 'large';
    const sizeB = 'small';

    const targetA: FlexLangItem = { id: 'target-0', noun: nounA, color: colorA.hex, colorName: colorA.name, size: sizeA };
    const targetB: FlexLangItem = { id: 'target-1', noun: nounB, color: colorB.hex, colorName: colorB.name, size: sizeB };
    // Tricky distractor: shares noun with targetA but wrong size/color
    const distractorMix: FlexLangItem = { id: 'distractor-0', noun: nounA, color: colorB.hex, colorName: colorB.name, size: sizeB };
    // Completely different filler
    const filler: FlexLangItem = { id: 'filler-0', noun: nounC, color: colorC.hex, colorName: colorC.name, size: sizeA };

    displayItems = shuffle([targetA, targetB, distractorMix, filler]);
    dropZones = [{ id: 'zone-select', label: 'Confirm Selection', containerType: 'box', preposition: 'in' }];
    targetItemIds = [targetA.id, targetB.id];
    audioPrompt = `Find the ${sizeA} ${colorA.name} ${nounA} AND the ${sizeB} ${colorB.name} ${nounB}.`;
    expectedActionQueue = [
      { stepIndex: 0, actionType: 'select', itemId: targetA.id },
      { stepIndex: 1, actionType: 'select', itemId: targetB.id },
    ];
  }

  // ── PHASE 3: SEQUENTIAL ───────────────────────────────────────────────────
  else if (phase === 3) {
    const [colorA, colorB, colorC] = shuffledColors;
    const [nounA, nounB, nounC] = shuffledNouns;
    const [contA, contB] = pick([...CONTAINERS], 2);

    const itemFirst: FlexLangItem = { id: 'target-0', noun: nounA, color: colorA.hex, colorName: colorA.name };
    const itemSecond: FlexLangItem = { id: 'target-1', noun: nounB, color: colorB.hex, colorName: colorB.name };
    const filler: FlexLangItem = { id: 'filler-0', noun: nounC, color: colorC.hex, colorName: colorC.name };

    displayItems = shuffle([itemFirst, itemSecond, filler]);
    dropZones = [
      { id: `zone-${contA.id}`, label: contA.label, containerType: contA.id, preposition: contA.prep },
      { id: `zone-${contB.id}`, label: contB.label, containerType: contB.id, preposition: contB.prep },
    ];
    targetItemIds = [itemFirst.id, itemSecond.id];
    audioPrompt = `First put the ${colorA.name} ${nounA} ${contA.prep} the ${contA.label.toLowerCase()}, then put the ${colorB.name} ${nounB} ${contB.prep} the ${contB.label.toLowerCase()}.`;
    expectedActionQueue = [
      { stepIndex: 0, actionType: 'place', itemId: itemFirst.id,  targetZoneId: `zone-${contA.id}`, container: contA.id, preposition: contA.prep },
      { stepIndex: 1, actionType: 'place', itemId: itemSecond.id, targetZoneId: `zone-${contB.id}`, container: contB.id, preposition: contB.prep },
    ];
  }

  // ── PHASE 4: ANIMAL HOUSE (2-story, behind) ───────────────────────────────
  else if (phase === 4) {
    rows = 2; cols = 2;
    const houseAnimals = pick([...HOUSE_ANIMALS], 4);
    const houseColors = pick([...COLORS], 4);
    
    const a: FlexLangItem = { id: 'a', noun: houseAnimals[0], color: houseColors[0].hex, colorName: houseColors[0].name };
    const b: FlexLangItem = { id: 'b', noun: houseAnimals[1], color: houseColors[1].hex, colorName: houseColors[1].name };
    const c: FlexLangItem = { id: 'c', noun: houseAnimals[2], color: houseColors[2].hex, colorName: houseColors[2].name };
    const d: FlexLangItem = { id: 'd', noun: houseAnimals[3], color: houseColors[3].hex, colorName: houseColors[3].name };
    
    targetItemIds = ['a', 'b', 'c', 'd'];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'a', behindAnimalId: 'd' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'b' },
      { row: 0, col: 1, zoneId: 'r0c1', animalId: 'c' },
      { row: 1, col: 1, zoneId: 'r1c1', animalId: null },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND next to the ${c.colorName} ${c.noun}. The ${d.colorName} ${d.noun} lives behind the ${a.colorName} ${a.noun}.`;
    
    const distNoun = HOUSE_ANIMALS.find(n => !houseAnimals.includes(n)) || 'dog';
    const distColor = pick(COLORS.filter(c => !houseColors.includes(c)), 1)[0] || COLORS[5];
    const dist: FlexLangItem = { id: 'd0', noun: distNoun, color: distColor.hex, colorName: distColor.name, isDistractor: true };
    displayItems = shuffle([a, b, c, d, dist]);
    yardItemIds.value = displayItems.map(i => i.id);
  }

  // ── PHASE 5: ANIMAL HOUSE (3-story, behind) ───────────────────────────────
  else {
    rows = 3; cols = 2;
    const houseAnimals = pick([...HOUSE_ANIMALS], 5);
    const houseColors = pick([...COLORS], 5);
    
    const a: FlexLangItem = { id: 'a', noun: houseAnimals[0], color: houseColors[0].hex, colorName: houseColors[0].name };
    const b: FlexLangItem = { id: 'b', noun: houseAnimals[1], color: houseColors[1].hex, colorName: houseColors[1].name };
    const c: FlexLangItem = { id: 'c', noun: houseAnimals[2], color: houseColors[2].hex, colorName: houseColors[2].name };
    const d: FlexLangItem = { id: 'd', noun: houseAnimals[3], color: houseColors[3].hex, colorName: houseColors[3].name };
    const e: FlexLangItem = { id: 'e', noun: houseAnimals[4], color: houseColors[4].hex, colorName: houseColors[4].name };
    
    targetItemIds = ['a', 'b', 'c', 'd', 'e'];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'c' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'a', behindAnimalId: 'd' },
      { row: 2, col: 0, zoneId: 'r2c0', animalId: 'b' },
      { row: 1, col: 1, zoneId: 'r1c1', animalId: 'e' },
      { row: 0, col: 1, zoneId: 'r0c1', animalId: null },
      { row: 2, col: 1, zoneId: 'r2c1', animalId: null },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND under the ${c.colorName} ${c.noun}. The ${d.colorName} ${d.noun} lives behind the ${a.colorName} ${a.noun}. The ${e.colorName} ${e.noun} lives next to the ${a.colorName} ${a.noun}.`;
    
    displayItems = shuffle([a, b, c, d, e]);
    yardItemIds.value = displayItems.map(i => i.id);
  }

  actionQueue.value = [...expectedActionQueue];

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: displayItems.length,
    instructionText: audioPrompt,
    phase,
    pattern: phase === 1 ? 'negation' : phase === 2 ? 'multi-select' : phase === 3 ? 'sequential' : 'nested',
    audioPrompt,
    expectedActionQueue,
    displayItems,
    dropZones,
    targetItemIds,
    negationExcludedColorName,
    rows,
    cols,
    cells,
    targetFeatures: {},
    distractors: [],
  };

  gameStore.initializeGame(config.value!);
  log.generate({ phase, pattern: config.value?.pattern, audioPrompt });

  safeSetTimeout(() => {
    log.audio(audioPrompt);
    playInstruction(audioPrompt);
  }, 500);
};

// ── Computed helpers ──────────────────────────────────────────────────────────
const currentExpectedStep = computed(() => actionQueue.value[0] ?? null);

const isZoneFilledId = (zoneId: string) => filledZones.value.get(zoneId);

const yardItems = computed(() =>
  yardItemIds.value.map(id => config.value?.displayItems.find(d => d.id === id)).filter(Boolean) as FlexLangItem[]
);

// ── HouseGrid Interaction Handlers (Phases 4 & 5) ───────────────────────────

const onZoneDrop = (zoneId: string, itemId: string) => {
  if (isComplete.value || !config.value) return;

  for (const [existingZone, existingItem] of placedGrid.value.entries()) {
    if (existingItem === itemId && existingZone !== zoneId) {
      placedGrid.value.delete(existingZone);
      break;
    }
  }

  const isBehindSlot = zoneId.endsWith('-behind');
  const baseZoneId = isBehindSlot ? zoneId.replace('-behind', '') : zoneId;
  const cell = config.value.cells?.find(c => c.zoneId === baseZoneId);
  
  if (!cell) return;

  if (cell.behindAnimalId !== undefined && !isBehindSlot) {
    const frontOccupied = placedGrid.value.has(baseZoneId);
    const behindOccupied = placedGrid.value.has(baseZoneId + '-behind');

    if (!frontOccupied) {
      placedGrid.value.set(baseZoneId, itemId);
    } else if (!behindOccupied) {
      placedGrid.value.set(baseZoneId + '-behind', itemId);
    } else {
      const displaced = placedGrid.value.get(baseZoneId);
      if (displaced && !yardItemIds.value.includes(displaced)) {
        yardItemIds.value = [...yardItemIds.value, displaced];
      }
      placedGrid.value.set(baseZoneId, itemId);
    }
  } else {
    const displaced = placedGrid.value.get(zoneId);
    if (displaced && displaced !== itemId) {
      if (!yardItemIds.value.includes(displaced)) {
        yardItemIds.value = [...yardItemIds.value, displaced];
      }
    }
    placedGrid.value.set(zoneId, itemId);
  }

  yardItemIds.value = yardItemIds.value.filter(id => id !== itemId);
};

const onZonePickup = (zoneId: string) => {
  const itemId = placedGrid.value.get(zoneId);
  if (!itemId) return;
  const newGrid = new Map(placedGrid.value);
  newGrid.delete(zoneId);
  placedGrid.value = newGrid;
  if (!yardItemIds.value.includes(itemId)) {
    yardItemIds.value = [...yardItemIds.value, itemId];
  }
};

const onYardDrop = (e: DragEvent) => {
  const itemId = e.dataTransfer?.getData('animalId');
  if (!itemId) return;
  for (const [zone, id] of placedGrid.value.entries()) {
    if (id === itemId) {
      const newGrid = new Map(placedGrid.value);
      newGrid.delete(zone);
      placedGrid.value = newGrid;
      break;
    }
  }
  if (!yardItemIds.value.includes(itemId)) {
    yardItemIds.value = [...yardItemIds.value, itemId];
  }
};

const handleCheckHouse = () => {
  if (!config.value || isComplete.value) return;

  const allCells = config.value.cells || [];
  const wrongZones = new Set<string>();
  let allCorrect = true;
  let allTargetsPlaced = true;

  for (const cell of allCells) {
    // Check front slot
    if (cell.animalId) {
      const placedFront = placedGrid.value.get(cell.zoneId);
      if (!placedFront) allTargetsPlaced = false;
      if (placedFront !== cell.animalId) {
        allCorrect = false;
        wrongZones.add(cell.zoneId);
      }
    } else {
      if (placedGrid.value.has(cell.zoneId)) {
        allCorrect = false;
        wrongZones.add(cell.zoneId);
      }
    }

    // Check behind slot
    if (cell.behindAnimalId !== undefined && cell.behindAnimalId !== null) {
      const placedBehind = placedGrid.value.get(cell.zoneId + '-behind');
      if (!placedBehind) allTargetsPlaced = false;
      if (placedBehind !== cell.behindAnimalId) {
        allCorrect = false;
        wrongZones.add(cell.zoneId + '-behind');
      }
    } else {
      if (placedGrid.value.has(cell.zoneId + '-behind')) {
        allCorrect = false;
        wrongZones.add(cell.zoneId + '-behind');
      }
    }
  }

  if (allCorrect && allTargetsPlaced) {
    isComplete.value = true;
    showSuccess.value = true;
    for (const cell of allCells) {
      if (cell.animalId) lockedCells.value.add(cell.zoneId);
    }
    spawnConfetti();
    log.success('check', { phase: config.value.phase });
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    const praise = getRandomItem(['Amazing memory!', 'Perfect!', 'You got it!', 'Outstanding!']);
    playInstruction(praise);
    safeSetTimeout(() => generateLevel(), 3500);
  } else {
    shakingCells.value = wrongZones;
    log.error('check', { wrongZones: [...wrongZones], phase: config.value.phase });
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);

    safeSetTimeout(() => {
      for (const zoneId of wrongZones) {
        const itemId = placedGrid.value.get(zoneId);
        if (itemId) {
          const newGrid = new Map(placedGrid.value);
          newGrid.delete(zoneId);
          placedGrid.value = newGrid;
          if (!yardItemIds.value.includes(itemId)) {
            yardItemIds.value = [...yardItemIds.value, itemId];
          }
        }
      }
      shakingCells.value = new Set();
      playInstruction('Not quite. Listen again!');
      safeSetTimeout(() => replayAudio(), 1500);
    }, 600);
  }
};

const canCheckHouse = computed(() => {
  if (!config.value) return false;
  const targetCells = config.value.cells?.filter(c => c.animalId !== null) || [];
  for (const cell of targetCells) {
    if (cell.animalId && !placedGrid.value.has(cell.zoneId)) return false;
    if (cell.behindAnimalId && !placedGrid.value.has(cell.zoneId + '-behind')) return false;
  }
  return true;
});

const spawnConfetti = () => {
  const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];
  confetti.value = Array.from({ length: 28 }, (_, i) => ({
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 60,
    color: colors[i % colors.length],
    angle: Math.random() * 360,
    id: i,
  }));
  safeSetTimeout(() => { confetti.value = []; }, 3000);
};

// ── Interaction Handlers (Phases 1-3) ─────────────────────────────────────────

// Phase 1/3 drag-and-drop validation (inline helper used in handleDrop)
const isValidDrop = (zoneId: string, itemId: string): boolean => {
  if (!config.value) return false;
  if (config.value.phase === 3) {
    const expected = currentExpectedStep.value;
    return !!expected && expected.itemId === itemId && expected.targetZoneId === zoneId;
  }
  return config.value.targetItemIds.includes(itemId);
};

const handleDrop = (itemId: string, zoneId: string) => {
  if (!config.value || isComplete.value) return;

  if (config.value.phase === 3) {
    const expected = currentExpectedStep.value;
    if (!isValidDrop(zoneId, itemId)) {
      log.error(itemId, { expected: expected?.itemId, got: itemId, expectedZone: expected?.targetZoneId, gotZone: zoneId, phase: 3 });
      gameStore.handleError();
      progressStore.updateStats(moduleId, false);
      
      lockedItems.value.clear();
      filledZones.value.clear();
      selectedItems.value.clear();
      actionQueue.value = [...config.value.expectedActionQueue];
      
      playInstruction('Check the order! Listen again and remember.');
      return;
    }

    // Correct step
    lockedItems.value.add(itemId);
    filledZones.value.set(zoneId, itemId);
    actionQueue.value.shift();
    log.success(itemId, { step: expected.stepIndex, remaining: actionQueue.value.length });
    // NOTE: Do NOT call gameStore.handleSuccess() here for intermediate steps.
    // The full success credit (score + updateStats) is awarded once via winLevel()
    // when the entire sequence is complete, preventing score inflation.

    if (actionQueue.value.length === 0) {
      winLevel();
    } else {
      playInstruction('Good! Now do the next step.');
    }
    return;
  }

  // Phase 1 single-select drop
  if (config.value.targetItemIds.includes(itemId)) {
    lockedItems.value.add(itemId);
    filledZones.value.set(zoneId, itemId);
    log.success(itemId, { phase: 1 });
    gameStore.handleSuccess();
    winLevel();
  }
};


// Phase 2 tap-to-select
const handleTap = (itemId: string) => {
  if (!config.value || isComplete.value || config.value.phase !== 2) return;
  if (lockedItems.value.has(itemId)) return;

  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId);
    return;
  }

  // Guard: only allow selecting up to targetItemIds.length items
  if (selectedItems.value.size >= config.value.targetItemIds.length) {
    playInstruction('You can only pick that many. Tap to deselect first.');
    return;
  }

  selectedItems.value.add(itemId);
};

const confirmSelection = () => {
  if (!config.value || config.value.phase !== 2) return;
  const targets = config.value.targetItemIds;
  const selected = [...selectedItems.value];

  const allCorrect = targets.every(t => selected.includes(t)) && selected.every(s => targets.includes(s));

  if (allCorrect) {
    selected.forEach(id => lockedItems.value.add(id));
    log.success('multi-select', { selected, targets });
    gameStore.handleSuccess();
    winLevel();
  }
  else {
    log.error('multi-select-failed', { phase: 2, expected: targets, selected: selected });
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);

    lockedItems.value.clear();
    filledZones.value.clear();
    selectedItems.value.clear();
    actionQueue.value = [...config.value.expectedActionQueue];

    playInstruction('Oops. Listen closely and try again.');
  }
};

const winLevel = () => {
  isComplete.value = true;
  progressStore.updateStats(moduleId, true);
  log.info('Level complete', { phase: config.value?.phase });
  const praises = ['Amazing memory!', 'Perfect!', 'Outstanding!', 'You remembered it all!'];
  playInstruction(getRandomItem(praises));
  safeSetTimeout(() => generateLevel(), 3500);
};

// ── Controls ──────────────────────────────────────────────────────────────────
const handleStart = () => {
  hasStarted.value = true;
  log.lifecycle('started');
  generateLevel();
};

const replayAudio = () => {
  if (!config.value) return;
  lockedItems.value.clear();
  filledZones.value.clear();
  selectedItems.value.clear();
  actionQueue.value = [...config.value.expectedActionQueue];
  
  log.audio(`[replay] ${config.value.audioPrompt}`);
  playInstruction(config.value.audioPrompt);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});

// ── Template helpers ──────────────────────────────────────────────────────────
const stepProgress = computed(() => {
  if (!config.value) return { current: 0, total: 0 };
  const total = config.value.expectedActionQueue.length;
  const current = total - actionQueue.value.length;
  return { current, total };
});

const isItemLocked = (id: string) => lockedItems.value.has(id);
const isItemSelected = (id: string) => selectedItems.value.has(id);

// Compute which zones are currently locked (Phase 3 only: steps 1+ are locked until step 0 done)
const lockedZoneIds = computed<Set<string>>(() => {
  const s = new Set<string>();
  if (!config.value || config.value.phase !== 3) return s;
  // Every step AFTER index 0 in the remaining queue is locked
  // i.e., if step 0 is not yet done, zone for step 1 is locked
  if (actionQueue.value.length === config.value.expectedActionQueue.length) {
    // Nothing done yet — lock all except first zone
    config.value.expectedActionQueue.slice(1).forEach(step => {
      if (step.targetZoneId) s.add(step.targetZoneId);
    });
  }
  return s;
});

// Zone label for filled slot
const filledLabel = (zoneId: string) => {
  const itemId = filledZones.value.get(zoneId);
  if (!itemId || !config.value) return '';
  const item = config.value.displayItems.find(d => d.id === itemId);
  return item ? `${item.colorName} ${item.noun}` : '';
};

// Computed: color of the negation decoy item (avoids inline arrow in template)
const negationDecoyColor = computed(() =>
  config.value?.displayItems.find(d => d.isNegationDecoy)?.color ?? '#888'
);

// Per-item drop: capture the matched zone id during validateDrop so handlePPSuccess can read it
const lastMatchedZone = ref<Record<string, string>>({});

const makeValidateDrop = (itemId: string) => (target: HTMLElement): boolean => {
  const zoneEl = (target.closest('[data-zone-id]') as HTMLElement | null) ?? target;
  const zoneId = zoneEl.getAttribute('data-zone-id');
  if (!zoneId || !config.value) return false;
  const valid = isValidDrop(zoneId, itemId);
  if (valid) lastMatchedZone.value[itemId] = zoneId;
  return valid;
};

// PuzzlePiece @success — use the zone captured during validateDrop
const handlePPSuccess = (itemId: string) => {
  const zoneId = lastMatchedZone.value[itemId];
  if (!zoneId) return;
  delete lastMatchedZone.value[itemId];
  handleDrop(itemId, zoneId);
};

// PuzzlePiece @error handler
const handlePPError = (itemId: string, target?: HTMLElement) => {
  if (!config.value || isComplete.value) return;

  if (config.value.phase === 1 && target && target.closest('[data-zone-id]')) {
    log.error(itemId, { phase: 1, decoy: config.value.negationExcludedColorName });
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);
    playInstruction(`Remember, find the one that is NOT ${config.value.negationExcludedColorName}! Listen again.`);
    return;
  }

  log.error(itemId, { phase: config.value.phase, reason: 'bad-drop-target' });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  playInstruction('Try again!');
};

</script>

<template>
  <div class="flm-module">

    <!-- ── START SCREEN ───────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Flexible Language<br><span>& Memory</span></h1>
      <p class="start-sub">Listen carefully to the instructions and place the items as requested.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Challenge
      </button>
    </div>

    <!-- ── LISTENING FOCUS MODE ──────────────────────────────────────────── -->
    <div v-else-if="isPlaying" class="focus-listening-mode">
      <div class="listening-content">
        <div class="audio-pulse-wrapper">
          <svg class="giant-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
        </div>
        <h2>Listen and Remember</h2>
        <button class="replay-btn massive-replay" @click="replayAudio">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay Audio
        </button>
      </div>
    </div>

    <!-- ACTION STATE -->
    <div v-else-if="config" class="action-layout">

        <!-- TOP BAR -->
        <header class="top-bar">
          <div class="phase-badge">
            Phase {{ config.phase }}
            <span class="pattern-tag">{{ config.pattern }}</span>
          </div>

          <!-- Step progress (phases 2 & 3) -->
          <div v-if="config.phase > 1 && stepProgress.total > 1" class="step-dots">
            <div
              v-for="i in stepProgress.total" :key="i"
              class="step-dot"
              :class="{ done: (i - 1) < stepProgress.current }"
            ></div>
          </div>

          <button class="replay-btn" @click="replayAudio">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            Replay
          </button>
        </header>

        <!-- MAIN AREA — Drop zones (Phase 1 & 3) -->
        <div v-if="config.pattern !== 'nested'" class="main-area">

          <!-- Phase 1: Single drop zone with negation hint -->
          <template v-if="config.phase === 1">
            <div class="instruction-banner">
              <span class="not-keyword">NOT</span>
              <span class="forbidden-chip" :style="{ background: negationDecoyColor }">
                {{ config.negationExcludedColorName }}
              </span>
            </div>
            <div
              class="drop-zone single-zone"
              :class="{ 'zone-filled': isZoneFilledId('zone-select') }"
              data-zone-id="zone-select"
            >
              <span v-if="!isZoneFilledId('zone-select')" class="zone-placeholder">Drop the correct item here</span>
              <div v-else class="zone-success-content">
                <div class="checkmark">✓</div>
                <span>{{ filledLabel('zone-select') }}</span>
              </div>
            </div>
          </template>

          <!-- Phase 2: Multi-select confirm button -->
          <template v-else-if="config.phase === 2">
            <div class="instruction-banner multi">
              Find <strong>{{ config.targetItemIds.length }}</strong> items · tap to select
            </div>
            <button
              class="confirm-btn"
              :class="{ ready: selectedItems.size === config.targetItemIds.length }"
              :disabled="selectedItems.size !== config.targetItemIds.length || isComplete"
              @click="confirmSelection"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Confirm Selection ({{ selectedItems.size }} / {{ config.targetItemIds.length }})
            </button>
          </template>

          <!-- Phase 3: Two labeled drop zones -->
          <template v-else>
            <div class="sequential-zones">
              <div
                v-for="zone in config.dropZones"
                :key="zone.id"
                class="drop-zone spatial-zone"
                :class="[
                  lockedZoneIds.has(zone.id) ? 'zone-locked' : '',
                  isZoneFilledId(zone.id) ? 'zone-filled' : '',
                  'zone-' + zone.containerType
                ]"
                :data-zone-id="zone.id"
              >
                <div class="zone-label">
                  <span class="zone-prep">{{ zone.preposition }}</span>
                  <span class="zone-name">{{ zone.label }}</span>
                </div>
                <div v-if="lockedZoneIds.has(zone.id)" class="lock-icon">🔒</div>
                <div v-else-if="isZoneFilledId(zone.id)" class="zone-success-content">
                  <div class="checkmark">✓</div>
                  <span>{{ filledLabel(zone.id) }}</span>
                </div>
              </div>
            </div>
          </template>

        </div>
        
        <!-- Main: the house (Phases 4 & 5) -->
        <div v-if="config.pattern === 'nested'" class="main-area">
          <HouseGrid
            :rows="config.rows!"
            :cols="config.cols!"
            :cells="config.cells!"
            :animals="config.displayItems"
            :placedGrid="placedGrid"
            :lockedCells="lockedCells"
            :shakingCells="shakingCells"
            :successMode="showSuccess"
            @zone-drop="onZoneDrop"
            @zone-pickup="onZonePickup"
          />
        </div>

        <!-- BOTTOM — Item options -->
        <div v-if="config.pattern !== 'nested'" class="bottom-area">
          <div class="options-row">

            <!-- PHASE 2: Tap-to-select cards (no drag) -->
            <template v-if="config.phase === 2">
              <div
                v-for="opt in config.displayItems"
                :key="`${levelCounter}-${opt.id}`"
                class="item-card"
                :class="{
                  'card-locked': isItemLocked(opt.id),
                  'card-selected': isItemSelected(opt.id),
                  'card-large': opt.size === 'large',
                  'card-small': opt.size === 'small',
                }"
                :style="{ opacity: isItemLocked(opt.id) ? 0.25 : 1 }"
                @pointerdown.prevent="handleTap(opt.id)"
              >
                <div class="asset-ring" :style="{ background: opt.color + '22', borderColor: opt.color }">
                  <AssetLibrary :name="opt.noun" :color="opt.color" size="medium" />
                </div>
                <div class="item-noun">{{ opt.noun }}</div>
                <div v-if="opt.size" class="size-badge" :style="{ background: opt.color }">{{ opt.size }}</div>
                <div v-if="isItemSelected(opt.id)" class="selected-ring">✓</div>
              </div>
            </template>

            <!-- PHASE 1 & 3: PuzzlePiece drag (touch-compatible) -->
            <template v-else>
              <div
                v-for="opt in config.displayItems"
                :key="`${levelCounter}-${opt.id}`"
                class="piece-wrapper"
                :class="{ 'piece-locked': isItemLocked(opt.id) }"
              >
                <PuzzlePiece
                  :id="opt.id"
                  :transparent="true"
                  dropZoneSelector=".drop-zone"
                  :validateDrop="makeValidateDrop(opt.id)"
                  @success="handlePPSuccess"
                  @error="handlePPError"
                  style="width: 100%; height: 100%;"
                >
                  <div class="item-card-inner"
                    :class="{
                      'card-decoy': opt.isNegationDecoy,
                      'card-large': opt.size === 'large',
                      'card-small': opt.size === 'small',
                    }"
                    :style="{ opacity: isItemLocked(opt.id) ? 0.25 : 1 }"
                  >
                    <div class="asset-ring" :style="{ background: opt.color + '22', borderColor: opt.color }">
                      <AssetLibrary :name="opt.noun" :color="opt.color" size="medium" />
                    </div>
                    <div class="item-noun">{{ opt.noun }}</div>
                    <div v-if="opt.size" class="size-badge" :style="{ background: opt.color }">{{ opt.size }}</div>
                  </div>
                </PuzzlePiece>
              </div>
            </template>

          </div>
        </div>

        <!-- Bottom: yard with animals + check button (Phases 4 & 5) -->
        <div v-if="config.pattern === 'nested'" class="yard-area" @dragover.prevent @drop.prevent="onYardDrop">
          <div class="yard-label">🌿 Yard</div>
          <div class="yard-animals">
            <div
              v-for="animal in yardItems"
              :key="`${levelCounter}-${animal.id}`"
              class="yard-card"
              draggable="true"
              @dragstart="(e: DragEvent) => { if (e.dataTransfer) e.dataTransfer.setData('animalId', animal.id); }"
            >
              <div class="yard-asset-ring" :style="{ background: animal.color + '22', borderColor: animal.color }">
                <AssetLibrary :name="animal.noun" :color="animal.color" size="medium" />
              </div>
              <div class="yard-noun">{{ animal.noun }}</div>
            </div>

            <!-- Placeholder when all placed -->
            <div v-if="yardItems.length === 0" class="yard-empty">
              All animals placed! Tap Check when ready.
            </div>
          </div>

          <!-- CHECK button -->
          <button
            class="check-btn"
            :class="{ 'check-ready': canCheckHouse }"
            :disabled="!canCheckHouse || isComplete"
            @click="handleCheckHouse"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Check!
          </button>
        </div>

      </div>
    </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.flm-module {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: var(--bg-primary);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
  user-select: none;
}

/* ── Start screen ─────────────────────────────────────────────────────────── */
.start-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.5rem;
  padding: 3rem;
}
.start-icon { font-size: 6rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); text-align: center; line-height: 1.15; }
.start-screen h1 span { color: var(--color-blue); }
.start-sub { font-size: 1.4rem; color: var(--text-secondary); text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: var(--color-blue); color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(59,130,246,0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}
.start-btn:active { transform: scale(0.96); box-shadow: none; }

/* ── Listening Focus Mode ──────────────────────────────────────────────────── */
.focus-listening-mode {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  animation: fadeIn 0.3s ease;
}

.listening-content {
  display: flex; flex-direction: column; align-items: center; gap: 3rem;
}

.listening-content h2 {
  font-size: 3rem; font-weight: 800; color: white; margin: 0;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.audio-pulse-wrapper {
  position: relative; width: 160px; height: 160px;
  display: flex; align-items: center; justify-content: center;
}

.giant-speaker {
  width: 100px; height: 100px; color: white; z-index: 10;
}

.pulse-ring {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  border: 4px solid rgba(255,255,255,0.8); border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.pulse-ring.delay {
  animation-delay: 1s;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.massive-replay {
  font-size: 1.6rem !important; padding: 1.2rem 3rem !important;
  background: #f59e0b !important;
  box-shadow: 0 10px 25px rgba(245,158,11,0.4) !important;
  color: white !important;
  border: none !important;
  border-radius: 50px !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  cursor: pointer !important;
}

/* ── Action layout ────────────────────────────────────────────────────────── */
.action-layout {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden;
}

/* ── Top bar ──────────────────────────────────────────────────────────────── */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 2px solid rgba(255,255,255,0.07);
  gap: 1rem; flex-shrink: 0;
}
.phase-badge {
  font-size: 1.1rem; font-weight: 700; color: var(--text-secondary);
  display: flex; align-items: center; gap: 0.5rem;
}
.pattern-tag {
  font-size: 0.9rem; font-weight: 600; padding: 0.2rem 0.75rem;
  background: rgba(255,255,255,0.1); border-radius: 20px;
  color: var(--color-blue); text-transform: capitalize;
}
.step-dots { display: flex; gap: 0.6rem; }
.step-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: background 0.3s, transform 0.3s;
}
.step-dot.done { background: #22c55e; transform: scale(1.2); }
.replay-btn {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
  padding: 0.75rem 1.75rem;
  background: var(--color-orange); color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 4px 12px rgba(249,115,22,0.35);
  transition: transform 0.15s;
}
.replay-btn:active { transform: scale(0.95); }

/* ── Main area ────────────────────────────────────────────────────────────── */
.main-area {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 2rem; gap: 1.5rem;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  position: relative;
}

/* ── Instruction banner ───────────────────────────────────────────────────── */
.instruction-banner {
  display: flex; align-items: center; gap: 1rem;
  background: rgba(255,255,255,0.07); border-radius: 20px;
  padding: 0.75rem 2rem; font-size: 1.5rem; color: white; font-weight: 700;
}
.not-keyword {
  font-size: 2rem; font-weight: 900; color: #f87171;
  letter-spacing: 0.05em;
}
.forbidden-chip {
  padding: 0.3rem 1.2rem; border-radius: 50px;
  color: white; font-size: 1.1rem; font-weight: 700;
  box-shadow: 0 0 12px rgba(0,0,0,0.3);
}
.instruction-banner.multi { font-size: 1.3rem; }

/* ── Drop zones ───────────────────────────────────────────────────────────── */
.drop-zone {
  border: 5px dashed rgba(255,255,255,0.25);
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 0.75rem;
  transition: border-color 0.3s, background 0.3s, transform 0.2s;
  position: relative;
}
.single-zone {
  width: min(500px, 90vw); height: 180px;
  background: rgba(255,255,255,0.04);
}
.single-zone.zone-filled { border-color: #22c55e; background: rgba(34,197,94,0.12); }
.zone-placeholder { color: rgba(255,255,255,0.35); font-size: 1.2rem; }
.zone-success-content {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  color: #22c55e; font-weight: 700; font-size: 1.3rem;
}
.checkmark {
  font-size: 3rem; animation: pop-in 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
}
@keyframes pop-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* Sequential zones */
.sequential-zones { display: flex; gap: 3rem; }
.spatial-zone {
  width: 240px; height: 220px;
  background: rgba(255,255,255,0.04);
}
.zone-label {
  display: flex; flex-direction: column; align-items: center;
  color: rgba(255,255,255,0.6); font-size: 0.95rem;
}
.zone-prep { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; }
.zone-name { font-size: 1.6rem; font-weight: 800; color: white; }
.zone-bed    { --zone-accent: #8b5cf6; border-color: #8b5cf6; }
.zone-table  { --zone-accent: #10b981; border-color: #10b981; }
.zone-box    { --zone-accent: #f59e0b; border-color: #f59e0b; }
.zone-filled { border-style: solid; }
.zone-filled.zone-bed   { background: rgba(139,92,246,0.15); }
.zone-filled.zone-table { background: rgba(16,185,129,0.15); }
.zone-filled.zone-box   { background: rgba(245,158,11,0.15); }
.zone-locked {
  opacity: 0.35; pointer-events: none; filter: grayscale(0.7);
}
.lock-icon { font-size: 2.5rem; }

/* ── Confirm button (Phase 2) ─────────────────────────────────────────────── */
.confirm-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.5rem; font-weight: 700; padding: 1.25rem 3rem;
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
  border: 3px solid rgba(255,255,255,0.15); border-radius: 50px;
  cursor: not-allowed;
  transition: all 0.3s;
}
.confirm-btn.ready {
  background: #22c55e; color: white; border-color: #22c55e;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(34,197,94,0.5);
  animation: glow-pulse 1.5s ease-in-out infinite alternate;
}
@keyframes glow-pulse {
  from { box-shadow: 0 0 20px rgba(34,197,94,0.4); }
  to   { box-shadow: 0 0 45px rgba(34,197,94,0.8); }
}

/* ── Bottom options ───────────────────────────────────────────────────────── */
.bottom-area {
  flex-shrink: 0; background: var(--bg-primary);
  padding: 1.5rem 2rem;
  border-top: 2px solid rgba(255,255,255,0.06);
}
.options-row {
  display: flex; gap: 1.5rem; justify-content: center;
  flex-wrap: wrap;
}
.item-card {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  border-radius: 20px; overflow: hidden;
  border: 4px solid rgba(255,255,255,0.12);
  cursor: grab;
  width: 170px; min-height: 210px;
  padding-bottom: 0.5rem;
  background: var(--bg-secondary);
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, opacity 0.3s;
}
.item-card:active { cursor: grabbing; }
.item-card:not(.card-locked):hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.35); }
.item-card.card-selected {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34,197,94,0.4), 0 6px 20px rgba(0,0,0,0.25);
  transform: translateY(-6px) scale(1.03);
}
.item-card.card-decoy {
  border-style: dashed; /* Subtle visual cue that this might be the forbidden one */
}
.item-card.card-large { width: 190px; min-height: 200px; }
.item-card.card-small { width: 130px; min-height: 150px; }
.item-color-block {
  width: 100%; height: 100px;
  display: flex; align-items: flex-end; justify-content: flex-end;
  padding: 0.5rem;
}
.item-size-label {
  background: rgba(0,0,0,0.45); color: white;
  font-size: 0.8rem; font-weight: 700; padding: 0.2rem 0.6rem;
  border-radius: 20px; text-transform: uppercase;
}
.asset-ring {
  width: 130px; height: 130px; border-radius: 50%;
  border: 4px solid;
  display: flex; align-items: center; justify-content: center;
  margin: 0.75rem auto 0;
  flex-shrink: 0;
}
.size-badge {
  color: white; font-size: 0.8rem; font-weight: 800;
  padding: 0.2rem 0.8rem; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-top: 0.25rem;
}
.item-noun {
  padding: 0.4rem 0.6rem 0.6rem;
  font-size: 1.15rem; font-weight: 700;
  color: var(--text-primary); text-align: center; text-transform: capitalize;
}
.selected-ring {
  position: absolute; top: 8px; right: 8px;
  width: 32px; height: 32px; border-radius: 50%;
  background: #22c55e; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 900;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.card-locked { cursor: default; }

/* ── PuzzlePiece wrapper for phases 1 & 3 ────────────────────────────────── */
.piece-wrapper {
  position: relative;
  width: 160px;
  min-height: 180px;
  border-radius: 20px;
  overflow: visible;
}
.piece-wrapper.piece-locked {
  opacity: 0.25;
  pointer-events: none;
}
.item-card-inner {
  display: flex; flex-direction: column; align-items: center;
  border-radius: 20px; overflow: hidden;
  border: 4px solid rgba(255,255,255,0.12);
  width: 160px; min-height: 180px;
  background: var(--bg-secondary);
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
}
.item-card-inner.card-large { width: 190px; min-height: 200px; }
.item-card-inner.card-small { width: 130px; min-height: 150px; }
.item-card-inner.card-decoy { border-style: dashed; }

/* ── Drop overlay (transparent hit layer for native HTML5 drag) ───────────── */
.drop-overlay-layer {
  position: absolute; inset: 0; z-index: 10;
  pointer-events: none; /* items inside main-area still catch events */
}
.main-area { pointer-events: auto; }
/* ── Confetti ──────────────────────────────────────────────────────────────── */
.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
.confetti-piece {
  position: absolute;
  width: 12px; height: 12px;
  border-radius: 2px;
  animation: confetti-fall 2.8s ease-in forwards;
}
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(60vh) rotate(720deg); opacity: 0; }
}

/* ── Yard (Phases 4 & 5) ───────────────────────────────────────────────────── */
.yard-area {
  flex-shrink: 0; background: rgba(15,23,42,0.8);
  border-top: 2px solid rgba(255,255,255,0.08);
  padding: 1rem 1.5rem;
  display: flex; align-items: center; gap: 1.5rem;
  min-height: 160px;
}
.yard-label {
  font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.4);
  writing-mode: vertical-rl; text-orientation: mixed; flex-shrink: 0;
}
.yard-animals {
  display: flex; gap: 1.25rem; flex-wrap: wrap; flex: 1;
  align-items: center;
}
.yard-empty {
  color: rgba(255,255,255,0.4); font-size: 1.1rem; font-style: italic;
  padding: 1rem;
}
.yard-card {
  display: flex; flex-direction: column; align-items: center;
  border-radius: 18px; overflow: hidden;
  border: 3px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  cursor: grab; padding: 0.5rem 0.5rem 0.75rem;
  width: 130px; min-height: 150px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.yard-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,0.4); }
.yard-card:active { cursor: grabbing; transform: scale(1.06); }
.yard-asset-ring {
  width: 96px; height: 96px; border-radius: 50%; border: 3px solid;
  display: flex; align-items: center; justify-content: center;
}
.yard-noun {
  margin-top: 0.4rem; font-size: 1rem; font-weight: 700;
  color: white; text-align: center; text-transform: capitalize;
}

/* ── Check button ──────────────────────────────────────────────────────────── */
.check-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.6rem; font-weight: 900; padding: 1rem 2.5rem;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3);
  border: 3px solid rgba(255,255,255,0.15); border-radius: 50px;
  cursor: not-allowed; flex-shrink: 0;
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.check-btn.check-ready {
  background: #22c55e; color: white; border-color: #22c55e;
  cursor: pointer;
  box-shadow: 0 0 40px rgba(34,197,94,0.5);
  animation: glow-check 1.5s ease-in-out infinite alternate;
}
.check-btn.check-ready:active { transform: scale(0.95); }
@keyframes glow-check {
  from { box-shadow: 0 0 20px rgba(34,197,94,0.4); }
  to   { box-shadow: 0 0 55px rgba(34,197,94,0.8); }
}
</style>
