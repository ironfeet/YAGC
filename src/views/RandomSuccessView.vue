<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSpeech } from '../composables/useSpeech';

const router = useRouter();
const { playInstruction } = useSpeech();

onMounted(() => {
  playInstruction("Amazing job! You finished all your games! You are a superstar!");
});

const goMenu = () => {
  router.push('/');
};
</script>

<template>
  <div class="success-root">
    <div class="confetti-container">
      <div class="confetti" v-for="i in 50" :key="i" :style="{
        '--delay': `${Math.random() * 3}s`,
        '--duration': `${2 + Math.random() * 3}s`,
        '--x': `${Math.random() * 100}vw`,
        '--color': ['#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#ff9800'][Math.floor(Math.random() * 5)]
      }"></div>
    </div>
    
    <div class="content-card">
      <div class="emoji-bounce">🏆</div>
      <h1 class="title">Amazing Job!</h1>
      <p class="subtitle">You finished all your games!</p>
      
      <button @click="goMenu" class="btn-menu">
        Back to Menu
      </button>
    </div>
  </div>
</template>

<style scoped>
.success-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b0764);
  position: relative;
  overflow: hidden;
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 4rem 6rem;
  border-radius: 32px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  animation: pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.emoji-bounce {
  font-size: 8rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
  animation: bounce 2s infinite ease-in-out;
}

.title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.btn-menu {
  font-size: 1.5rem;
  font-weight: 800;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  border: none;
  background: white;
  color: #3b0764;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-menu:active {
  transform: scale(0.95);
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
}

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 15px;
  height: 15px;
  background: var(--color);
  top: -20px;
  left: var(--x);
  animation: fall var(--duration) linear var(--delay) infinite;
  border-radius: 2px;
}

@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
</style>
