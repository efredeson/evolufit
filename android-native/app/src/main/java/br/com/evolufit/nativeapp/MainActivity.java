package br.com.evolufit.nativeapp;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.app.TimePickerDialog;
import android.content.ContentValues;
import android.net.Uri;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.ColorDrawable;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.HorizontalScrollView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.text.ParseException;
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;

/** EvoluFit, real Android Views; no browser, PWA or WebView. */
public class MainActivity extends Activity {
    private static final int BLACK=0xff000000, PANEL=0xff060c06, EDGE=0xff467124,
        GREEN=0xffb9ff18, WHITE=0xfff7fff2, MUTED=0xffaac0a5, DANGER=0xffff9898,
        MID=0xff132910, SOFT=0xff92eb29;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private JSONObject data;
    private String page="inicio", plan="iniciante";
    private int exerciseIndex=0;
    private long sessionElapsed=0L;
    private boolean guideResting=false;
    private String lastPage="inicio";
    private static final int EXPORT_JSON=702;
    private LinearLayout content;
    private TextView timerValue;
    private TextView liveTime;
    private boolean clockRunning=false, countdown=false;
    private long runningFrom=0L, elapsedBefore=0L, countdownTotal=300000L;
    private final Runnable ticker=new Runnable(){@Override public void run(){
        if(timerValue!=null) timerValue.setText(clockDisplay());
        if(liveTime!=null)liveTime.setText("HORA ATUAL   "+new SimpleDateFormat("HH:mm:ss",Locale.getDefault()).format(new Date()));
        if(clockRunning&&countdown&&currentElapsed()>=countdownTotal){
            elapsedBefore=countdownTotal;clockRunning=false;toast("Tempo encerrado!");
        }
        handler.postDelayed(this,220);
    }};
    private static final String[][] PLANS={
        {"iniciante","Primeiros passos","Marcha no lugar","Sentar e levantar","Elevação de braços","Alongamento leve"},
        {"mobilidade","Mobilidade e postura","Marcha no lugar","Passos laterais","Elevação de braços","Alongamento leve"},
        {"corpo","Corpo completo","Agachamento adaptado","Flexão na parede","Prancha adaptada","Alongamento leve"},
        {"energia","Energia do dia","Marcha no lugar","Passos laterais","Agachamento adaptado","Alongamento leve"}
    };
    @Override public void onCreate(Bundle b){super.onCreate(b);
        getWindow().setStatusBarColor(BLACK);getWindow().setNavigationBarColor(BLACK);
        getWindow().getDecorView().setSystemUiVisibility(0);
        try{data=new JSONObject(getSharedPreferences("evolufit-native-v1",MODE_PRIVATE).getString("data","{}"));}catch(Exception e){data=new JSONObject();}
        handler.post(ticker);render();
        if(!getSharedPreferences("evolufit-native-v1",MODE_PRIVATE).getBoolean("welcomeSeen",false)){
            getSharedPreferences("evolufit-native-v1",MODE_PRIVATE).edit().putBoolean("welcomeSeen",true).apply();
            handler.postDelayed(this::welcome,420);
        }
    }
    private void welcome(){
        EditText nickname=field("Como podemos chamar você? (opcional)",1);
        nickname.setPadding(dp(22),dp(10),dp(18),dp(10));
        new AlertDialog.Builder(this).setTitle("🐱 Bem-vindo ao EvoluFit!")
        .setMessage("Sua evolução é a missão. Treine em casa e registre seu progresso, no seu ritmo.")
        .setView(nickname).setNegativeButton("Pular",null)
        .setPositiveButton("Começar",(d,w)->{
            try{String n=nickname.getText().toString().trim();if(!n.isEmpty())data.put("name",n.substring(0,Math.min(n.length(),60)));save();render();}
            catch(Exception ignored){}
        }).show();
    }
    @Override public void onDestroy(){handler.removeCallbacks(ticker);super.onDestroy();}
    private void save(){getSharedPreferences("evolufit-native-v1",MODE_PRIVATE).edit().putString("data",data.toString()).apply();}
    private JSONArray arr(String key){JSONArray a=data.optJSONArray(key);if(a==null){a=new JSONArray();try{data.put(key,a);}catch(Exception ignored){}}return a;}
    private String today(){return new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date());}
    private void toast(String s){Toast.makeText(this,s,Toast.LENGTH_SHORT).show();}
    private int dp(float size){return (int)(getResources().getDisplayMetrics().density*size+.5f);}
    private GradientDrawable bg(int color,int stroke,int radius){GradientDrawable d=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{color,color==GREEN?0xff74c800:0xff010401});d.setCornerRadius(dp(radius));if(stroke!=0)d.setStroke(dp(1),stroke);return d;}
    private LinearLayout col(){LinearLayout a=new LinearLayout(this);a.setOrientation(1);return a;}
    private LinearLayout row(){LinearLayout a=new LinearLayout(this);a.setOrientation(0);a.setGravity(Gravity.CENTER_VERTICAL);return a;}
    private LinearLayout.LayoutParams lp(int w,int h,int margin){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(w<0?w:dp(w),h<0?h:dp(h));p.setMargins(0,0,0,dp(margin));return p;}
    private TextView text(String val,int size,int color,boolean heavy){TextView t=new TextView(this);t.setText(val);t.setTextSize(size);t.setTextColor(color);t.setGravity(Gravity.CENTER_VERTICAL);t.setTypeface(Typeface.create(heavy?"sans-serif-condensed-black":"sans-serif-medium",heavy?Typeface.BOLD_ITALIC:Typeface.NORMAL));return t;}
    private TextView button(String label,boolean bright,Runnable click){TextView b=text(label,19,bright?0xff102000:WHITE,true);b.setGravity(Gravity.CENTER);b.setBackground(bg(bright?GREEN:0xff111b11,bright?0xffcaff5f:EDGE,13));b.setPadding(dp(13),dp(12),dp(13),dp(12));b.setMinHeight(dp(47));b.setOnClickListener(v->click.run());return b;}
    private LinearLayout card(){LinearLayout p=col();p.setBackground(bg(PANEL,EDGE,17));p.setPadding(dp(17),dp(17),dp(17),dp(17));return p;}
    private TextView kicker(String s){TextView t=text(s,11,GREEN,true);t.setLetterSpacing(.10f);return t;}
    private void rule(LinearLayout parent){View l=new View(this);l.setBackgroundColor(0xff284823);parent.addView(l,lp(-1,1,12));}
    private void chips(LinearLayout parent,String... labels){LinearLayout r=row();for(String s:labels){TextView t=text(s,12,SOFT,true);t.setPadding(dp(9),dp(6),dp(9),dp(6));t.setBackground(bg(0xff11210c,EDGE,18));LinearLayout.LayoutParams p=lp(-2,-2,0);p.setMargins(0,0,dp(6),0);r.addView(t,p);}parent.addView(r,lp(-1,-2,11));}
    private void greenBar(LinearLayout parent,int filled,int total){LinearLayout b=row();for(int i=0;i<total;i++){View block=new View(this);block.setBackground(bg(i<filled?GREEN:0xff1d3419,i<filled?SOFT:0xff365527,5));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(9),1);p.setMargins(dp(2),0,dp(2),0);b.addView(block,p);}parent.addView(b,lp(-1,-2,12));}
    private boolean doneToday(String name){JSONArray a=arr("workouts");for(int i=0;i<a.length();i++){JSONObject o=a.optJSONObject(i);if(o!=null&&today().equals(o.optString("date"))&&name.equals(o.optString("name")))return true;}return false;}
    private String selectedPlan(){String sel=data.optString("dailyPlan","iniciante");for(String[] p:PLANS)if(p[0].equals(sel))return sel;return "iniciante";}
    private void chooseDailyMission(){String[] ids={"iniciante","mobilidade","corpo","energia"};String[] labels=new String[PLANS.length];int current=0;for(int i=0;i<PLANS.length;i++){labels[i]=PLANS[i][1];if(ids[i].equals(selectedPlan()))current=i;}
        new AlertDialog.Builder(this).setTitle("Escolher minha missão").setSingleChoiceItems(labels,current,(d,w)->{try{data.put("dailyPlan",ids[w]);save();render();}catch(Exception ignored){}d.dismiss();}).setNegativeButton("Cancelar",null).show();}
    private void confirmDelete(String title,Runnable action){new AlertDialog.Builder(this).setTitle(title).setMessage("Esta ação remove apenas o registro selecionado.").setNegativeButton("Cancelar",null).setPositiveButton("Excluir",(d,w)->action.run()).show();}
    private void removeArrayItem(String key,int index){JSONArray old=arr(key),next=new JSONArray();for(int i=0;i<old.length();i++)if(i!=index)next.put(old.opt(i));try{data.put(key,next);save();render();}catch(Exception ignored){}}
    private String dayString(String day){if(today().equals(day))return "HOJE";return day;}
    private int activityCountThisWeek(){Calendar start=Calendar.getInstance();start.add(Calendar.DAY_OF_YEAR,-6);String first=new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(start.getTime());Set<String> days=new HashSet<>();for(String key:new String[]{"walks","workouts"}){JSONArray a=arr(key);for(int i=0;i<a.length();i++){JSONObject o=a.optJSONObject(i);if(o!=null){String d=o.optString("date");if(d.compareTo(first)>=0&&d.compareTo(today())<=0)days.add(d);}}}return days.size();}
    private void snack(String msg){toast(msg);}

    private void section(LinearLayout box,String title,String detail){box.addView(text(title,27,WHITE,true),lp(-1,-2,3));if(detail!=null&&!detail.isEmpty())box.addView(text(detail,14,MUTED,false),lp(-1,-2,13));}
    private void label(LinearLayout box,String value){box.addView(text(value,13,MUTED,false),lp(-1,-2,7));}
    private void addSpace(LinearLayout box,int h){View v=new View(this);box.addView(v,lp(1,h,0));}
    private void render(){
        timerValue=null;liveTime=null;
        LinearLayout root=col();root.setBackgroundColor(BLACK);
        root.setFitsSystemWindows(Build.VERSION.SDK_INT<30);
        if(Build.VERSION.SDK_INT>=30)root.setOnApplyWindowInsetsListener((v,i)->{
            android.graphics.Insets in=i.getInsets(WindowInsets.Type.systemBars());v.setPadding(in.left,in.top,in.right,in.bottom);return i;
        });
        setContentView(root);
        LinearLayout header=row();header.setPadding(dp(13),dp(8),dp(13),dp(8));header.setBackgroundColor(BLACK);
        ImageView brand=image("mascot.webp",40);brand.setLayoutParams(new LinearLayout.LayoutParams(dp(42),dp(42)));header.addView(brand);
        LinearLayout brandText=col();brandText.setPadding(dp(7),0,0,0);
        TextView mark=text("EvoluFit",23,WHITE,true);android.text.SpannableString styled=new android.text.SpannableString("EvoluFit");
        styled.setSpan(new android.text.style.ForegroundColorSpan(GREEN),5,8,0);mark.setText(styled);
        brandText.addView(mark);brandText.addView(text("SUA EVOLUÇÃO É A MISSÃO",9,SOFT,true));
        header.addView(brandText,new LinearLayout.LayoutParams(0,-2,1));
        IconMark bell=new IconMark(this,"notificacoes",GREEN);bell.setOnClickListener(v->open("notificacoes"));
        header.addView(bell,lp(33,33,0));root.addView(header,lp(-1,-2,0));
        View line=new View(this);line.setBackgroundColor(EDGE);root.addView(line,lp(-1,1,0));
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(false);scroll.setClipToPadding(false);
        content=col();content.setPadding(dp(13),dp(14),dp(13),dp(23));scroll.addView(content);
        root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout bottom=row();bottom.setPadding(dp(5),dp(6),dp(5),dp(6));bottom.setBackground(bg(BLACK,0xff4b7521,12));
        String[][] nav={{"inicio","Início"},{"treinos","Treinos"},{"evolucao","Evolução"},{"perfil","Perfil"}};
        for(String[] item:nav){boolean sel=page.equals(item[0])||(page.equals("guia")&&item[0].equals("treinos"));
            LinearLayout tab=col();tab.setGravity(Gravity.CENTER);tab.setBackground(bg(sel?0xff203914:BLACK,sel?GREEN:0,12));
            tab.addView(new IconMark(this,item[0],sel?GREEN:0xffb1c4b2),lp(28,28,2));
            TextView label=text(item[1],12,sel?GREEN:MUTED,sel);label.setGravity(Gravity.CENTER);tab.addView(label);
            tab.setContentDescription("Abrir "+item[1]);tab.setOnClickListener(v->open(item[0]));
            LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(59),1);p.setMargins(dp(2),0,dp(2),0);bottom.addView(tab,p);
        }
        root.addView(bottom,lp(-1,-2,0));
        switch(page){
            case "inicio":home();break;case "treinos":trainings();break;case "guia":guide();break;
            case "caminhadas":walks();break;case "alimentacao":food();break;
            case "evolucao":evolution();break;case "fotos":photos();break;
            case "cronometro":timer();break;case "notificacoes":notifications();break;
            default:profile();
        }
    }
    private void open(String page){this.page=page;render();}
    private ImageView image(String path,int height){ImageView image=new ImageView(this);image.setScaleType(ImageView.ScaleType.FIT_CENTER);
        try(InputStream in=getAssets().open(path)){image.setImageBitmap(BitmapFactory.decodeStream(in));}catch(Exception ignored){}
        image.setLayoutParams(lp(-1,height,9));image.setContentDescription("Ilustração EvoluFit");return image;
    }
    private String pic(String name){String s=name.toLowerCase(Locale.ROOT);
        if(s.contains("marcha"))return "exercises/marcha.webp";
        if(s.contains("sentar"))return "exercises/cadeira.webp";
        if(s.contains("braços"))return "exercises/bracos.webp";
        if(s.contains("laterais"))return "exercises/lateral.webp";
        if(s.contains("agachamento"))return "exercises/agachamento.webp";
        if(s.contains("parede"))return "exercises/parede.webp";
        if(s.contains("prancha"))return "exercises/prancha.webp";
        return "exercises/alongamento.webp";
    }
    private int count(String key){return arr(key).length();}
    private void home(){
        String name=data.optString("name","").trim();String[] mission=planFor(selectedPlan());
        LinearLayout hero=card();hero.setPadding(dp(11),dp(13),dp(8),dp(8));
        LinearLayout cover=row();ImageView mascot=image("mascot.webp",151);cover.addView(mascot,new LinearLayout.LayoutParams(0,dp(158),.90f));
        LinearLayout intro=col();intro.setGravity(Gravity.CENTER_VERTICAL);
        intro.addView(kicker("◆ FOCO · DISCIPLINA"),lp(-1,-2,5));
        intro.addView(text("CENTRAL DE",30,WHITE,true));intro.addView(text("MISSÕES",43,GREEN,true));
        intro.addView(text("Olá, "+(name.isEmpty()?"atleta":name)+"!",20,WHITE,true),lp(-1,-2,3));
        intro.addView(text("Vamos evoluir hoje?",13,MUTED,false));cover.addView(intro,new LinearLayout.LayoutParams(0,-1,1.2f));
        hero.addView(cover);content.addView(hero,lp(-1,-2,12));
        LinearLayout daily=card();daily.addView(kicker("MISSÃO DO DIA"),lp(-1,-2,5));
        LinearLayout missionTitle=row();missionTitle.addView(new IconMark(this,"treinos",GREEN),lp(35,35,0));
        LinearLayout nameBox=col();nameBox.setPadding(dp(12),0,0,0);nameBox.addView(text(mission[1],27,WHITE,true));
        nameBox.addView(text("4 exercícios · tempo no seu ritmo",13,MUTED,false));missionTitle.addView(nameBox);
        daily.addView(missionTitle,lp(-1,-2,12));
        daily.addView(text(doneToday(mission[1])?"✓ Concluída hoje":"● Pronta para começar",14,SOFT,true),lp(-1,-2,9));
        daily.addView(button("▶ COMEÇAR MISSÃO",true,()->startPlan(mission[0])),lp(-1,-2,8));
        daily.addView(button("TROCAR MISSÃO",false,this::chooseDailyMission));content.addView(daily,lp(-1,-2,13));
        section(content,"MINHAS ATIVIDADES",null);
        tiles(new String[][]{{"treinos","TREINOS"},{"caminhadas","CAMINHADAS"},{"alimentacao","ALIMENTAÇÃO"},{"cronometro","CRONÔMETRO"}});
        LinearLayout progress=card();section(progress,"PROGRESSO REAL","Últimos sete dias");
        int days=activityCountThisWeek();progress.addView(text(days+" / 7 dias com atividade",23,GREEN,true),lp(-1,-2,11));
        greenBar(progress,days,7);
        progress.addView(text(count("workouts")+" treinos · "+count("walks")+" caminhadas registrados",14,MUTED,false),lp(-1,-2,14));
        progress.addView(button("VER MINHA EVOLUÇÃO ›",false,()->open("evolucao")));content.addView(progress);
    }
    private void startPlan(String which){plan=which;exerciseIndex=0;clockRunning=false;countdown=false;elapsedBefore=0;sessionElapsed=0;guideResting=false;open("guia");}
    private void tiles(String[][] items){for(int start=0;start<items.length;start+=2){LinearLayout r=row();for(int j=start;j<Math.min(start+2,items.length);j++){
        String[] it=items[j];LinearLayout t=card();t.setGravity(Gravity.CENTER);t.setPadding(dp(7),dp(10),dp(7),dp(10));
        t.addView(new IconMark(this,it[0],GREEN),lp(46,46,8));TextView name=text(it[1],19,WHITE,true);name.setGravity(Gravity.CENTER);t.addView(name);
        t.setOnClickListener(v->open(it[0]));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(109),1);p.setMargins(dp(2),0,dp(7),dp(10));r.addView(t,p);
    }content.addView(r,lp(-1,-2,0));}}
    private String[] planFor(String id){for(String[] p:PLANS)if(p[0].equals(id))return p;return PLANS[0];}
    private void trainings(){
        section(content,"ESCOLHA SEU TREINO","Quatro missões adaptáveis para fazer em casa.");
        for(String[] p:PLANS){LinearLayout c=card();LinearLayout heading=row();
            LinearLayout headingText=col();headingText.addView(text(p[1].toUpperCase(Locale.ROOT),27,WHITE,true));
            headingText.addView(text("4 movimentos · imagens passo a passo",13,MUTED,false));
            heading.addView(headingText,new LinearLayout.LayoutParams(0,-2,1));
            heading.addView(new IconMark(this,"treinos",GREEN),lp(31,31,0));c.addView(heading,lp(-1,-2,7));
            ImageView picture=image(pic(p[2]),140);picture.setBackground(bg(0xff081208,EDGE,11));c.addView(picture);
            c.addView(button("▶ INICIAR "+p[1].toUpperCase(Locale.ROOT),true,()->startPlan(p[0])));
            content.addView(c,lp(-1,-2,14));
        }
        JSONArray logs=arr("workouts");LinearLayout history=card();section(history,"TREINOS CONCLUÍDOS",logs.length()+" registro(s)");
        if(logs.length()==0)history.addView(text("O histórico aparece depois da sua primeira missão.",14,MUTED,false));
        for(int i=logs.length()-1;i>=Math.max(0,logs.length()-12);i--){JSONObject o=logs.optJSONObject(i);if(o==null)continue;
            final int idx=i;LinearLayout row=row();LinearLayout info=col();info.addView(text("✓ "+o.optString("name"),18,WHITE,true));
            String length=o.has("seconds")?" · "+formatSeconds(o.optLong("seconds")):"";
            info.addView(text(o.optString("date")+length,13,MUTED,false));row.addView(info,new LinearLayout.LayoutParams(0,-2,1));
            row.addView(button("×",false,()->confirmDelete("Excluir treino?",()->removeArrayItem("workouts",idx))),lp(42,43,0));
            history.addView(row,lp(-1,-2,10));
        }content.addView(history,lp(-1,-2,10));
        label(content,"Se sentir dor, tontura ou falta de ar incomum, interrompa a atividade.");
    }
    private String exerciseCue(String step){
        String s=step.toLowerCase(Locale.ROOT);
        if(s.contains("marcha"))return "Marcha no lugar, elevando os joelhos com conforto e alternando os braços.";
        if(s.contains("sentar"))return "Use uma cadeira firme. Sente devagar e levante com controle.";
        if(s.contains("braços"))return "Eleve os braços até onde estiver confortável. Desça lentamente.";
        if(s.contains("lateral"))return "Dê um passo para cada lado, mantendo o tronco estável.";
        if(s.contains("agachamento"))return "Flexione quadris e joelhos sem forçar a amplitude. Mantenha os pés firmes.";
        if(s.contains("parede"))return "Apoie as mãos na parede, flexione os braços e empurre de volta.";
        if(s.contains("prancha"))return "Mantenha tronco alinhado. Apoie os joelhos se precisar.";
        return "Alongue suavemente, sem balanços ou dor.";
    }
    private String formatSeconds(long sec){return String.format(Locale.US,"%02d:%02d",sec/60,sec%60);}
    private void guide(){
        String[] p=planFor(plan);String step=p[Math.min(exerciseIndex+2,p.length-1)];
        content.addView(kicker("MISSÃO ATIVA · "+p[1].toUpperCase(Locale.ROOT)),lp(-1,-2,5));
        section(content,guideResting?"DESCANSO":"TREINO GUIADO", "Etapa "+(exerciseIndex+1)+" de 4");
        greenBar(content,exerciseIndex+1,4);
        LinearLayout c=card();
        if(guideResting){
            c.addView(text("PAUSA PARA RESPIRAR",26,GREEN,true),lp(-1,-2,7));
            c.addView(text("Descanse até 30 segundos e retome quando estiver pronto.",16,MUTED,false),lp(-1,-2,9));
        }else{
            ImageView illustration=image(pic(step),260);illustration.setBackground(bg(0xff081208,EDGE,12));c.addView(illustration);
            c.addView(text(step.toUpperCase(Locale.ROOT),29,WHITE,true),lp(-1,-2,7));
            c.addView(text(exerciseCue(step),16,MUTED,false),lp(-1,-2,13));
        }
        TextView clock=text(clockDisplay(),44,GREEN,true);clock.setGravity(Gravity.CENTER);
        clock.setBackground(bg(0xff0b1c0a,GREEN,70));clock.setPadding(dp(7),dp(16),dp(7),dp(16));
        timerValue=clock;c.addView(clock,lp(-1,97,12));
        c.addView(button(clockRunning?"⏸ PAUSAR":"▶ "+(guideResting?"CONTAR DESCANSO":"INICIAR TEMPO"),true,()->{toggleClock();render();}),lp(-1,-2,9));
        if(!guideResting&&exerciseIndex<3){
            c.addView(button("⏱ DESCANSAR 30s E AVANÇAR",false,()->{finishStep();exerciseIndex++;countdown=true;countdownTotal=30000L;guideResting=true;clockRunning=true;runningFrom=SystemClock.elapsedRealtime();render();}),lp(-1,-2,11));
        }
        LinearLayout next=row();next.addView(button("‹ ANTERIOR",false,()->{if(exerciseIndex>0){finishStep();exerciseIndex--;guideResting=false;render();}}),new LinearLayout.LayoutParams(0,dp(50),1));
        TextView advance=button(guideResting?"PULAR PAUSA ›":exerciseIndex==3?"✓ CONCLUIR":"PRÓXIMO ›",false,()->{
            if(guideResting){pauseClock();elapsedBefore=0;countdown=false;guideResting=false;render();return;}
            finishStep();if(exerciseIndex==3){confirmComplete(p);}else{exerciseIndex++;render();}
        });
        LinearLayout.LayoutParams px=new LinearLayout.LayoutParams(0,dp(50),1);px.setMargins(dp(9),0,0,0);
        next.addView(advance,px);c.addView(next);content.addView(c,lp(-1,-2,13));
        content.addView(button("SAIR DO TREINO",false,()->{finishStep();open("treinos");}),lp(-1,-2,9));
        label(content,"Demonstrações ilustrativas. Não substituem orientação profissional.");
    }
    private void finishStep(){pauseClock();if(!guideResting)sessionElapsed+=elapsedBefore;elapsedBefore=0;clockRunning=false;countdown=false;guideResting=false;}
    private void confirmComplete(String[] p){
        long seconds=Math.max(0,sessionElapsed/1000);new AlertDialog.Builder(this)
        .setTitle("Missão concluída!")
        .setMessage(p[1]+" · "+formatSeconds(seconds)+" de atividade cronometrada. Salvar no histórico?")
        .setNegativeButton("Voltar",null).setPositiveButton("Salvar treino",(d,w)->{
            JSONObject record=new JSONObject();try{
                record.put("date",today());record.put("name",p[1]);record.put("seconds",seconds);
                record.put("id",System.currentTimeMillis());arr("workouts").put(record);save();
            }catch(Exception ignored){}
            clockRunning=false;elapsedBefore=0;sessionElapsed=0;open("treinos");toast("Treino registrado! Mais uma missão completa.");
        }).show();
    }
    private void walks(){
        section(content,"MINHAS CAMINHADAS","Atividades reais, sem GPS ou passos inventados.");
        JSONArray logs=arr("walks");int weekMinutes=0;
        Calendar c=Calendar.getInstance();c.add(Calendar.DATE,-6);
        String minDate=new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(c.getTime());
        for(int i=0;i<logs.length();i++){JSONObject o=logs.optJSONObject(i);if(o!=null&&o.optString("date").compareTo(minDate)>=0)weekMinutes+=o.optInt("minutes");}
        LinearLayout stat=card();stat.addView(kicker("ÚLTIMOS 7 DIAS"),lp(-1,-2,7));
        stat.addView(text(weekMinutes+" MINUTOS",32,GREEN,true),lp(-1,-2,3));
        stat.addView(text("Tempo registrado por você, sem estimativas automáticas.",14,MUTED,false),lp(-1,-2,13));
        stat.addView(button("＋ REGISTRAR CAMINHADA",true,this::walkDialog));content.addView(stat,lp(-1,-2,13));
        LinearLayout hist=card();section(hist,"MEU HISTÓRICO",logs.length()+" registro(s)");
        if(logs.length()==0)hist.addView(text("Sua primeira caminhada aparecerá aqui.",15,MUTED,false));
        for(int i=logs.length()-1;i>=0;i--){JSONObject o=logs.optJSONObject(i);if(o==null)continue;final int ix=i;
            LinearLayout item=row();LinearLayout body=col();body.addView(text(o.optInt("minutes")+" min"+(o.optDouble("km",0)>0?" · "+o.optDouble("km")+" km":""),19,WHITE,true));
            body.addView(text(dayString(o.optString("date")),13,MUTED,false));item.addView(body,new LinearLayout.LayoutParams(0,-2,1));
            item.addView(button("×",false,()->confirmDelete("Excluir caminhada?",()->removeArrayItem("walks",ix))),lp(41,42,0));
            hist.addView(item,lp(-1,-2,12));
        }content.addView(hist,lp(-1,-2,9));
        label(content,"Ao registrar uma caminhada, ela conta na sua constância semanal.");
    }
    private EditText field(String hint,int inputType){EditText e=new EditText(this);e.setTextColor(WHITE);e.setHintTextColor(MUTED);e.setHint(hint);e.setTextSize(17);e.setSingleLine(true);e.setInputType(inputType);return e;}
    private void walkDialog(){LinearLayout form=col();form.setPadding(dp(20),dp(7),dp(20),0);
        EditText minutes=field("Tempo em minutos (ex.: 30)",2),km=field("Distância em km (opcional)",8194);
        form.addView(minutes,lp(-1,-2,14));form.addView(km);
        new AlertDialog.Builder(this).setTitle("Nova caminhada").setView(form).setNegativeButton("Cancelar",null).setPositiveButton("Salvar",(d,w)->{
            try{int val=Integer.parseInt(minutes.getText().toString().trim());if(val<1||val>1440)throw new Exception();
                double distance=km.getText().length()>0?Double.parseDouble(km.getText().toString().replace(',','.')):0;
                if(distance<0||distance>100)throw new Exception();
                JSONObject o=new JSONObject();o.put("date",today());o.put("minutes",val);o.put("km",distance);arr("walks").put(o);save();render();toast("Caminhada registrada!");
            }catch(Exception e){toast("Confira os dados da caminhada.");}
        }).show();
    }
    private void food(){
        section(content,"ALIMENTAÇÃO","Uma rotina simples, sem dietas obrigatórias.");
        LinearLayout meals=card();JSONArray list=arr("meals");int completed=0;
        for(int i=0;i<list.length();i++){JSONObject m=list.optJSONObject(i);if(m!=null&&today().equals(m.optString("doneDate")))completed++;}
        section(meals,"REFEIÇÕES DE HOJE",completed+" de "+list.length()+" marcadas");
        for(int i=0;i<list.length();i++){JSONObject m=list.optJSONObject(i);if(m==null)continue;final int index=i;
            LinearLayout r=row();LinearLayout desc=col();desc.addView(text(m.optString("name"),18,WHITE,true));
            desc.addView(text(m.optString("time"),13,MUTED,false));r.addView(desc,new LinearLayout.LayoutParams(0,dp(52),1));
            CheckBox checked=new CheckBox(this);checked.setButtonTintList(android.content.res.ColorStateList.valueOf(GREEN));
            checked.setChecked(today().equals(m.optString("doneDate")));checked.setContentDescription("Marcar "+m.optString("name")+" como concluída");
            checked.setOnCheckedChangeListener((btn,ok)->{try{m.put("doneDate",ok?today():"");save();}catch(Exception ignored){}});
            r.addView(checked,lp(43,52,0));
            r.addView(button("×",false,()->confirmDelete("Remover refeição?",()->{
                ReminderScheduler.cancelMeal(MainActivity.this,m.optString("id"));removeArrayItem("meals",index);scheduleReminders();
            })),lp(40,43,0));meals.addView(r,lp(-1,-2,8));
        }
        if(list.length()==0)meals.addView(text("Adicione horários para organizar seu dia.",15,MUTED,false),lp(-1,-2,13));
        meals.addView(button("＋ NOVA REFEIÇÃO",true,this::mealDialog));content.addView(meals,lp(-1,-2,14));
        LinearLayout water=card();section(water,"ÁGUA","Registre quantos copos bebeu.");
        int value=data.optInt("water_"+today(),0);water.addView(text(value+" COPOS HOJE",27,GREEN,true),lp(-1,-2,13));
        LinearLayout buttons=row();buttons.addView(button("− RETIRAR",false,()->changeWater(-1)),new LinearLayout.LayoutParams(0,dp(47),1));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(47),1.6f);p.setMargins(dp(8),0,0,0);
        buttons.addView(button("＋ ADICIONAR",true,()->changeWater(1)),p);water.addView(buttons);content.addView(water,lp(-1,-2,13));
        content.addView(button("CONFIGURAR LEMBRETES ›",false,()->open("notificacoes")));
        label(content,"O número de copos não representa uma medição automática em mililitros.");
    }
    private void changeWater(int value){try{String k="water_"+today();data.put(k,Math.max(0,Math.min(30,data.optInt(k,0)+value)));save();render();}catch(Exception ignored){}}
    private void mealDialog(){
        LinearLayout form=col();form.setPadding(dp(20),dp(8),dp(20),0);
        EditText name=field("Refeição (ex.: Almoço)",1);
        TextView time=button("SELECIONAR HORÁRIO",false,()->{});
        final String[] chosen={""};
        time.setOnClickListener(v->{Calendar now=Calendar.getInstance();new TimePickerDialog(this,(picker,hour,minute)->{
            chosen[0]=String.format(Locale.US,"%02d:%02d",hour,minute);time.setText("HORÁRIO · "+chosen[0]);
        },now.get(Calendar.HOUR_OF_DAY),now.get(Calendar.MINUTE),true).show();});
        form.addView(name,lp(-1,-2,14));form.addView(time);
        new AlertDialog.Builder(this).setTitle("Novo horário de refeição").setView(form)
        .setNegativeButton("Cancelar",null).setPositiveButton("Salvar",(d,w)->{
            String n=name.getText().toString().trim();String t=chosen[0];
            if(n.isEmpty()||n.length()>45||t.isEmpty()){toast("Informe refeição e escolha um horário.");return;}
            try{JSONObject item=new JSONObject();item.put("name",n);item.put("time",t);
                item.put("id",String.valueOf(System.nanoTime()));arr("meals").put(item);save();scheduleReminders();render();toast("Horário registrado.");}
            catch(Exception ignored){}
        }).show();
    }
    private void evolution(){
        section(content,"MINHA EVOLUÇÃO","Conquistas reais. Seu ritmo, suas escolhas.");
        JSONArray weights=arr("weights");LinearLayout chart=card();section(chart,"REGISTROS DE PESO",weights.length()+" registro(s)");
        if(weights.length()>0){JSONObject last=weights.optJSONObject(weights.length()-1);
            chart.addView(text(String.format(Locale.forLanguageTag("pt-BR"),"%.1f kg",last.optDouble("kg")),36,GREEN,true),lp(-1,-2,5));
            if(weights.length()>1){JSONObject first=weights.optJSONObject(0);double delta=last.optDouble("kg")-first.optDouble("kg");
                chart.addView(text(String.format(Locale.forLanguageTag("pt-BR"),"Variação: %+.1f kg desde o primeiro registro",delta),14,MUTED,false),lp(-1,-2,10));
                chart.addView(new WeightChart(this,weights),lp(-1,170,12));}
        }else chart.addView(text("Registre seu primeiro peso para ver a evolução.",15,MUTED,false),lp(-1,-2,13));
        chart.addView(button("＋ REGISTRAR PESO",true,this::weightDialog));content.addView(chart,lp(-1,-2,13));
        LinearLayout records=card();section(records,"HISTÓRICO","Você pode remover um registro incorreto.");
        if(weights.length()==0)records.addView(text("Nenhum registro ainda.",14,MUTED,false));
        for(int i=weights.length()-1;i>=0;i--){JSONObject o=weights.optJSONObject(i);if(o==null)continue;final int idx=i;
            LinearLayout item=row();LinearLayout textBox=col();textBox.addView(text(String.format(Locale.forLanguageTag("pt-BR"),"%.1f kg",o.optDouble("kg")),18,WHITE,true));
            textBox.addView(text(dayString(o.optString("date")),13,MUTED,false));item.addView(textBox,new LinearLayout.LayoutParams(0,-2,1));
            item.addView(button("×",false,()->confirmDelete("Excluir registro de peso?",()->removeArrayItem("weights",idx))),lp(41,42,0));records.addView(item,lp(-1,-2,9));
        }content.addView(records,lp(-1,-2,13));
        LinearLayout rewards=card();section(rewards,"MINHAS CONQUISTAS","Baseadas nas atividades registradas.");
        rewards.addView(text((count("workouts")>0?"★ ":"○ ")+"Primeiro treino",18,count("workouts")>0?GREEN:MUTED,true),lp(-1,-2,8));
        rewards.addView(text((count("walks")>0?"★ ":"○ ")+"Primeira caminhada",18,count("walks")>0?GREEN:MUTED,true),lp(-1,-2,8));
        rewards.addView(text((activityCountThisWeek()>=3?"★ ":"○ ")+"3 dias ativos na semana",18,activityCountThisWeek()>=3?GREEN:MUTED,true),lp(-1,-2,6));
        greenBar(rewards,activityCountThisWeek(),7);content.addView(rewards,lp(-1,-2,13));
        content.addView(button("VER FOTOS PRIVADAS ›",false,()->open("fotos")));
    }
    private void weightDialog(){EditText kg=field("Peso em kg (ex.: 75.4)",8194);
        new AlertDialog.Builder(this).setTitle("Registrar peso").setView(kg).setNegativeButton("Cancelar",null).setPositiveButton("Salvar",(d,w)->{
            try{double value=Double.parseDouble(kg.getText().toString().replace(',','.'));
                if(value<10||value>500)throw new Exception();JSONObject x=new JSONObject();x.put("kg",value);x.put("date",today());arr("weights").put(x);save();render();toast("Peso salvo.");
            }catch(Exception e){toast("Informe um peso válido.");}
        }).show();
    }
    private void photos(){section(content,"FOTOS PRIVADAS","Suas imagens ficam neste Android, não no site.");
        content.addView(button("＋ ADICIONAR FOTO",true,()->{
            Intent in=new Intent(Intent.ACTION_OPEN_DOCUMENT);in.setType("image/*");in.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(in,701);
        }),lp(-1,-2,14));
        JSONArray photos=arr("photos");if(photos.length()==0)content.addView(text("Sua galeria começa aqui.",15,MUTED,false));
        for(int i=photos.length()-1;i>=0;i--){JSONObject pic=photos.optJSONObject(i);if(pic==null)continue;
            File f=new File(getFilesDir(),pic.optString("file"));if(!f.isFile())continue;
            LinearLayout tile=card();ImageView image=new ImageView(this);image.setScaleType(ImageView.ScaleType.CENTER_CROP);
            BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeFile(f.getAbsolutePath(),bounds);
            BitmapFactory.Options sample=new BitmapFactory.Options();sample.inSampleSize=1;int size=Math.max(1,Math.max(bounds.outWidth,bounds.outHeight));
            while(size>1400){sample.inSampleSize*=2;size/=2;}sample.inSampleSize=Math.max(1,sample.inSampleSize);
            image.setImageBitmap(BitmapFactory.decodeFile(f.getAbsolutePath(),sample));
            tile.addView(image,lp(-1,230,9));tile.addView(text(pic.optString("date"),15,MUTED,false),lp(-1,-2,8));
            final int index=i;tile.addView(button("EXCLUIR FOTO",false,()->confirmDelete("Excluir foto privada?",()->{
                new File(getFilesDir(),pic.optString("file")).delete();removeArrayItem("photos",index);
            })));content.addView(tile,lp(-1,-2,14));}
        label(content,"Armazenamento privado do aplicativo. Fotos não são sincronizadas.");
    }
    @Override protected void onActivityResult(int req,int res,Intent dataIntent){super.onActivityResult(req,res,dataIntent);
        if(req==EXPORT_JSON){if(res==RESULT_OK)writeExport(dataIntent);return;}
        if(req!=701||res!=RESULT_OK||dataIntent==null||dataIntent.getData()==null)return;
        String filename="evolufit_"+System.currentTimeMillis()+".img";File f=new File(getFilesDir(),filename);
        try(InputStream in=getContentResolver().openInputStream(dataIntent.getData());FileOutputStream out=new FileOutputStream(f)){
            if(in==null)throw new Exception();byte[] buf=new byte[8192];int count,total=0;
            while((count=in.read(buf))!=-1){total+=count;if(total>8*1024*1024)throw new Exception("too large");out.write(buf,0,count);}
            JSONObject o=new JSONObject();o.put("file",filename);o.put("date",today());arr("photos").put(o);save();open("fotos");toast("Foto salva privadamente.");
        }catch(Exception e){f.delete();toast("Use uma imagem de até 8 MB.");}
    }
    private long currentElapsed(){return elapsedBefore+(clockRunning?SystemClock.elapsedRealtime()-runningFrom:0);}
    private String clockDisplay(){long ms=countdown?Math.max(0,countdownTotal-currentElapsed()):currentElapsed();long seconds=ms/1000;return String.format(Locale.US,"%02d:%02d:%02d",seconds/3600,(seconds%3600)/60,seconds%60);}
    private void toggleClock(){if(clockRunning)pauseClock();else{clockRunning=true;runningFrom=SystemClock.elapsedRealtime();}}
    private void pauseClock(){if(clockRunning){elapsedBefore=currentElapsed();clockRunning=false;}}
    private void timer(){section(content,"RELÓGIO E CRONÔMETRO","Seu tempo de treino e descanso.");
        LinearLayout c=card();TextView now=text("HORA ATUAL   "+new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date()),17,MUTED,true);
        now.setGravity(Gravity.CENTER);liveTime=now;c.addView(now,lp(-1,-2,12));
        TextView mode=text(countdown?"TEMPORIZADOR":"CRONÔMETRO",15,GREEN,true);mode.setGravity(Gravity.CENTER);c.addView(mode,lp(-1,-2,12));
        TextView display=text(clockDisplay(),42,WHITE,true);display.setGravity(Gravity.CENTER);display.setBackground(bg(0xff0e230b,GREEN,85));display.setPadding(dp(4),dp(23),dp(4),dp(23));timerValue=display;c.addView(display,lp(-1,-2,19));
        c.addView(button(clockRunning?"⏸ PAUSAR":"▶ INICIAR",true,()->{toggleClock();render();}),lp(-1,-2,9));
        c.addView(button("↺ ZERAR",false,()->{clockRunning=false;elapsedBefore=0;render();}),lp(-1,-2,11));
        c.addView(button(countdown?"MUDAR PARA CRONÔMETRO":"MUDAR PARA TEMPORIZADOR",false,()->{pauseClock();countdown=!countdown;elapsedBefore=0;render();}));
        content.addView(c,lp(-1,-2,14));
        LinearLayout quick=card();section(quick,"INTERVALOS RÁPIDOS","Temporizador nativo");
        for(int value:new int[]{30,60,120,300,600}){int val=value;quick.addView(button(value<60?value+" SEGUNDOS":(value/60)+" MINUTO(S)",false,()->{pauseClock();countdown=true;countdownTotal=val*1000L;elapsedBefore=0;render();}),lp(-1,-2,8));}
        content.addView(quick);label(content,"O cronômetro usa o relógio do Android. Ele não depende do navegador.");
    }
    private void exportRecords(){
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");intent.putExtra(Intent.EXTRA_TITLE,"evolufit-dados-"+today()+".json");
        startActivityForResult(intent,EXPORT_JSON);
    }
    private void writeExport(Intent intent){
        if(intent==null||intent.getData()==null)return;
        try(java.io.OutputStream out=getContentResolver().openOutputStream(intent.getData())){
            if(out==null)throw new Exception("sem arquivo");out.write(data.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            toast("Backup dos registros salvo. Fotos não incluídas.");
        }catch(Exception ignored){toast("Não foi possível exportar os dados.");}
    }
    private void profile(){
        section(content,"MEU PERFIL","Personalize o aplicativo do seu jeito.");
        LinearLayout user=card();user.addView(kicker("SEU ESPAÇO"),lp(-1,-2,7));
        user.addView(text(data.optString("name","").isEmpty()?"ATLETA EVOLUFIT":data.optString("name").toUpperCase(Locale.ROOT),29,WHITE,true),lp(-1,-2,12));
        user.addView(button("EDITAR NOME",true,()->{
            EditText name=field("Nome ou apelido",1);name.setText(data.optString("name",""));
            new AlertDialog.Builder(this).setTitle("Como quer ser chamado?").setView(name).setNegativeButton("Cancelar",null)
            .setPositiveButton("Salvar",(d,w)->{try{String n=name.getText().toString().trim();data.put("name",n.substring(0,Math.min(n.length(),60)));save();render();}catch(Exception ignored){}}).show();
        }));content.addView(user,lp(-1,-2,13));
        section(content,"MINHAS FERRAMENTAS",null);
        tiles(new String[][]{{"fotos","FOTOS"},{"caminhadas","CAMINHADAS"},{"alimentacao","ALIMENTAÇÃO"},{"notificacoes","LEMBRETES"}});
        LinearLayout privacy=card();section(privacy,"PRIVACIDADE E DADOS","Seus registros ficam somente neste aparelho.");
        privacy.addView(button("⬇ EXPORTAR REGISTROS",true,this::exportRecords),lp(-1,-2,13));
        privacy.addView(text("Exporta um arquivo JSON com treinos, pesos, caminhadas, água e refeições. Fotos não estão incluídas.",14,MUTED,false));
        content.addView(privacy,lp(-1,-2,13));
        LinearLayout version=card();version.addView(kicker("EVOLUFIT ANDROID NATIVE BETA · 0.2"),lp(-1,-2,7));
        version.addView(text("Sem WebView, sem anúncios, sem coleta de dados e sem sincronização nesta versão de testes.",14,MUTED,false));
        content.addView(version);
    }
    private void notifications(){section(content,"NOTIFICAÇÕES","Lembretes nativos das suas refeições.");
        LinearLayout c=card();section(c,"AVISOS DO ANDROID","Funcionam mesmo com o aplicativo fechado, sujeitos ao agendamento do sistema.");
        boolean enabled=data.optBoolean("notify",false);
        c.addView(button(enabled?"DESATIVAR LEMBRETES":"ATIVAR LEMBRETES",true,()->{
            if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},900);return;}
            try{data.put("notify",!data.optBoolean("notify",false));save();scheduleReminders();render();}catch(Exception ignored){}
        }));content.addView(c,lp(-1,-2,14));
        LinearLayout meal=card();section(meal,"HORÁRIOS AGENDADOS",count("meals")+" refeição(ões)");
        JSONArray arr=arr("meals");for(int i=0;i<arr.length();i++){JSONObject x=arr.optJSONObject(i);if(x!=null)meal.addView(text("• "+x.optString("name")+"  "+x.optString("time"),17,WHITE,false),lp(-1,-2,7));}
        meal.addView(button("EDITAR EM ALIMENTAÇÃO",false,()->open("alimentacao")));content.addView(meal);
        label(content,"O Android pode atrasar avisos para economizar bateria. Sem alarmes exatos nesta versão.");
    }
    @Override public void onRequestPermissionsResult(int req,String[] permissions,int[] result){super.onRequestPermissionsResult(req,permissions,result);
        if(req==900&&result.length>0&&result[0]==PackageManager.PERMISSION_GRANTED){try{data.put("notify",true);save();scheduleReminders();render();}catch(Exception ignored){}}
    }
    private void scheduleReminders(){ReminderScheduler.schedule(this);}
    /** Compact native vector pictograms in EvoluFit's green/white language. */
    private final class IconMark extends View {
        private final String type;private final Paint p=new Paint(3);private final int color;
        IconMark(Context c,String key,int color){super(c);type=key;this.color=color;setContentDescription("Ícone "+key);}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);canvas.save();canvas.scale(getWidth()/64f,getHeight()/64f);
            p.setColor(color);p.setStrokeWidth(5);p.setStrokeCap(Paint.Cap.ROUND);p.setStyle(Paint.Style.STROKE);
            switch(type){
                case "inicio":line(canvas,7,32,32,10);line(canvas,32,10,57,32);line(canvas,14,31,14,55);line(canvas,50,31,50,55);line(canvas,14,55,50,55);break;
                case "treinos":case "guia":canvas.drawRoundRect(new RectF(5,22,14,43),3,3,p);canvas.drawRoundRect(new RectF(50,22,59,43),3,3,p);line(canvas,14,33,50,33);line(canvas,20,16,20,50);line(canvas,44,16,44,50);break;
                case "caminhadas":line(canvas,19,54,30,37);line(canvas,30,37,40,50);line(canvas,30,37,27,22);line(canvas,27,22,45,32);canvas.drawCircle(31,10,6,p);break;
                case "alimentacao":canvas.drawArc(new RectF(10,20,54,57),0,180,false,p);line(canvas,11,40,53,40);line(canvas,30,18,37,7);break;
                case "cronometro":canvas.drawCircle(32,35,22,p);line(canvas,32,35,32,20);line(canvas,32,35,43,43);line(canvas,22,7,42,7);break;
                case "evolucao":line(canvas,10,53,10,32);line(canvas,25,53,25,22);line(canvas,40,53,40,12);line(canvas,55,53,55,7);break;
                case "perfil":line(canvas,12,54,12,46);canvas.drawCircle(32,20,12,p);canvas.drawArc(new RectF(7,33,57,76),185,170,false,p);break;
                case "notificacoes":canvas.drawArc(new RectF(12,7,52,49),188,164,false,p);line(canvas,12,45,52,45);break;
                default:canvas.drawCircle(32,30,19,p);line(canvas,20,48,44,48);
            }
            canvas.restore();}
        private void line(Canvas c,float a,float b,float x,float y){c.drawLine(a,b,x,y,p);}
    }
    private final class WeightChart extends View {
        private final JSONArray dataPoints;private final Paint p=new Paint(3);
        WeightChart(Context c,JSONArray a){super(c);dataPoints=a;}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);int n=dataPoints.length();if(n<2)return;
            float w=getWidth(),h=getHeight(),pad=dp(15);double min=Double.MAX_VALUE,max=-Double.MAX_VALUE;
            for(int i=0;i<n;i++){JSONObject j=dataPoints.optJSONObject(i);if(j==null)continue;double v=j.optDouble("kg",0);min=Math.min(min,v);max=Math.max(max,v);}
            if(min==Double.MAX_VALUE)return;double span=Math.max(max-min,1);
            p.setColor(EDGE);p.setStrokeWidth(dp(1));canvas.drawLine(pad,h-pad,w-pad,h-pad,p);
            p.setColor(GREEN);p.setStrokeWidth(dp(3));p.setStrokeCap(Paint.Cap.ROUND);Path path=new Path();
            for(int i=0;i<n;i++){JSONObject j=dataPoints.optJSONObject(i);if(j==null)continue;
                float x=pad+(w-pad*2)*i/(n-1f),y=(float)(h-pad-((j.optDouble("kg")-min)/span)*(h-pad*2));
                if(i==0)path.moveTo(x,y);else path.lineTo(x,y);
            }canvas.drawPath(path,p);
        }
    }
}