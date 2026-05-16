import { defineStore } from 'pinia';
import type { UserProgress } from '../types';

export const useProgressStore = defineStore('progress', {
  state: (): UserProgress => ({
    userId: 'jiacheng',
    currentTier: 1,
    unlockedModules: ['tier1-patches', 'tier1-outlines', 'tier1-basiclanguage', 'tier1-matching-cars', 'tier1-matching-animals', 'tier2-odd-one-out', 'tier2-combine-elephants', 'tier2-combine-butterflies', 'tier2-combine-trains', 'tier2-arithmetics', 'tier2-count-everything', 'tier3-spatial-prepositions', 'tier3-perspectivetaking', 'tier3-auditory-memory', 'tier3-flexible-language-memory', 'tier3-nested-logic'],
    moduleStats: {
      'tier1-patches': {
        currentPhase: 1,
        highestPhase: 3,
        currentOptionCount: 2,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-outlines': {
        currentPhase: 1,
        highestPhase: 3,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-basiclanguage': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 2,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-matching-cars': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier1-matching-animals': {
        currentPhase: 1,
        highestPhase: 6,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-odd-one-out': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-combinetoys': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-combine-elephants': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-combine-butterflies': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-combine-trains': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 3,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-arithmetics': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier2-count-everything': {
        currentPhase: 1,
        highestPhase: 4,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-spatial-prepositions': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-perspectivetaking': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-auditory-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-flexible-language-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-nested-logic': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-analogies': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-timeprepositions': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-timeprepositions-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-passiveverbtense': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-catchup-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-subjectobject': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-subjectobject-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-carriesorrides': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-carriesorrides-memory': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
      'tier3-selectiveattention': {
        currentPhase: 1,
        highestPhase: 5,
        currentOptionCount: 4,
        highestOptionCount: 8,
        currentPromptLevel: 'none',
        successRate: 0,
      },
    },
    defaultHomeMenu: 'mita', // Default home menu
  }),
  actions: {
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
                stat.currentOptionCount = 3;
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
    }
  },
  persist: true,
});
