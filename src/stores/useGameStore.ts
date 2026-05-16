import { defineStore } from 'pinia';
import type { GameConfig } from '../types';

export const useGameStore = defineStore('game', {
  state: () => ({
    activeConfig: null as GameConfig | null,
    isPlaying: false,
    score: 0,
    consecutiveSuccesses: 0,
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
    }
  }
});
