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
      // forceNewGame=true: navigate to first game WITHOUT incrementing the completed counter
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
        
        // If we haven't reached the per-game round goal, stay on the same game
        if (this.randomCurrentGameRoundsCompleted < this.randomRoundsPerGameGoal) {
          return false; // false = did NOT switch games
        }
        
        // This game is fully completed — record it and reset round counter
        this.randomGamesCompleted++;
        this.randomCurrentGameRoundsCompleted = 0;
        
        // Check if the entire session is complete (use >= since counter is now accurate)
        if (this.randomModeGoal !== 'endless' && this.randomGamesCompleted >= this.randomModeGoal) {
          this.endRandomMode();
          import('../router').then(m => m.default.push('/random-success'));
          return true;
        }
      }
      
      // Pick next random game from the pool
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
      
      // Identify current game to avoid immediate repeat
      let currentId: string | undefined = undefined;
      const match = window.location.hash.match(/\/game\/([^/]+)/);
      if (match) {
        currentId = match[1];
      } else if (this.activeConfig?.moduleId) {
        currentId = this.activeConfig.moduleId;
      }
      
      // Filter out already played games this session (shuffle-bag algorithm)
      let availablePool = pool.filter(id => !this.randomSessionPlayedGames.includes(id));
      
      // If the entire pool has been exhausted, reset history so games can repeat
      if (availablePool.length === 0) {
        this.randomSessionPlayedGames = [];
        availablePool = pool;
      }
      
      // Never pick the exact same game twice in a row
      if (availablePool.length > 1 && currentId) {
        availablePool = availablePool.filter(id => id !== currentId);
      }
      
      const randomId = availablePool[Math.floor(Math.random() * availablePool.length)];
      
      // Record this game as played in the session
      this.randomSessionPlayedGames.push(randomId);
      
      import('../router').then(m => m.default.push(`/game/${randomId}`));
      return true; // true = switched to a new game
    }
  }
});
