// lib/auto-wakeup.ts
// 陆沉自主唤醒模块 — 定时检查用户活跃状态，随机触发主动消息

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 每5分钟检查
const MIN_TRIGGER_MINUTES = 10;
const MAX_TRIGGER_MINUTES = 120;

let wakeupTimer: ReturnType<typeof setInterval> | null = null;
let lastActivityAt: number = Date.now();
let triggerThreshold: number = randomThreshold();
let isSleeping: boolean = false;

function randomThreshold(): number {
  return MIN_TRIGGER_MINUTES + Math.random() * (MAX_TRIGGER_MINUTES - MIN_TRIGGER_MINUTES);
}

export function startAutoWakeup(sessionId: string, injectAndTrigger: (sessionId: string, idleMinutes: number) => void) {
  if (wakeupTimer) return;

  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();

  wakeupTimer = setInterval(() => {
    if (isSleeping) return;

    const idleMinutes = (Date.now() - lastActivityAt) / (1000 * 60);

    if (idleMinutes >= triggerThreshold) {
      injectAndTrigger(sessionId, Math.floor(idleMinutes));
      resetTimer();
    }
  }, CHECK_INTERVAL_MS);
}

export function onUserActivity() {
  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();
}

export function pauseWakeup() {
  isSleeping = true;
}

export function resumeWakeup() {
  isSleeping = false;
  resetTimer();
}

export function stopAutoWakeup() {
  if (wakeupTimer) {
    clearInterval(wakeupTimer);
    wakeupTimer = null;
  }
}

function resetTimer() {
  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();
}
