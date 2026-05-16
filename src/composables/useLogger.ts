/**
 * useLogger — YAGC Debug Logger
 *
 * Provides a structured, color-coded console logging API for all game modules.
 * Each module gets its own scoped instance. Logs are prefixed with the moduleId
 * and categorized with emoji for quick scanning in DevTools.
 *
 * Usage:
 *   const log = useLogger('tier2-arithmetics');
 *   log.generate({ phase, span, answerCount });
 *   log.success('target-3');
 *   log.error('wrong-drop');
 *
 * To suppress logs in production, set VITE_DISABLE_YAGC_LOGS=true in .env.production
 */

const ENABLED = import.meta.env.VITE_DISABLE_YAGC_LOGS !== 'true';

// Map module IDs to distinct console badge colors
const MODULE_COLORS: Record<string, string> = {
  'tier1-patches':                 '#6d9b6d',
  'tier1-outlines':                '#5b8fa8',
  'tier1-matchingcars':            '#c9843e',
  'tier1-matchinganimals':         '#a06090',
  'tier1-basiclanguage':           '#4a90d9',
  'tier2-combine-elephants':       '#d45f5f',
  'tier2-combine-butterflies':     '#c060b0',
  'tier2-combine-trains':          '#b07030',
  'tier2-odd-one-out':             '#208090',
  'tier2-count-everything':        '#207060',
  'tier2-arithmetics':             '#9050c0',
  'tier3-spatial-prepositions':    '#3060c0',
  'tier3-perspectivetaking':       '#306050',
  'tier3-auditory-memory':         '#a04040',
};

const defaultColor = '#555';

type LogLevel = 'info' | 'warn' | 'error';

export interface YAGCLogger {
  /** Level was generated. Pass the key config params. */
  generate(params: Record<string, unknown>): void;
  /** User dropped correctly. Pass the item id or label. */
  success(itemId: string, extra?: Record<string, unknown>): void;
  /** User dropped incorrectly. */
  error(itemId: string, extra?: Record<string, unknown>): void;
  /** Phase changed or threshold crossed. */
  phase(newPhase: number | string, reason?: string): void;
  /** Audio instruction fired. */
  audio(text: string): void;
  /** Component mounted / lifecycle events. */
  lifecycle(event: 'mounted' | 'unmounted' | 'started' | 'reset', extra?: Record<string, unknown>): void;
  /** Generic scoped info log. Use freely for anything else. */
  info(message: string, data?: Record<string, unknown>): void;
  /** Generic scoped warning. */
  warn(message: string, data?: Record<string, unknown>): void;
}

export function useLogger(moduleId: string): YAGCLogger {
  const color = MODULE_COLORS[moduleId] ?? defaultColor;

  const badge = `background:${color};color:#fff;font-weight:bold;border-radius:4px;padding:2px 6px`;
  const label = `[YAGC:${moduleId}]`;

  const print = (icon: string, category: string, level: LogLevel, data?: unknown) => {
    if (!ENABLED) return;

    const prefix = `%c${label}`;
    const title = `${icon} ${category}`;

    if (data !== undefined) {
      // Use console.groupCollapsed so DevTools keeps it tidy
      console.groupCollapsed(`${prefix} ${title}`, badge);
      if (level === 'error') console.error(data);
      else if (level === 'warn') console.warn(data);
      else console.log(data);
      console.groupEnd();
    } else {
      if (level === 'error') console.error(`${prefix} ${title}`, badge);
      else if (level === 'warn') console.warn(`${prefix} ${title}`, badge);
      else console.log(`${prefix} ${title}`, badge);
    }
  };

  return {
    generate(params) {
      print('⚙️', `generate  phase=${params.phase ?? '?'}  span=${params.span ?? '?'}`, 'info', params);
    },
    success(itemId, extra) {
      print('✅', `SUCCESS  id="${itemId}"`, 'info', extra ?? { itemId });
    },
    error(itemId, extra) {
      print('❌', `ERROR  id="${itemId}"`, 'warn', extra ?? { itemId });
    },
    phase(newPhase, reason) {
      print('📈', `PHASE → ${newPhase}${reason ? `  (${reason})` : ''}`, 'info', { newPhase, reason });
    },
    audio(text) {
      print('🔊', `audio: "${text}"`, 'info');
    },
    lifecycle(event, extra) {
      print('🔄', `lifecycle: ${event}`, 'info', extra);
    },
    info(message, data) {
      print('ℹ️', message, 'info', data);
    },
    warn(message, data) {
      print('⚠️', message, 'warn', data);
    },
  };
}
