package br.com.evolufit.nativeapp;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Restores meal reminders after reboot or APK replacement. */
public final class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        if(intent==null)return;
        String action=intent.getAction();
        if(Intent.ACTION_BOOT_COMPLETED.equals(action)||Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)){
            ReminderScheduler.schedule(context);
        }
    }
}