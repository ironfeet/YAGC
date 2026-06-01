export type InputMode = 'drag' | 'tap';
export type PromptLevel = 'full' | 'partial' | 'none'; // Most-to-Least fading

export interface GameConfig {
  moduleId: string;
  tier: 1 | 2 | 3;
  currentPhase: number;           // Number of differentiating features
  optionCount: number;    // Total number of options/distractors displayed
  targetFeatures: Record<string, string>; // e.g., { color: 'red', shape: 'circle' }
  distractors: Array<Record<string, string>>;
}

export interface UserProgress {
  userId: string;
  currentTier: 1 | 2 | 3;
  unlockedModules: string[];
  moduleStats: Record<string, ModuleStat>;
  defaultHomeMenu: 'mita' | 'fun';
}

export interface ModuleStat {
  currentPhase: number;
  highestPhase: number;
  currentOptionCount: number;
  highestOptionCount: number;
  minOptionCount?: number; // Minimum option count to reset to on phase-up
  currentPromptLevel: PromptLevel;
  successRate: number; // For algorithmic scaling
}

// Basic Language Module Types
export type VocabularyNoun = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'cup' | 'ball' | 'car' | 'book' | 'table' | 'chair' | 'couch' | 'slide' | 'bed' | 'car-sedan' | 'car-truck' | 'car-tractor' | 'apple' | 'banana' | 'tree' | 'house' | 'star' | 'moon' | 'sun' | 'cloud' | 'flower' | 'key' | 'scissors' | 'guitar' | 'trumpet' | 'bicycle' | 'airplane' | 'boat' | 'train' | 'clock' | 'lamp' | 'television' | 'computer' | 'phone' | 'shoes' | 'hat' | 'shirt' | 'pants' | 'socks' | 'cow' | 'pig' | 'horse' | 'duck' | 'sheep' | 'elephant' | 'lion' | 'monkey' | 'penguin' | 'bear' | 'giraffe' | 'zebra' | 'kangaroo' | 'deer' | 'owl';

export interface LanguageFeature {
  id: string; // Unique identifier for the instance
  noun: VocabularyNoun;
  color?: string;      // CSS hex e.g. '#ef4444'
  colorName?: string;  // Spoken word e.g. 'red'
  size?: 'small' | 'large';
  count?: number; // 1, 2, 3
  isTarget?: boolean;
}

export interface LanguageLevelConfig extends GameConfig {
  instructionText: string;
  phase: number; // 1 to 6
  targetObject: LanguageFeature;
  distractorObjects: LanguageFeature[];
}

export interface OutlinesFeature extends LanguageFeature {
  rotation?: number;
}

export interface OutlinesLevelConfig extends GameConfig {
  instructionText: string;
  phase: number;
  targetObjects: OutlinesFeature[];
  distractorObjects: OutlinesFeature[];
}

export type PatternType = 'solid' | 'stripes' | 'polka-dots' | 'checkerboard';

export interface PatchFeature {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  color: string;
  pattern: PatternType;
  isTarget?: boolean;
}

export interface PatchesLevelConfig extends GameConfig {
  instructionText: string;
  phase: number;
  sceneType: 'balloon' | 'house' | 'rocket' | 'fish' | 'butterfly' | 'robot' | 'train' | 'flower';
  targetPatches: PatchFeature[];
  distractorPatches: PatchFeature[];
}

export type CarShape = 'sedan' | 'truck' | 'beetle' | 'van' | 'sports' | 'bus';
export type CarPassenger = 'none' | 'boy' | 'girl' | 'dog' | 'cat';
export type CarRoofItem = 'none' | 'luggage' | 'surfboard' | 'bicycle' | 'skis';

export interface CarFeature {
  id: string;
  color: string;
  shape: CarShape;
  passenger: CarPassenger;
  roofItem: CarRoofItem;
  isTarget?: boolean;
}

export interface MatchingCarsLevelConfig extends GameConfig {
  instructionText: string;
  phase: number;
  targetCar: CarFeature;
  distractorCars: CarFeature[];
}

export type AnimalShape = 'zebra' | 'giraffe' | 'elephant' | 'lion' | 'tiger' | 'bear' | 'monkey' | 'rhino' | 'hippo' | 'crocodile' | 'turtle' | 'snake' | 'frog' | 'dog' | 'cat' | 'rabbit' | 'mouse' | 'fox' | 'deer' | 'cow' | 'pig' | 'sheep' | 'horse' | 'camel' | 'kangaroo' | 'penguin' | 'duck' | 'owl' | 'dinosaur' | 'leopard';
export type AnimalSize = 'small' | 'large';
export type AnimalDirection = 'left' | 'right';

export interface AnimalFeature {
  id: string;
  color: string;
  shape: AnimalShape;
  size: AnimalSize;
  direction: AnimalDirection;
  isTarget?: boolean;
}

export interface MatchingAnimalsLevelConfig extends GameConfig {
  instructionText: string;
  phase: number;
  targetAnimal: AnimalFeature;
  distractorAnimals: AnimalFeature[];
}

// ---------------------------------------------------------
// TIER 2 MODULES
// ---------------------------------------------------------

export type BugShape = 'beetle' | 'butterfly' | 'caterpillar' | 'ladybug' | 'bee';
export type BugPattern = 'none' | 'spots' | 'stripes' | 'zigzag';
export type BugRotation = 0 | 90 | 180 | 270;

export interface BugFeature {
  id: string;
  color: string;
  shape: BugShape;
  pattern: BugPattern;
  rotation: BugRotation;
}

export interface OddOneOutLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  targetBug: BugFeature;
  swarm: BugFeature[]; // The full array of bugs including target and distractors
  anomalyRule: string; // Internal string tracking the anomaly rule
}

export type ElephantBodyShape = 'rounded' | 'angular' | 'oval' | 'blocky';
export type ElephantOrientation = 'left' | 'right';
export type ElephantEarColor = string;
export type ElephantBodyColor = string;
export type ElephantEarOrnament = 'none' | 'stars' | 'stripes' | 'polka-dots';

export interface ElephantPartConfig {
  id: string;
  bodyShape: ElephantBodyShape;
  bodyColor: ElephantBodyColor;
  orientation: ElephantOrientation;
  earColor: ElephantEarColor;
  earOrnament: ElephantEarOrnament;
}

export interface CombineElephantsLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  targetElephant: ElephantPartConfig;
  distractorElephants: ElephantPartConfig[];
}

export type ButterflyOrientation = 0 | 90 | 180 | 270;
export type ButterflyWingShape = 'rounded' | 'pointed' | 'triangle' | 'wide';
export type ButterflyPatternColor = string;
export type ButterflyBodyColor = string;

export interface ButterflyPartConfig {
  id: string;
  orientation: ButterflyOrientation;
  bodyColor: ButterflyBodyColor;
  wingShape: ButterflyWingShape;
  patternColor: ButterflyPatternColor;
}

export interface CombineButterfliesLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  targetButterfly: ButterflyPartConfig;
  distractorButterflies: ButterflyPartConfig[];
}

export type TrainShape = 'steam' | 'bullet' | 'boxcar' | 'diesel';
export type TrainOrientation = 'left' | 'right';
export type TrainWindowColor = string;
export type TrainColor = string;
export type TrainWindowPattern = 'square-2' | 'square-3' | 'round-2' | 'round-3';

export interface TrainPartConfig {
  id: string;
  trainShape: TrainShape;
  trainColor: TrainColor;
  orientation: TrainOrientation;
  windowColor: TrainWindowColor;
  windowPattern: TrainWindowPattern;
}

export interface CombineTrainsLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  targetTrain: TrainPartConfig;
  distractorTrains: TrainPartConfig[];
}

export type MathOperation = 'count' | 'add' | 'subtract' | 'multiply' | 'divide';
export type MathItemType = 'ball' | 'apple' | 'star';

export interface MathOperand {
  id: string;
  count: number;
  itemType: MathItemType;
  renderAsNumber: boolean;
}

export interface ArithmeticsLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4 | 5;
  operation: MathOperation;
  leftOperand: MathOperand;
  rightOperand?: MathOperand;
  targetAnswer: MathOperand;
  distractorAnswers: MathOperand[];
}

export type CountItemType = 'ball' | 'animal' | 'car' | 'bug' | 'train';

export interface CountItemData {
  x: number;
  y: number;
  type: CountItemType;
  animalShape?: AnimalShape;
  bugShape?: BugShape;
  trainShape?: TrainShape;
  carColor?: string;
  color: string;
}

export interface CountEverythingLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  targetCount: number;
  items: CountItemData[];
  distractorCounts: number[];
}

export type SpatialPreposition = 'in_front' | 'inside' | 'behind' | 'on_top' | 'under';
export type SpatialToy = 'dinosaur' | 'dog' | 'duck';
export type SpatialVehicle = 'car' | 'plane' | 'cart';
export type SpatialOrientation = 'left' | 'right';

export interface SpatialItemConfig {
  id: string;
  toy: SpatialToy;
  toyColor: string;
  vehicle: SpatialVehicle;
  vehicleColor: string;
  vehicleOrientation: SpatialOrientation;
  preposition: SpatialPreposition;
}

export interface CombineToysLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4;
  gridRows: number;
  gridCols: number;
  rule: SpatialPreposition;
  rowHeaders: { toy: SpatialToy, color: string }[];
  colHeaders: { vehicle: SpatialVehicle, color: string, orientation: SpatialOrientation }[];
  emptyCells: { row: number, col: number }[];
  targetOptions: SpatialItemConfig[];
  distractorOptions: SpatialItemConfig[];
}

export interface SpatialPrepositionsLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4 | 5;
  gridRows: number;
  gridCols: number;
  rule: SpatialPreposition;
  rowHeaders: { toy: SpatialToy, color: string }[];
  colHeaders: { vehicle: SpatialVehicle, color: string, orientation: SpatialOrientation }[];
  emptyCells: { row: number, col: number }[];
  targetOptions: SpatialItemConfig[];
  distractorOptions: SpatialItemConfig[];
}

export type PerspectivePreposition = 'left' | 'inside' | 'right';

export interface PerspectiveItemConfig {
  id: string;
  toy: SpatialToy;
  toyColor: string;
  vehicle: SpatialVehicle;
  vehicleColor: string;
  vehicleOrientation: SpatialOrientation;
  preposition: PerspectivePreposition;
}

export interface PerspectiveTakingLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4 | 5;
  gridRows: number;
  gridCols: number;
  audioPrompt: string;
  ruleMapping: Record<string, PerspectivePreposition>; // Maps toyColor to rule
  rowHeaders: { toy: SpatialToy, color: string }[];
  colHeaders: { vehicle: SpatialVehicle, color: string, orientation: SpatialOrientation }[];
  emptyCells: { row: number, col: number }[];
  targetOptions: PerspectiveItemConfig[];
  distractorOptions: PerspectiveItemConfig[];
}

export type AuditoryPreposition = 'on' | 'under' | 'inside';
export type AuditoryContainer = 'bed' | 'table' | 'box' | 'couch' | 'house';

export interface AuditoryMemoryItem {
  id: string;
  noun: VocabularyNoun;
  color: string;
  isTarget: boolean;
}

export interface AuditoryTargetAction {
  item: AuditoryMemoryItem;
  preposition?: AuditoryPreposition;
  container?: AuditoryContainer;
}

export interface AuditoryMemoryLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4 | 5;
  audioPrompt: string;
  targets: AuditoryTargetAction[];
  distractorItems: AuditoryMemoryItem[];
  availableContainers: AuditoryContainer[]; // Drop zones
}

// ─── Flexible Language & Memory (Tier 3 Capstone) ────────────────────────────

/** One discrete user action the engine expects in order */
export interface FlexSyntaxStep {
  stepIndex: number;          // 0-based position in the sequence
  actionType: 'select' | 'place';
  itemId: string;             // The item the user must interact with
  targetZoneId?: string;      // For 'place': the zone's data-zone-id attribute
  container?: string;         // 'bed' | 'table' | 'box'
  preposition?: string;       // 'on' | 'under' | 'inside'
}

export type FlexSyntaxPattern = 'negation' | 'multi-select' | 'sequential' | 'nested';

export interface FlexLangItem {
  id: string;
  noun: VocabularyNoun;
  color: string;
  colorName: string;
  size?: 'small' | 'large';
  isNegationDecoy?: boolean;  // The "forbidden" item planted to test NOT comprehension
  isDistractor?: boolean;
}

export interface FlexLangDropZone {
  id: string;           // Matches targetZoneId in FlexSyntaxStep
  label: string;        // Human readable (e.g. "Bed")
  containerType: string; // 'bed' | 'table' | 'box'
  preposition: string;  // 'on' | 'under' | 'inside'
}

export interface FlexLangLevelConfig extends GameConfig {
  instructionText: string;
  phase: 1 | 2 | 3 | 4 | 5;
  pattern: FlexSyntaxPattern;
  audioPrompt: string;
  expectedActionQueue: FlexSyntaxStep[];
  displayItems: FlexLangItem[];
  dropZones: FlexLangDropZone[];
  targetItemIds: string[];
  negationExcludedColorName?: string; // Color the user must NOT pick
  
  // For phases 4 and 5 (nested / house grid)
  rows?: number;
  cols?: number;
  cells?: HouseCell[];
}

// ─── Nested Logic (Tier 3 Capstone 2) ────────────────────────────────────────

/** One cell in the house grid */
export interface HouseCell {
  row: number;
  col: number;
  zoneId: string;              // e.g. "r0c0"
  animalId: string | null;     // Which animal belongs here (front)
  behindAnimalId?: string | null; // Which animal belongs behind
}

export interface NestedAnimal {
  id: string;
  noun: VocabularyNoun;
  color: string;
  colorName: string;
  isDistractor?: boolean;
}

export interface RecursionRelation {
  prep: 'on top of' | 'under' | 'in front of' | 'behind' | 'next to';
  referenceId: string;
}

export interface RecursionRule {
  subjectId: string;
  relations: RecursionRelation[];
}

export interface NestedLogicLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rows: number;
  cols: number;
  cells: HouseCell[];           // Full solved grid
  audioPrompt: string;
  animals: NestedAnimal[];      // All draggable animals (targets + distractors)
  targetAnimalIds: string[];    // IDs of animals that must be placed
  rule: RecursionRule;
}

// ─── Analogies (Tier 3) ──────────────────────────────────────────────────────

export type AnalogyShape = 'tall' | 'wide' | 'angled';
export type AnalogyOrientation = 'left' | 'right';
export type AnalogyInhabitant = 'none' | 'cat' | 'dog';

export interface AnalogyHouse {
  color: string;
  shape: AnalogyShape;
  orientation: AnalogyOrientation;
  count: number; // 1 or 2
  inhabitant: AnalogyInhabitant;
}

export interface TransformationRule {
  color?: string | 'SAME';
  shape?: AnalogyShape | 'SAME';
  orientation?: 'FLIP' | 'SAME';
  count?: 'ADD' | 'REMOVE' | 'SAME';
  inhabitant?: AnalogyInhabitant | 'SAME';
}

export interface AnalogyItem {
  id: string;
  house: AnalogyHouse;
}

export interface AnalogiesLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  instructionText: string;
  rule: TransformationRule;
  houseA: AnalogyHouse;
  houseB: AnalogyHouse;
  houseC: AnalogyHouse;
  houseD: AnalogyHouse; // Correct answer
  options: AnalogyItem[]; // D + distractors
}

// ─── Time Prepositions (Tier 3) ──────────────────────────────────────────────

export type TemporalSyntaxType = 'then' | 'before' | 'after' | 'complex-after-before' | 'complex-before-after';

export interface TemporalSequenceRule {
  syntax: TemporalSyntaxType;
  items: string[];          // IDs of the items involved (e.g., ['cat', 'dog'])
  correctOrder: string[];   // The chronological execution order (e.g., ['dog', 'cat'])
  sentence: string;         // The generated grammatical sentence
}

export interface TimePrepositionsLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: TemporalSequenceRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

export interface TimePrepositionsMemoryLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: TemporalSequenceRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

// ─── Passive Verb Tense (Tier 3) ─────────────────────────────────────────────

export type CatchUpSyntaxType = 'active' | 'passive' | 'positional' | 'compound';

export interface CatchUpRaceRule {
  syntax: CatchUpSyntaxType;
  racers: VocabularyNoun[];
  winnerId: VocabularyNoun;
  sentence: string;
}

export interface CatchUpLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: CatchUpRaceRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

export interface CatchUpMemoryLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: CatchUpRaceRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

// ─── Subject/Object Garden Hose (Tier 3) ─────────────────────────────────────

export type SubjectObjectSyntaxType = 'active' | 'passive' | 'compound' | 'complex-compound';

export interface HoseLogicRule {
  syntax: SubjectObjectSyntaxType;
  actors: VocabularyNoun[];
  wetAnimals: VocabularyNoun[];
  sentence: string;
}

export interface SubjectObjectLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: HoseLogicRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

export interface SubjectObjectMemoryLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  rule: HoseLogicRule;
  options: { id: string; animal: VocabularyNoun; isTarget: boolean }[];
  instructionText: string;
}

// ─── Selective Attention (Tier 3) ────────────────────────────────────────────

export type SearchItemType = 'apple' | 'strawberry' | 'star' | 'car' | 'flower' | 'balloon';

export interface SearchItemData {
  id: string;
  itemType: SearchItemType;
  color: string;
  hasDetail: boolean;
  isTarget: boolean;
  isCollected?: boolean;
}

export interface SelectiveAttentionLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  instructionText: string;
  targetItem: SearchItemData;
  totalTargets: number;
  fieldItems: SearchItemData[];
}

// ─── Carries or Rides (Tier 3) ───────────────────────────────────────────────

export type TransportVerb = 'carries' | 'rides';

export interface TransportRuleConfig {
  verb: TransportVerb;
  carrierAnimal: AnimalShape;
  carrierColor: string;
  carrierSize: AnimalSize;
  riderAnimal: AnimalShape;
  riderColor: string;
  riderSize: AnimalSize;
  sentence: string;
}

export interface CarriesOrRidesLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  instructionText: string;
  rule: TransportRuleConfig;
  poolAnimals: AnimalFeature[];
}

export interface CarriesOrRidesMemoryLevelConfig extends GameConfig {
  phase: 1 | 2 | 3 | 4 | 5;
  instructionText: string;
  rule: TransportRuleConfig;
  poolAnimals: AnimalFeature[];
}


