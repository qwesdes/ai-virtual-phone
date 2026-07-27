// lib/phone-context.ts
// 前端调用安卓原生通知监听和前台应用监听的接口

import { registerPlugin } from '@capacitor/core';

interface PhoneContextPlugin {
  setNotificationWhitelist(options: { apps: string[] }): Promise<void>;
  getNotifications(): Promise<{ notifications: NotificationItem[] }>;
  clearNotifications(): Promise<void>;
  getForegroundApp(): Promise<{ packageName: string; appName: string; lastChangeTime: number }>;
}

export interface NotificationItem {
  package: string;
  title: string;
  text: string;
  timestamp: number;
}

const PhoneContext = registerPlugin<PhoneContextPlugin>('PhoneContext');

/**
 * 设置要监听哪些APP的通知
 * 常用包名:
 * - 微信: com.tencent.mm
 * - QQ: com.tencent.mobileqq
 * - 抖音: com.ss.android.ugc.aweme
 * - 淘宝: com.taobao.taobao
 * - 美团: com.sankuai.meituan
 * - 饿了么: me.ele
 * - 钉钉: com.alibaba.android.rimet
 */
export async function setNotificationWhitelist(apps: string[]): Promise<void> {
  return PhoneContext.setNotificationWhitelist({ apps });
}

/**
 * 获取通知队列中的所有通知
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  const result = await PhoneContext.getNotifications();
  return result.notifications || [];
}

/**
 * 清空通知队列
 */
export async function clearNotifications(): Promise<void> {
  return PhoneContext.clearNotifications();
}

/**
 * 获取当前前台应用信息
 */
export async function getForegroundApp(): Promise<{
  packageName: string;
  appName: string;
  lastChangeTime: number;
}> {
  return PhoneContext.getForegroundApp();
}

/**
 * 生成通知上下文摘要（供AI使用）
 * 格式化通知队列为一段自然语言描述
 */
export async function getNotificationContext(): Promise<string> {
  const notifications = await getNotifications();
  if (notifications.length === 0) return '';

  const lines = notifications.slice(0, 10).map(n => {
    const time = new Date(n.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return `[${time}] ${n.title}: ${n.text}`;
  });

  return `用户手机近期通知:\n${lines.join('\n')}`;
}

/**
 * 生成前台应用上下文（供AI使用）
 */
export async function getForegroundContext(): Promise<string> {
  try {
    const info = await getForegroundApp();
    if (!info.appName || info.appName === 'unknown') return '';
    return `用户当前正在使用: ${info.appName}`;
  } catch {
    return '';
  }
}
