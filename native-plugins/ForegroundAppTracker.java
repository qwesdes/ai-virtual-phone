package com.yourname.aiphone;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class ForegroundAppTracker {

    private final Context context;
    private String lastForegroundApp = "";
    private long lastChangeTime = 0;

    public ForegroundAppTracker(Context context) {
        this.context = context;
    }

    /**
     * 获取当前前台应用包名
     */
    public String getCurrentForegroundApp() {
        UsageStatsManager usm = (UsageStatsManager)
            context.getSystemService(Context.USAGE_STATS_SERVICE);
        if (usm == null) return "unknown";

        long now = System.currentTimeMillis();
        List<UsageStats> stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_BEST, now - 10000, now
        );

        if (stats == null || stats.isEmpty()) return "unknown";

        SortedMap<Long, UsageStats> sorted = new TreeMap<>();
        for (UsageStats s : stats) {
            sorted.put(s.getLastTimeUsed(), s);
        }

        if (sorted.isEmpty()) return "unknown";
        String topPackage = sorted.get(sorted.lastKey()).getPackageName();

        if (!topPackage.equals(lastForegroundApp)) {
            lastForegroundApp = topPackage;
            lastChangeTime = now;
        }

        return topPackage;
    }

    /**
     * 获取应用名称（中文）
     */
    public String getAppName(String packageName) {
        try {
            PackageManager pm = context.getPackageManager();
            ApplicationInfo info = pm.getApplicationInfo(packageName, 0);
            return pm.getApplicationLabel(info).toString();
        } catch (PackageManager.NameNotFoundException e) {
            return packageName;
        }
    }

    /**
     * 获取当前前台应用的友好名称
     */
    public String getCurrentForegroundAppName() {
        return getAppName(getCurrentForegroundApp());
    }

    /**
     * 获取上次切换应用的时间
     */
    public long getLastChangeTime() {
        return lastChangeTime;
    }
}
