package br.com.evolufit.nativeapp;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Calendar;

/** Private scheduled local meal reminders. No network or cloud required. */
public final class ReminderScheduler {
    private ReminderScheduler() {}
    private static PendingIntent intentFor(Context context,String id) {
        Intent intent=new Intent(context,ReminderReceiver.class)
            .setAction("br.com.evolufit.nativeapp.REMIND_MEAL")
            .putExtra("mealId",id);
        return PendingIntent.getBroadcast(context,id.hashCode(),intent,
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    public static void cancelMeal(Context context,String id){
        if(id==null||id.length()==0)return;
        AlarmManager alarm=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        if(alarm!=null)alarm.cancel(intentFor(context,id));
    }
    public static void schedule(Context context) {
        JSONObject data;
        try {data=new JSONObject(context.getSharedPreferences("evolufit-native-v1",Context.MODE_PRIVATE).getString("data","{}"));}
        catch(Exception e){return;}
        boolean enabled=data.optBoolean("notify",false);
        JSONArray meals=data.optJSONArray("meals");
        if(meals==null)return;
        AlarmManager alarm=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        if(alarm==null)return;
        for(int i=0;i<meals.length();i++){
            JSONObject meal=meals.optJSONObject(i);if(meal==null)continue;
            try{
                String id=meal.getString("id");String[] parts=meal.getString("time").split(":");
                int hour=Integer.parseInt(parts[0]),minute=Integer.parseInt(parts[1]);
                if(hour<0||hour>23||minute<0||minute>59)continue;
                PendingIntent pending=intentFor(context,id);
                alarm.cancel(pending);
                if(!enabled)continue;
                Calendar next=Calendar.getInstance();next.set(Calendar.HOUR_OF_DAY,hour);
                next.set(Calendar.MINUTE,minute);next.set(Calendar.SECOND,0);next.set(Calendar.MILLISECOND,0);
                if(next.getTimeInMillis()<=System.currentTimeMillis())next.add(Calendar.DAY_OF_YEAR,1);
                alarm.setInexactRepeating(AlarmManager.RTC_WAKEUP,next.getTimeInMillis(),AlarmManager.INTERVAL_DAY,pending);
            }catch(Exception ignored){}
        }
    }
}