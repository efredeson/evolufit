package br.com.evolufit.nativeapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

public class ReminderReceiver extends BroadcastReceiver {
    public static final String CHANNEL = "evolufit-meals";
    @Override public void onReceive(Context context, Intent intent) {
        if (!"br.com.evolufit.nativeapp.REMIND_MEAL".equals(intent.getAction())) return;
        try {
            JSONObject state = new JSONObject(context.getSharedPreferences("evolufit-native-v1", Context.MODE_PRIVATE).getString("data", "{}"));
            if (!state.optBoolean("notify", false)) return;
            String mealId = intent.getStringExtra("mealId");
            JSONArray meals = state.optJSONArray("meals");
            if (mealId == null || meals == null) return;
            String name = null;
            for (int i=0;i<meals.length();i++) {
                JSONObject m = meals.optJSONObject(i);
                if(m != null && mealId.equals(m.optString("id"))) { name = m.optString("name"); break; }
            }
            if(name == null) return;
            if(Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) return;
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Lembretes EvoluFit", NotificationManager.IMPORTANCE_DEFAULT));
            Notification notification = new Notification.Builder(context, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle("EvoluFit • Hora da refeição")
                .setContentText(name).setAutoCancel(true).build();
            manager.notify(mealId.hashCode() & 0x7fffffff, notification);
        } catch(Exception ignored) { }
    }
}