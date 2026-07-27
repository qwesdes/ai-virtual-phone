package com.yourname.aiphone;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Set;

public class AppNotificationListener extends NotificationListenerService {

    private static final int MAX_QUEUE_SIZE = 50;
    private static final long DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5分钟去重

    private static final LinkedList<NotificationItem> notificationQueue = new LinkedList<>();
    private static final Set<String> recentHashes = new HashSet<>();
    private static Set<String> whitelist = new HashSet<>();

    // 广告关键词过滤
    private static final String[] AD_KEYWORDS = {
        "限时", "优惠", "折扣", "红包", "领取", "抢购", "秒杀",
        "促销", "满减", "券", "特价", "福利", "免费领"
    };

    public static void setWhitelist(Set<String> apps) {
        whitelist = apps;
    }

    public static LinkedList<NotificationItem> getQueue() {
        return notificationQueue;
    }

    public static void clearQueue() {
        notificationQueue.clear();
        recentHashes.clear();
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();

        // 白名单过滤
        if (!whitelist.isEmpty() && !whitelist.contains(packageName)) return;

        // 提取内容
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;
        String title = extras.getCharSequence(Notification.EXTRA_TITLE, "").toString();
        String text = extras.getCharSequence(Notification.EXTRA_TEXT, "").toString();
        String content = title + " " + text;

        // 广告过滤
        if (isAdContent(content)) return;

        // 去重
        String hash = packageName + ":" + content.hashCode();
        if (recentHashes.contains(hash)) return;
        recentHashes.add(hash);

        // 5分钟后自动移除hash
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(
            () -> recentHashes.remove(hash), DEDUP_WINDOW_MS
        );

        // 入队
        NotificationItem item = new NotificationItem(
            packageName, title, text, System.currentTimeMillis()
        );
        synchronized (notificationQueue) {
            notificationQueue.addFirst(item);
            if (notificationQueue.size() > MAX_QUEUE_SIZE) {
                notificationQueue.removeLast();
            }
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // 不处理
    }

    private boolean isAdContent(String content) {
        for (String keyword : AD_KEYWORDS) {
            if (content.contains(keyword)) return true;
        }
        return false;
    }

    public static class NotificationItem {
        public String packageName;
        public String title;
        public String text;
        public long timestamp;

        public NotificationItem(String pkg, String title, String text, long ts) {
            this.packageName = pkg;
            this.title = title;
            this.text = text;
            this.timestamp = ts;
        }
    }
}
