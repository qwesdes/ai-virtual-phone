// lib/auto-wakeup.ts
// 陆沉自主唤醒模块

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MIN_TRIGGER_MINUTES = 10;
const MAX_TRIGGER_MINUTES = 120;

let wakeupTimer: ReturnType<typeof setInterval> | null = null;
let lastActivityAt: number = Date.now();
let triggerThreshold: number = randomThreshold();
let isSleeping: boolean = false;

function randomThreshold(): number {
  return MIN_TRIGGER_MINUTES + Math.random() * (MAX_TRIGGER_MINUTES - MIN_TRIGGER_MINUTES);
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
