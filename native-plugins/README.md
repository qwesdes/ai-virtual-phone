# 安卓原生插件

打包APK时需要将这些文件复制到对应的android项目目录中。

## 文件说明

### 1. NotificationListenerService (通知监听)
- `AppNotificationListener.java` → 复制到 `android/app/src/main/java/com/yourname/aiphone/`
- 需要在 `AndroidManifest.xml` 中注册 (见下方说明)
- 需要手动授权：设置 → 通知访问权限

### 2. UsageStats (前台应用监听)
- `ForegroundAppTracker.java` → 复制到 `android/app/src/main/java/com/yourname/aiphone/`
- 需要在 `AndroidManifest.xml` 中添加权限声明
- 需要手动授权：设置 → 使用情况访问权限

### 3. Capacitor插件桥接
- `PhoneContextPlugin.java` → 复制到 `android/app/src/main/java/com/yourname/aiphone/`
- 在 `MainActivity.java` 中注册插件

### 4. 前端调用
- `phone-context.ts` → 已在 `lib/` 目录下，前端直接 import 使用

## AndroidManifest.xml 需要添加的内容

```xml
<!-- 在 <manifest> 标签内添加权限 -->
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />

<!-- 在 <application> 标签内添加Service -->
<service
    android:name=".AppNotificationListener"
    android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
    android:exported="true">
    <intent-filter>
        <action android:name="android.service.notification.NotificationListenerService" />
    </intent-filter>
</service>
```

## MainActivity.java 注册插件

```java
import com.yourname.aiphone.PhoneContextPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PhoneContextPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```
