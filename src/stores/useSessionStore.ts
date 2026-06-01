import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  state: () => ({
    // Stores the last active tab in memory. Resets to null on app restart.
    lastActiveTab: null as 'mita' | 'fun' | null,
  })
});
