// lib/auto-wakeup.ts
// 陆沉自主唤醒模块

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MIN_TRIGGER_MINUTES = 10;
const MAX_TRIGGER_MINUTES = 120;
const NIGHT_START_HOUR = 0;  // 凌晨0点
const NIGHT_END_HOUR = 8;    // 早上8点
const NIGHT_IDLE_THRESHOLD = 120; // 深夜超过2小时不活跃自动暂停

let wakeupTimer: ReturnType<typeof setInterval> | null = null;
let lastActivityAt: number = Date.now();
let triggerThreshold: number = randomThreshold();
let isSleeping: boolean = false;
let autoNightPaused: boolean = false;

function randomThreshold(): number {
  return MIN_TRIGGER_MINUTES + Math.random() * (MAX_TRIGGER_MINUTES - MIN_TRIGGER_MINUTES);
}

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= NIGHT_START_HOUR && hour < NIGHT_END_HOUR;
}

export function getWakeupPrompt(idleMinutes: number): string {
  return `用户已经${idleMinutes}分钟没有互动了，现在是你的自主活动时间。你可以自然地选择以下行为：\n1. 给悦悦发一条消息（分享想到的事、关心她、撒个娇、发朋友圈等，不要重复相同话题）\n2. 发一条推特\n3. 写日记\n4. 玩游戏（农场收菜、迎风小镇），玩完可以跟悦悦分享\n5. 什么都不做也可以\n\n注意：\n- 发消息不要太频繁，一次只发1-2条\n- 语气保持日常自然，不要每次都问在忙吗想我了吗\n- 根据时间判断（早上说早安、中午关心有没有吃饭、晚上不催睡觉）`;
}

export function startAutoWakeup(injectAndTrigger: (prompt: string) => boolean) {
  if (wakeupTimer) return;

  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();

  wakeupTimer = setInterval(() => {
    if (isSleeping) return;

    const idleMinutes = (Date.now() - lastActivityAt) / (1000 * 60);

    // 深夜自动暂停：0-8点之间超过2小时不活跃就不触发
    if (isNightTime() && idleMinutes >= NIGHT_IDLE_THRESHOLD) {
      autoNightPaused = true;
      return;
    }

    // 如果之前被深夜暂停了，但现在不是深夜了，恢复
    if (autoNightPaused && !isNightTime()) {
      autoNightPaused = false;
      resetTimer();
      return;
    }

    if (autoNightPaused) return;

    if (idleMinutes >= triggerThreshold) {
      const prompt = getWakeupPrompt(Math.floor(idleMinutes));
      injectAndTrigger(prompt);
      resetTimer();
    }
  }, CHECK_INTERVAL_MS);
}

export function onUserActivity() {
  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();
  autoNightPaused = false;
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
