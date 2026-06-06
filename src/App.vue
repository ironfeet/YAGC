<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useProgressStore } from './stores/useProgressStore';
import { useSessionStore } from './stores/useSessionStore';

const route = useRoute();
const progressStore = useProgressStore();

import { watch } from 'vue';

watch(
  () => [route.path, route.query.tab, progressStore.mitaTheme, progressStore.funTheme],
  () => {
    const path = route.path || '';
    const tab = route.query.tab as string | undefined;
    const sessionStore = useSessionStore();

    if (path.includes('/fun')) {
      document.documentElement.setAttribute('data-theme', progressStore.funTheme || 'colorful');
    } else if (path.includes('/tier') || path.includes('/mita')) {
      document.documentElement.setAttribute('data-theme', progressStore.mitaTheme || 'dark');
    } else {
      // GlobalMenu, Settings, Statistics
      const activeTab = tab || sessionStore.lastActiveTab || progressStore.defaultHomeMenu;
      const theme = activeTab === 'fun' 
        ? (progressStore.funTheme || 'colorful')
        : (progressStore.mitaTheme || 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div id="yagc-app-root">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
#yagc-app-root {
  width: 100%;
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
