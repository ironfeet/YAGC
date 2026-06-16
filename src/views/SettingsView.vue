<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../stores/useProgressStore';
import packageJson from '../../package.json';

const router = useRouter();
const progressStore = useProgressStore();
const currentVersion = packageJson.version;

const latestVersion = ref<string | null>(null);
const updateAvailable = ref(false);
const checkingUpdate = ref(true);

const isNewerVersion = (latest: string, current: string) => {
  const lParts = latest.split('.').map(Number);
  const cParts = current.split('.').map(Number);
  for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
    const l = lParts[i] || 0;
    const c = cParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

const checkForUpdates = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/ironfeet/YAGC/releases/latest');
    if (response.ok) {
      const data = await response.json();
      if (data.tag_name) {
        const latest = data.tag_name.replace(/^v/, '');
        latestVersion.value = latest;
        if (isNewerVersion(latest, currentVersion)) {
          updateAvailable.value = true;
        }
      }
    }
  } catch (error) {
    console.error('Failed to check for updates', error);
  } finally {
    checkingUpdate.value = false;
  }
};

onMounted(() => {
  checkForUpdates();
});

const goBack = () => {
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="settings-container">
    <h2>Parent/Admin Settings</h2>
    
    <div class="setting-item">
      <label>Default Home Menu</label>
      <button class="toggle-btn" @click="progressStore.toggleHomeMenu()">
        Current: {{ progressStore.defaultHomeMenu.toUpperCase() }}
      </button>
    </div>

    <div class="setting-item">
      <label>MITA Game Theme</label>
      <select class="theme-select" v-model="progressStore.mitaTheme" @change="progressStore.setMitaTheme(($event.target as HTMLSelectElement).value)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="colorful">Colorful</option>
      </select>
    </div>

    <div class="setting-item">
      <label>Fun Game Theme</label>
      <select class="theme-select" v-model="progressStore.funTheme" @change="progressStore.setFunTheme(($event.target as HTMLSelectElement).value)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="colorful">Colorful</option>
      </select>
    </div>

    <button class="back-btn" @click="goBack">Back to Home</button>
    
    <div class="version-info">
      <p class="version-text">Current Version: v{{ currentVersion }}</p>
      <div v-if="!checkingUpdate" class="update-status">
        <span v-if="updateAvailable" class="update-available">
          ⚠️ Update available: v{{ latestVersion }}
        </span>
        <span v-else class="update-latest">
          ✅ You are on the latest version.
        </span>
      </div>
      <div v-else class="checking-status">
        Checking for updates...
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  height: 100%;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
}

button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
}

.toggle-btn {
  background-color: var(--color-target);
  color: white;
}

.back-btn {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
}

.theme-select {
  padding: 0.75rem 1.5rem;
  font-size: 1.5rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  cursor: pointer;
  outline: none;
}

.version-info {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.version-text {
  color: var(--text-secondary);
  font-size: 1.2rem;
  opacity: 0.7;
  margin: 0;
}

.update-status {
  font-size: 1.1rem;
}

.update-available {
  color: #ff9800;
  font-weight: bold;
}

.update-latest {
  color: #4caf50;
  opacity: 0.8;
}

.checking-status {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0.5;
  font-style: italic;
}
</style>
