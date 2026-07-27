package com.yourname.aiphone;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "PhoneContext")
public class PhoneContextPlugin extends Plugin {

    private ForegroundAppTracker tracker;

    @Override
    public void load() {
        tracker = new ForegroundAppTracker(getContext());
    }

    /**
     * 设置通知监听白名单
     * 前端调用: PhoneContext.setNotificationWhitelist({ apps: ['com.tencent.mm', 'com.eg.android.AlipayGphone'] })
     */
    @PluginMethod
    public void setNotificationWhitelist(PluginCall call) {
        JSArray apps = call.getArray("apps");
        Set<String> whitelist = new HashSet<>();
        if (apps != null) {
            for (int i = 0; i < apps.length(); i++) {
                try {
                    whitelist.add(apps.getString(i));
                } catch (Exception ignored) {}
            }
        }
        AppNotificationListener.setWhitelist(whitelist);
        call.resolve();
    }

    /**
     * 获取通知队列
     * 前端调用: PhoneContext.getNotifications()
     */
    @PluginMethod
    public void getNotifications(PluginCall call) {
        JSObject result = new JSObject();
        JSArray arr = new JSArray();
        synchronized (AppNotificationListener.getQueue()) {
            for (AppNotificationListener.NotificationItem item : AppNotificationListener.getQueue()) {
                JSObject obj = new JSObject();
                obj.put("package", item.packageName);
                obj.put("title", item.title);
                obj.put("text", item.text);
                obj.put("timestamp", item.timestamp);
                arr.put(obj);
            }
        }
        result.put("notifications", arr);
        call.resolve(result);
    }

    /**
     * 清空通知队列
     */
    @PluginMethod
    public void clearNotifications(PluginCall call) {
        AppNotificationListener.clearQueue();
        call.resolve();
    }

    /**
     * 获取当前前台应用
     * 前端调用: PhoneContext.getForegroundApp()
     */
    @PluginMethod
    public void getForegroundApp(PluginCall call) {
        JSObject result = new JSObject();
        result.put("packageName", tracker.getCurrentForegroundApp());
        result.put("appName", tracker.getCurrentForegroundAppName());
        result.put("lastChangeTime", tracker.getLastChangeTime());
        call.resolve(result);
    }
}
