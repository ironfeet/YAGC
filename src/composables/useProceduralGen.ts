import type { GameConfig } from '../types';

const COLORS = ['var(--color-red)', 'var(--color-blue)', 'var(--color-green)', 'var(--color-yellow)'];
const SHAPES = ['square', 'circle', 'triangle', 'diamond'];

export function useProceduralGen() {
  const generateLevel = (currentPhase: number, optionCount: number, moduleId: string): GameConfig => {
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    
    const distractors: Array<Record<string, string>> = [];
    
    if (moduleId === 'tier1-patches') {
      const availableColors = COLORS.filter(c => c !== targetColor);
      for (let i = 0; i < optionCount - 1; i++) {
        distractors.push({ color: availableColors[i % availableColors.length], shape: 'square' });
      }
    } else if (moduleId === 'tier1-outlines') {
      const availableShapes = SHAPES.filter(s => s !== targetShape);
      for (let i = 0; i < optionCount - 1; i++) {
        distractors.push({ color: targetColor, shape: availableShapes[i % availableShapes.length] });
      }
    }

    return {
      moduleId,
      tier: 1,
      currentPhase,
      optionCount,
      targetFeatures: { color: targetColor, shape: targetShape },
      distractors
    };
  };

  return {
    generateLevel
  };
}
