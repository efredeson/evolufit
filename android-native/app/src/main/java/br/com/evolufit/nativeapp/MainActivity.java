package br.com.evolufit.nativeapp;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.app.PendingIntent;
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
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** EvoluFit, real Android Views; no browser, PWA or WebView. */
public class MainActivity extends Activity {
    private static final int BLACK=0xff000000, PANEL=0xff071007, EDGE=0xff42692a,
        GREEN=0xffbcff22, WHITE=0xfff3fff1, MUTED=0xffa6baa5, DANGER=0xffff9898;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private JSONObject data;
    private String page="inicio", plan="iniciante";
    private int exerciseIndex=0;
    private LinearLayout content;
    private TextView timerValue;
    private boolean clockRunning=false, countdown=false;
    private long runningFrom=0L, elapsedBefore=0L, countdownTotal=300000L;
    private final Runnable ticker=new Runnable(){@Override public void run(){
        if(timerValue!=null) timerValue.setText(clockDisplay());
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
    private TextView text(String val,int size,int color,boolean heavy){TextView t=new TextView(this);t.setText(val);t.setTextSize(size);t.setTextColor(color);t.setGravity(Gravity.CENTER_VERTICAL);t.setTypeface(Typeface.create(heavy?"sans-serif-condensed":"sans-serif",heavy?Typeface.BOLD_ITALIC:Typeface.NORMAL));return t;}
    private TextView button(String label,boolean bright,Runnable click){TextView b=text(label,19,bright?0xff102000:WHITE,true);b.setGravity(Gravity.CENTER);b.setBackground(bg(bright?GREEN:0xff111b11,bright?0xffcaff5f:EDGE,13));b.setPadding(dp(13),dp(12),dp(13),dp(12));b.setMinHeight(dp(47));b.setOnClickListener(v->click.run());return b;}
    private LinearLayout card(){LinearLayout p=col();p.setBackground(bg(PANEL,EDGE,18));p.setPadding(dp(17),dp(17),dp(17),dp(17));return p;}
    private void section(LinearLayout box,String title,String detail){box.addView(text(title,27,WHITE,true),lp(-1,-2,3));if(detail!=null&&!detail.isEmpty())box.addView(text(detail,14,MUTED,false),lp(-1,-2,13));}
    private void label(LinearLayout box,String value){box.addView(text(value,13,MUTED,false),lp(-1,-2,7));}
    private void addSpace(LinearLayout box,int h){View v=new View(this);box.addView(v,lp(1,h,0));}
    private void render(){
        timerValue=null;
        LinearLayout main=col();main.setBackgroundColor(BLACK);
        main.setFitsSystemWindows(Build.VERSION.SDK_INT<30);
        if(Build.VERSION.SDK_INT>=30)main.setOnApplyWindowInsetsListener((v,i)->{
            android.graphics.Insets in=i.getInsets(WindowInsets.Type.systemBars());
            v.setPadding(in.left,in.top,in.right,in.bottom);return i;
        });
        setContentView(main);
        LinearLayout header=row();header.setPadding(dp(17),dp(11),dp(16),dp(11));header.setBackgroundColor(BLACK);
        TextView logo=text("Evolu",23,WHITE,true),fit=text("Fit",23,GREEN,true);
        header.addView(logo);header.addView(fit);
        TextView test=text("  •  ANDROID NATIVO",11,MUTED,true);
        header.addView(test,new LinearLayout.LayoutParams(0,-2,1));
        TextView bell=text("◉",27,GREEN,true);bell.setGravity(Gravity.RIGHT);bell.setOnClickListener(v->open("notificacoes"));header.addView(bell,lp(37,40,0));
        main.addView(header,lp(-1,-2,0));
        View line=new View(this);line.setBackgroundColor(EDGE);main.addView(line,lp(-1,1,0));
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(false);scroll.setClipToPadding(false);
        content=col();content.setPadding(dp(15),dp(16),dp(15),dp(25));scroll.addView(content);
        main.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout bottom=row();bottom.setPadding(dp(3),dp(7),dp(3),dp(7));bottom.setBackground(bg(0xff050905,EDGE,12));
        String[][] nav={{"inicio","Início"},{"treinos","Treinos"},{"evolucao","Evolução"},{"perfil","Perfil"}};
        for(String[] item:nav){LinearLayout slot=col();slot.setGravity(Gravity.CENTER);slot.setPadding(dp(3),dp(5),dp(3),dp(5));boolean sel=page.equals(item[0]);
            slot.setBackground(sel?bg(0xff1a3211,EDGE,11):bg(0xff010401,0,11));
            slot.addView(new IconMark(this,item[0],sel?GREEN:MUTED),lp(27,27,2));TextView t=text(item[1],12,sel?GREEN:MUTED,sel);t.setGravity(Gravity.CENTER);slot.addView(t);slot.setOnClickListener(v->open(item[0]));bottom.addView(slot,new LinearLayout.LayoutParams(0,dp(57),1));}
        main.addView(bottom,lp(-1,-2,0));
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
        LinearLayout hero=card();hero.addView(text("CENTRAL DE",30,WHITE,true));hero.addView(text("MISSÕES",47,GREEN,true));
        String name=data.optString("name","").trim();hero.addView(text("Olá, "+(name.isEmpty()?"atleta":name)+"!",22,WHITE,true));
        hero.addView(text("Sua evolução é a missão. Um passo de cada vez.",15,MUTED,false));
        hero.addView(image("mascot.webp",220));content.addView(hero,lp(-1,-2,15));
        LinearLayout mission=card();section(mission,"MISSÃO DO DIA","Comece com um treino leve em casa.");
        mission.addView(text("Primeiros passos · 4 movimentos",18,WHITE,true),lp(-1,-2,15));
        mission.addView(button("▶ COMEÇAR MISSÃO",true,()->{plan="iniciante";exerciseIndex=0;open("guia");}),lp(-1,-2,0));content.addView(mission,lp(-1,-2,17));
        section(content,"ESCOLHA SUA ATIVIDADE",null);
        tiles(new String[][]{{"treinos","TREINOS"},{"caminhadas","CAMINHADAS"},{"alimentacao","ALIMENTAÇÃO"},{"cronometro","CRONÔMETRO"}});
        LinearLayout progress=card();section(progress,"SUA EVOLUÇÃO","Conquistas reais, sem resultados inventados.");
        progress.addView(text(count("workouts")+" treino(s) · "+count("walks")+" caminhada(s)",20,GREEN,true),lp(-1,-2,9));
        progress.addView(button("VER MINHA EVOLUÇÃO",false,()->open("evolucao")));content.addView(progress,lp(-1,-2,0));
    }
    private void tiles(String[][] items){for(int start=0;start<items.length;start+=2){LinearLayout r=row();for(int j=start;j<Math.min(start+2,items.length);j++){
        String[] it=items[j];LinearLayout t=card();t.setGravity(Gravity.CENTER);t.setPadding(dp(7),dp(10),dp(7),dp(10));
        t.addView(new IconMark(this,it[0],GREEN),lp(43,43,8));TextView name=text(it[1],19,WHITE,true);name.setGravity(Gravity.CENTER);t.addView(name);
        t.setOnClickListener(v->open(it[0]));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(109),1);p.setMargins(dp(2),0,dp(7),dp(10));r.addView(t,p);
    }content.addView(r,lp(-1,-2,0));}}
    private String[] planFor(String id){for(String[] p:PLANS)if(p[0].equals(id))return p;return PLANS[0];}
    private void trainings(){section(content,"TREINOS","Exercícios em casa, organizados por objetivo.");
        for(String[] p:PLANS){LinearLayout c=card();c.addView(text(p[1],27,WHITE,true),lp(-1,-2,2));
            c.addView(text("4 exercícios · tempo no seu ritmo",15,MUTED,false),lp(-1,-2,5));
            c.addView(image(pic(p[2]),130));c.addView(button("INICIAR TREINO ›",true,()->{plan=p[0];exerciseIndex=0;clockRunning=false;elapsedBefore=0;open("guia");}));
            content.addView(c,lp(-1,-2,13));}
        label(content,"Histórico de treinos");JSONArray a=arr("workouts");if(a.length()==0)content.addView(text("Nenhum treino concluído ainda.",14,MUTED,false));
        for(int i=a.length()-1;i>=Math.max(0,a.length()-6);i--){JSONObject o=a.optJSONObject(i);if(o!=null)content.addView(text("✓ "+o.optString("name")+" · "+o.optString("date"),16,WHITE,false),lp(-1,-2,9));}
    }
    private void guide(){String[] p=planFor(plan);String step=p[Math.min(exerciseIndex+2,p.length-1)];
        section(content,"TREINO GUIADO",p[1]+" · passo "+(exerciseIndex+1)+" de 4");
        LinearLayout c=card();c.addView(image(pic(step),245));c.addView(text(step,30,WHITE,true),lp(-1,-2,4));
        c.addView(text("Observe as duas posições e execute devagar, sem dor.",15,MUTED,false),lp(-1,-2,12));
        TextView clock=text(clockDisplay(),42,GREEN,true);clock.setGravity(Gravity.CENTER);timerValue=clock;c.addView(clock,lp(-1,85,12));
        LinearLayout control=row();control.addView(button(clockRunning?"⏸ PAUSAR":"▶ INICIAR",true,()->{toggleClock();render();}),new LinearLayout.LayoutParams(0,dp(53),1));
        c.addView(control,lp(-1,-2,12));LinearLayout next=row();
        TextView prev=button("‹ ANTERIOR",false,()->{if(exerciseIndex>0){pauseClock();exerciseIndex--;render();}});next.addView(prev,new LinearLayout.LayoutParams(0,dp(47),1));
        TextView nextBtn=button(exerciseIndex==3?"✓ CONCLUIR":"PRÓXIMO ›",false,()->{pauseClock();if(exerciseIndex==3){addLog("workouts",p[1]);clockRunning=false;elapsedBefore=0;open("treinos");toast("Missão concluída e registrada!");}else{exerciseIndex++;render();}});
        LinearLayout.LayoutParams px=new LinearLayout.LayoutParams(0,dp(47),1);px.setMargins(dp(9),0,0,0);next.addView(nextBtn,px);c.addView(next);
        content.addView(c,lp(-1,-2,12));
        content.addView(button("SAIR DO TREINO",false,()->{pauseClock();open("treinos");}),lp(-1,-2,10));
        label(content,"Respeite seus limites. Interrompa se houver dor, tontura ou falta de ar incomum.");
    }
    private void addLog(String key,String name){JSONObject item=new JSONObject();try{item.put("date",today());item.put("name",name);item.put("id",System.currentTimeMillis());arr(key).put(item);save();}catch(Exception ignored){}}
    private void walks(){section(content,"CAMINHADAS","Registre sua atividade. Não utiliza GPS.");
        LinearLayout c=card();section(c,"REGISTRAR CAMINHADA","Informe o tempo após caminhar.");c.addView(button("＋ ADICIONAR CAMINHADA",true,this::walkDialog));content.addView(c,lp(-1,-2,14));
        LinearLayout hist=card();section(hist,"HISTÓRICO",count("walks")+" caminhada(s) registrada(s)");
        JSONArray walks=arr("walks");for(int i=walks.length()-1;i>=0;i--){JSONObject w=walks.optJSONObject(i);if(w!=null)hist.addView(text("• "+w.optString("date")+" · "+w.optInt("minutes")+" min"+(w.optDouble("km",0)>0?" · "+w.optDouble("km")+" km":""),16,WHITE,false),lp(-1,-2,10));}
        if(walks.length()==0)hist.addView(text("Sua primeira caminhada aparecerá aqui.",15,MUTED,false));content.addView(hist);
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
    private void food(){section(content,"ALIMENTAÇÃO","Seus horários de refeição, sem excesso de informações.");
        LinearLayout meals=card();section(meals,"REFEIÇÕES DE HOJE","Marque quando concluir.");
        JSONArray list=arr("meals");for(int i=0;i<list.length();i++){JSONObject m=list.optJSONObject(i);if(m==null)continue;
            LinearLayout r=row();TextView t=text(m.optString("name")+"  ·  "+m.optString("time"),16,WHITE,true);r.addView(t,new LinearLayout.LayoutParams(0,dp(54),1));
            CheckBox checked=new CheckBox(this);checked.setButtonTintList(android.content.res.ColorStateList.valueOf(GREEN));checked.setChecked(today().equals(m.optString("doneDate")));
            checked.setOnCheckedChangeListener((button,ok)->{try{m.put("doneDate",ok?today():"");save();}catch(Exception ignored){}});r.addView(checked);meals.addView(r);}
        if(list.length()==0)meals.addView(text("Nenhum horário adicionado.",15,MUTED,false),lp(-1,-2,13));
        meals.addView(button("＋ NOVA REFEIÇÃO",true,this::mealDialog));content.addView(meals,lp(-1,-2,15));
        LinearLayout water=card();section(water,"ÁGUA","Registre quantos copos bebeu.");
        int value=data.optInt("water_"+today(),0);water.addView(text(value+" copo(s) hoje",26,GREEN,true),lp(-1,-2,9));
        LinearLayout buttons=row();buttons.addView(button("−",false,()->changeWater(-1)),new LinearLayout.LayoutParams(0,dp(47),1));
        LinearLayout.LayoutParams pl=new LinearLayout.LayoutParams(0,dp(47),2);pl.setMargins(dp(8),0,0,0);buttons.addView(button("＋ REGISTRAR COPO",true,()->changeWater(1)),pl);water.addView(buttons);content.addView(water,lp(-1,-2,13));
        content.addView(button("CONFIGURAR LEMBRETES",false,()->open("notificacoes")));
    }
    private void changeWater(int value){try{String k="water_"+today();data.put(k,Math.max(0,Math.min(30,data.optInt(k,0)+value)));save();render();}catch(Exception ignored){}}
    private void mealDialog(){LinearLayout form=col();form.setPadding(dp(20),dp(7),dp(20),0);
        EditText name=field("Refeição (ex.: Almoço)",1),time=field("Hora HH:mm (ex.: 12:00)",1);
        form.addView(name,lp(-1,-2,12));form.addView(time);
        new AlertDialog.Builder(this).setTitle("Novo horário").setView(form).setNegativeButton("Cancelar",null).setPositiveButton("Salvar",(d,w)->{
            String n=name.getText().toString().trim(),t=time.getText().toString().trim();
            if(n.isEmpty()||n.length()>45||!t.matches("(?:[01][0-9]|2[0-3]):[0-5][0-9]")){toast("Informe nome e hora HH:mm.");return;}
            try{JSONObject item=new JSONObject();item.put("name",n);item.put("time",t);item.put("id",String.valueOf(System.nanoTime()));arr("meals").put(item);save();scheduleReminders();render();}
            catch(Exception ignored){}
        }).show();
    }
    private void evolution(){section(content,"MINHA EVOLUÇÃO","Acompanhe seus próprios registros.");
        JSONArray weights=arr("weights");
        LinearLayout chart=card();section(chart,"HISTÓRICO DE PESO",weights.length()+" registro(s)");
        if(weights.length()>0){JSONObject latest=weights.optJSONObject(weights.length()-1);
            chart.addView(text(String.format(Locale.forLanguageTag("pt-BR"),"%.1f kg",latest.optDouble("kg")),33,GREEN,true),lp(-1,-2,5));
            chart.addView(new WeightChart(this,weights),lp(-1,150,10));
        }else chart.addView(text("Adicione seu primeiro peso para ver o gráfico.",15,MUTED,false),lp(-1,-2,13));
        chart.addView(button("＋ REGISTRAR PESO",true,this::weightDialog));content.addView(chart,lp(-1,-2,15));
        LinearLayout badges=card();section(badges,"CONQUISTAS REAIS","Cada atividade concluída conta.");
        badges.addView(text((count("workouts")>0?"✓":"○")+" Primeiro treino",18,WHITE,true),lp(-1,-2,10));
        badges.addView(text((count("walks")>0?"✓":"○")+" Primeira caminhada",18,WHITE,true),lp(-1,-2,9));
        badges.addView(text("Total: "+count("workouts")+" treinos · "+count("walks")+" caminhadas",15,MUTED,false));content.addView(badges,lp(-1,-2,12));
        content.addView(button("VER FOTOS PRIVADAS",false,()->open("fotos")));
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
            LinearLayout tile=card();ImageView image=new ImageView(this);image.setScaleType(ImageView.ScaleType.CENTER_CROP);image.setImageBitmap(BitmapFactory.decodeFile(f.getAbsolutePath()));
            tile.addView(image,lp(-1,240,9));tile.addView(text(pic.optString("date"),15,MUTED,false));content.addView(tile,lp(-1,-2,14));}
        label(content,"Armazenamento privado do aplicativo. Fotos não são sincronizadas.");
    }
    @Override protected void onActivityResult(int req,int res,Intent dataIntent){super.onActivityResult(req,res,dataIntent);
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
        now.setGravity(Gravity.CENTER);c.addView(now,lp(-1,-2,12));
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
    private void profile(){section(content,"MEU PERFIL","Seu espaço no EvoluFit nativo.");
        LinearLayout c=card();section(c,"SEUS DADOS","Tudo armazenado somente no aplicativo.");
        c.addView(text("Nome: "+data.optString("name","não informado"),17,WHITE,false),lp(-1,-2,14));
        c.addView(button("EDITAR NOME",true,()->{
            EditText name=field("Nome ou apelido",1);name.setText(data.optString("name",""));
            new AlertDialog.Builder(this).setTitle("Meu nome").setView(name).setNegativeButton("Cancelar",null).setPositiveButton("Salvar",(d,w)->{
                try{data.put("name",name.getText().toString().trim().substring(0,Math.min(name.length(),60)));save();render();}catch(Exception ignored){}
            }).show();
        }));content.addView(c,lp(-1,-2,14));
        section(content,"MINHAS FERRAMENTAS",null);
        tiles(new String[][]{{"fotos","FOTOS"},{"caminhadas","CAMINHADAS"},{"alimentacao","ALIMENTAÇÃO"},{"notificacoes","LEMBRETES"}});
        LinearLayout about=card();section(about,"SOBRE ESTA VERSÃO","EvoluFit Android · 0.1.0 alpha");
        about.addView(text("Aplicativo Android nativo. Sem WebView, sem conta e sem sincronização nesta versão de teste. Fotos e registros ficam no celular.",15,MUTED,false));
        content.addView(about);
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
    private void scheduleReminders(){
        AlarmManager alarm=(AlarmManager)getSystemService(Context.ALARM_SERVICE);
        JSONArray meals=arr("meals");
        for(int i=0;i<meals.length();i++){
            JSONObject m=meals.optJSONObject(i);if(m==null)continue;
            try{
                String[] p=m.getString("time").split(":");Calendar date=Calendar.getInstance();date.set(Calendar.HOUR_OF_DAY,Integer.parseInt(p[0]));date.set(Calendar.MINUTE,Integer.parseInt(p[1]));date.set(Calendar.SECOND,0);
                if(date.getTimeInMillis()<=System.currentTimeMillis())date.add(Calendar.DATE,1);
                Intent intent=new Intent(this,ReminderReceiver.class);intent.setAction("br.com.evolufit.nativeapp.REMIND_MEAL");intent.putExtra("mealId",m.getString("id"));
                PendingIntent pi=PendingIntent.getBroadcast(this,m.optString("id").hashCode(),intent,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
                if(data.optBoolean("notify",false))alarm.setInexactRepeating(AlarmManager.RTC_WAKEUP,date.getTimeInMillis(),AlarmManager.INTERVAL_DAY,pi);
                else alarm.cancel(pi);
            }catch(Exception ignored){}
        }
    }
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