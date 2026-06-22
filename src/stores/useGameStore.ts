import { defineStore } from 'pinia';
import type { GameConfig } from '../types';
import { useProgressStore } from './useProgressStore';

export const useGameStore = defineStore('game', {
  state: () => ({
    activeConfig: null as GameConfig | null,
    isPlaying: false,
    score: 0,
    consecutiveSuccesses: 0,
    
    // Random Mode State
    isRandomMode: false,
    randomModePool: 'all' as 'all' | 'mita' | 'fun',
    randomModeGoal: 5 as number | 'endless',
    randomGamesCompleted: 0,
    randomRoundsPerGameGoal: 3,
    randomCurrentGameRoundsCompleted: 0,
    randomSessionPlayedGames: [] as string[],
  }),
  actions: {
    initializeGame(config: GameConfig) {
      if (this.activeConfig?.moduleId !== config.moduleId) {
        this.score = 0;
        this.consecutiveSuccesses = 0;
      }
      this.activeConfig = config;
      this.isPlaying = true;
    },
    endGame() {
      this.isPlaying = false;
      this.activeConfig = null;
      this.score = 0;
      this.consecutiveSuccesses = 0;
    },
    handleSuccess() {
      this.consecutiveSuccesses++;
      this.score += 10;
      // Triggers for scaling will happen based on progress store
    },
    handleError() {
      this.consecutiveSuccesses = 0;
      // Adjust prompt level
    },
    
    // --- Random Mode Actions ---
    startRandomMode(pool: 'all' | 'mita' | 'fun', goal: number | 'endless', roundsPerGame: number) {
      this.isRandomMode = true;
      this.randomModePool = pool;
      this.randomModeGoal = goal;
      this.randomGamesCompleted = 0;
      this.randomRoundsPerGameGoal = roundsPerGame;
      this.randomCurrentGameRoundsCompleted = 0;
      this.randomSessionPlayedGames = [];
      this.advanceRandomRound(true);
    },
    endRandomMode() {
      this.isRandomMode = false;
      this.randomGamesCompleted = 0;
      this.randomCurrentGameRoundsCompleted = 0;
      this.randomSessionPlayedGames = [];
    },
    advanceRandomRound(forceNewGame: boolean = false): boolean {
      if (!this.isRandomMode) return false;
      
      if (!forceNewGame) {
        this.randomCurrentGameRoundsCompleted++;
        
        // If we haven't reached the per-game goal, stay on the same game
        if (this.randomCurrentGameRoundsCompleted < this.randomRoundsPerGameGoal) {
          return false; // Return false to indicate we did NOT switch games
        }
      }
      
      // We are switching games!
      this.randomGamesCompleted++;
      this.randomCurrentGameRoundsCompleted = 0;
      
      // Check for completion
      if (this.randomModeGoal !== 'endless' && this.randomGamesCompleted > this.randomModeGoal) {
        this.endRandomMode();
        import('../router').then(m => m.default.push('/random-success'));
        return true;
      }
      
      // Pick next random game
      const progressStore = useProgressStore();
      
      let pool: string[] = [];
      const mitaGames = progressStore.unlockedModules;
      const funGames = [
        'fun-animal-jigsaw', 'fun-vehicle-jigsaw', 'fun-nature-jigsaw', 'fun-number-puzzle', 
        'fun-color-board', 'fun-shape-sorter', 'fun-shadow-match', 'fun-size-sorter', 
        'fun-pattern-train', 'fun-category-bins', 'fun-memory-match', 'fun-connect-dots'
      ];
      
      if (this.randomModePool === 'mita') pool = mitaGames;
      else if (this.randomModePool === 'fun') pool = funGames;
      else pool = [...mitaGames, ...funGames];
      
      // Identify current game
      let currentId: string | undefined = undefined;
      const match = window.location.hash.match(/\/game\/([^/]+)/);
      if (match) {
        currentId = match[1];
      } else if (this.activeConfig?.moduleId) {
        currentId = this.activeConfig.moduleId;
      }
      
      // Filter out all already played games from this session to ensure uniqueness
      let availablePool = pool.filter(id => !this.randomSessionPlayedGames.includes(id));
      
      // If we exhausted the entire pool, reset the played history to allow games to repeat
      if (availablePool.length === 0) {
        this.randomSessionPlayedGames = [];
        availablePool = pool;
      }
      
      // Always prevent picking the exact same game twice in a row
      if (availablePool.length > 1 && currentId) {
        availablePool = availablePool.filter(id => id !== currentId);
      }
      
      const randomId = availablePool[Math.floor(Math.random() * availablePool.length)];
      
      // Add the chosen game to the session history
      this.randomSessionPlayedGames.push(randomId);
      
      import('../router').then(m => m.default.push(`/game/${randomId}`));
      return true; // Return true to indicate we switched games
    }
  }
});
