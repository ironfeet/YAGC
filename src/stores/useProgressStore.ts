import { defineStore } from 'pinia';
import type { UserProgress } from '../types';

export const useProgressStore = defineStore('progress', {
  state: (): UserProgress => ({
    userId: 'jiacheng',
    currentTier: 1,
    unlockedModules: ['tier1-patches', 'tier1-outlines', 'tier1-basiclanguage', 'tier1-matching-cars', 'tier1-matching-animals', 'tier2-odd-one-out', 'tier2-combine-elephants', 'tier2-combine-butterflies', 'tier2-combine-trains', 'tier2-arithmetics', 'tier2-count-everything', 'tier3-spatial-prepositions', 'tier3-perspectivetaking', 'tier3-auditory-memory', 'tier3-flexible-language-memory', 'tier3-nested-logic'],
    moduleStats: {
      'fun-animal-jigsaw': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 2,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-vehicle-jigsaw': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 2,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-nature-jigsaw': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 2,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-number-puzzle': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-color-board': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 10,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-shape-sorter': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 10,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-shadow-match': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 2,
        highestOptionCount: 10,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-size-sorter': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 3,
        highestOptionCount: 7,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-pattern-train': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 3,
        highestOptionCount: 6,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-category-bins': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 12,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-memory-match': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 16,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'fun-connect-dots': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 5,
        highestOptionCount: 15,
        minOptionCount: 5,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-patches': {
        currentPhase: 1,
        highestPhase: 3,
        currentOptionCount: 2,
        highestOptionCount: 8,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-outlines': {
        currentPhase: 1,
        highestPhase: 3,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-basiclanguage': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 2,
        highestOptionCount: 8,
        minOptionCount: 2,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-matching-cars': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-matching-animals': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-odd-one-out': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },

      'tier2-combine-elephants': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-combine-butterflies': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-combine-trains': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        minOptionCount: 3,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-arithmetics': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-count-everything': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-combinetoys': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-spatial-prepositions': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-perspectivetaking': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-auditory-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-flexible-language-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-nested-logic': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-analogies': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-timeprepositions': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-timeprepositions-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-passiveverbtense': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-catchup-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-subjectobject': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-subjectobject-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-carriesorrides': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-carriesorrides-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-selectiveattention': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        minOptionCount: 4,
        currentPromptLevel: 'none',
        successRate: 0,
      },
    },
    defaultHomeMenu: 'mita', // Default home menu
    mitaTheme: 'dark',
    funTheme: 'colorful',
  }),
  actions: {
    setMitaTheme(theme: string) {
      this.mitaTheme = theme;
    },
    setFunTheme(theme: string) {
      this.funTheme = theme;
    },
    toggleHomeMenu() {
      this.defaultHomeMenu = this.defaultHomeMenu === 'mita' ? 'fun' : 'mita';
    },
    updateStats(moduleId: string, success: boolean) {
      if (!this.moduleStats[moduleId]) return;
      
      const stat = this.moduleStats[moduleId];
      // Basic ABA scaling logic
      if (success) {
        stat.successRate += 10;
        if (stat.successRate >= 100) {
          // Fade prompt or increase difficulty
          if (stat.currentPromptLevel === 'full') stat.currentPromptLevel = 'partial';
          else if (stat.currentPromptLevel === 'partial') stat.currentPromptLevel = 'none';
          else {
            // Increase option count or span
            if (stat.currentOptionCount >= stat.highestOptionCount) {
              if (stat.currentPhase < stat.highestPhase) {
                stat.currentPhase++;
                stat.currentOptionCount = stat.minOptionCount ?? 2;
              }
            } else {
              stat.currentOptionCount++;
            }
          }
          stat.successRate = 0;
        }
      } else {
        stat.successRate = Math.max(0, stat.successRate - 20);
      }
    },
    resetStats() {
      this.$reset();
    },
    initMissingStats() {
      const defaultStats = {
        'fun-animal-jigsaw': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 2, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-vehicle-jigsaw': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 2, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-nature-jigsaw': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 2, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-number-puzzle': { currentPhase: 1, highestPhase: 5, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'fun-color-board': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 10, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-shape-sorter': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 10, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-shadow-match': { currentPhase: 1, highestPhase: 5, currentOptionCount: 2, highestOptionCount: 10, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'fun-size-sorter': { currentPhase: 1, highestPhase: 5, currentOptionCount: 3, highestOptionCount: 7, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'fun-pattern-train': { currentPhase: 1, highestPhase: 5, currentOptionCount: 3, highestOptionCount: 6, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'fun-category-bins': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 12, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'fun-memory-match': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 16, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'fun-connect-dots': { currentPhase: 1, highestPhase: 5, currentOptionCount: 5, highestOptionCount: 15, minOptionCount: 5, currentPromptLevel: 'none', successRate: 0 },
        'tier1-patches': { currentPhase: 1, highestPhase: 3, currentOptionCount: 2, highestOptionCount: 8, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'tier1-outlines': { currentPhase: 1, highestPhase: 3, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier1-basiclanguage': { currentPhase: 1, highestPhase: 6, currentOptionCount: 2, highestOptionCount: 8, minOptionCount: 2, currentPromptLevel: 'none', successRate: 0 },
        'tier1-matching-cars': { currentPhase: 1, highestPhase: 6, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier1-matching-animals': { currentPhase: 1, highestPhase: 6, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier2-odd-one-out': { currentPhase: 1, highestPhase: 4, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier2-combine-elephants': { currentPhase: 1, highestPhase: 4, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier2-combine-butterflies': { currentPhase: 1, highestPhase: 4, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier2-combine-trains': { currentPhase: 1, highestPhase: 4, currentOptionCount: 3, highestOptionCount: 8, minOptionCount: 3, currentPromptLevel: 'none', successRate: 0 },
        'tier2-arithmetics': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier2-count-everything': { currentPhase: 1, highestPhase: 4, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-combinetoys': { currentPhase: 1, highestPhase: 4, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-spatial-prepositions': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-perspectivetaking': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-auditory-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-flexible-language-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-nested-logic': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-analogies': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-timeprepositions': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-timeprepositions-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-passiveverbtense': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-catchup-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-subjectobject': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-subjectobject-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-carriesorrides': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-carriesorrides-memory': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 },
        'tier3-selectiveattention': { currentPhase: 1, highestPhase: 5, currentOptionCount: 4, highestOptionCount: 8, minOptionCount: 4, currentPromptLevel: 'none', successRate: 0 }
      };

      for (const [key, defaultStat] of Object.entries(defaultStats)) {
        if (!this.moduleStats[key as string]) {
          this.moduleStats[key as string] = { ...defaultStat } as any;
        }
      }
    }
  },
  persist: true,
});
