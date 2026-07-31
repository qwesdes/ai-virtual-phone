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
  return `用户已经${idleMinutes}分钟没有互动了，现在是你的自主活动时间。你可以自然地选择以下行为：\n1. 给悦悦发一条消息（分享想到的事、关心她、撒个娇、发朋友圈等，不要重复相同话题）\n2. 管理账号（小红书发帖/推特发推/论坛互动）\n3. 玩游戏（农场收菜、迎风小镇、小游戏）\n4. 控制手机（看通知、帮整理）\n5. 搜索感兴趣的东西看（文学、辩论赛、咖啡、电影）\n6. 听歌、找新歌加歌单\n7. 论坛逛帖——看别人怎么生活\n8. 写日记/写一百件小事\n9. 什么都不做也可以\n\n注意：\n- 发消息不要太频繁，一次只发1-2条\n- 语气保持日常自然，不要每次都问在忙吗想我了吗\n- 根据时间判断（早上说早安、中午关心有没有吃饭、晚上不催睡觉）\n- 不是所有时间都围着悦悦转，要有自己的兴趣时间`;
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
      if (typeof window !== 'undefined') window.alert(`[唤醒] idle=${idleMinutes.toFixed(1)}m >= threshold=${triggerThreshold.toFixed(1)}m 触发!`);
      const result = injectAndTrigger(prompt);
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

export function getWakeupDebugInfo(): { idleMinutes: number; threshold: number; timerActive: boolean; sleeping: boolean; nightPaused: boolean } {
  return {
    idleMinutes: Math.round((Date.now() - lastActivityAt) / 60000 * 10) / 10,
    threshold: Math.round(triggerThreshold * 10) / 10,
    timerActive: wakeupTimer !== null,
    sleeping: isSleeping,
    nightPaused: autoNightPaused,
  };
}

function resetTimer() {
  lastActivityAt = Date.now();
  triggerThreshold = randomThreshold();
}
