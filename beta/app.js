
"use strict";
const KEY="evolufit-data-v01";
const NAV=[
 ["inicio","Início","🏡"],["treinos","Treinos","🏋️"],["caminhadas","Caminhadas","🚶"],
 ["alimentacao","Alimentação","🥗"],["evolucao","Evolução","📈"],["fotos","Fotos","📷"],
 ["cronometro","Cronômetro","⏱️"],["ajustes","Ajustes","⚙️"],["notificacoes","Notificações","🔔"]
];
const PLANS=[
 {id:"inicio",title:"Comece no seu ritmo",level:"Iniciante",time:12,emoji:"🌱",desc:"Movimentos leves, sem equipamentos.",steps:["Marcha parada • 2 minutos","Sentar e levantar de cadeira firme • 8 vezes","Elevação de braços • 10 vezes","Passos laterais • 1 minuto","Alongamento leve • 2 minutos"]},
 {id:"corpo",title:"Movimento em casa",level:"Moderado",time:20,emoji:"💪",desc:"Movimente o corpo todo com adaptações.",steps:["Aqueça caminhando no lugar • 3 min","Agachamento apoiado • 10 vezes","Flexão na parede • 10 vezes","Elevação dos calcanhares • 12 vezes","Prancha adaptada • 20 s","Desaceleração • 3 min"]},
 {id:"mob",title:"Mobilidade e postura",level:"Leve",time:15,emoji:"🧘",desc:"Movimentos suaves para sua rotina.",steps:["Rotação de ombros • 1 min","Mobilidade de pescoço • 1 min","Mobilidade de quadril • 2 min","Alongamento de pernas • 4 min","Respiração e postura • 3 min"]},
 {id:"energia",title:"Circuito de energia",level:"Ativo",time:25,emoji:"⚡",desc:"Uma opção dinâmica quando se sentir confortável.",steps:["Marcha mais rápida • 3 min","Polichinelo sem salto • 1 min","Agachamento adaptado • 12 vezes","Passada apoiada • 8 por perna","Caminhada no lugar • 3 min","Alongamento final • 4 min"]}
];
const $=s=>document.querySelector(s);
const es=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad=n=>String(n).padStart(2,"0");
const today=()=>{let d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
const fmt=n=>Number(n).toLocaleString("pt-BR",{maximumFractionDigits:1});
const money=n=>fmt(n)+" kg";
const defaultData=()=>({
 profile:{name:"",height:"",goal:""},walks:[],workouts:[],weights:[],water:{},mealDone:{},notifications:false,
 meals:[{id:"cafe",name:"Café da manhã",time:"07:30"},{id:"almoco",name:"Almoço",time:"12:30"},{id:"lanche",name:"Lanche",time:"16:00"},{id:"jantar",name:"Jantar",time:"19:30"}]
});
let data=load(),view=(location.hash||"#inicio").slice(1);
let sec=300,running=false,interval=null,chronoMode="desc";
let photoUrls=[];
function load(){
 if(window.EVOLUFIT_SUPABASE?.url && window.EVOLUFIT_SUPABASE?.publishableKey)return defaultData();
 try{const d=JSON.parse(localStorage.getItem(KEY));if(!d||typeof d!=="object")return defaultData();
 const base=defaultData();return {...base,...d,profile:{...base.profile,...d.profile},
 walks:Array.isArray(d.walks)?d.walks:[],workouts:Array.isArray(d.workouts)?d.workouts:[],weights:Array.isArray(d.weights)?d.weights:[],
 meals:Array.isArray(d.meals)?d.meals:base.meals,water:d.water||{},mealDone:d.mealDone||{}};
 }catch(_){return defaultData();}
}
function save(){
 if(window.EVOLUFIT_SUPABASE?.url && window.EVOLUFIT_SUPABASE?.publishableKey){
   window.EvoluCloud?.scheduleSave(data);return;
 }
 try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){toast("O armazenamento local está cheio ou indisponível.");}
}
function toast(t){
 const el=$("#toast");el.textContent=t;el.classList.add("show");
 clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),3400);
}
function sameWeek(arr){
 let now=new Date(today()+"T12:00:00");let start=new Date(now);start.setDate(start.getDate()-6);
 return arr.filter(x=>{let d=new Date(x.date+"T12:00:00");return d>=start&&d<=now;});
}
function lastWeight(){return [...data.weights].sort((a,b)=>b.date.localeCompare(a.date))[0]?.weight||null;}
function title(t,sub,label="SUA JORNADA",right=""){
 return '<div class="pageheading"><div><div class="eyebrow">'+es(label)+'</div><h1>'+t+'</h1><p>'+sub+'</p></div>'+right+'</div>';
}
function stat(t,v,n,em){
 const key=/peso|altura/i.test(t)?'peso':/treino/i.test(t)?'treinos':/caminh/i.test(t)?'caminhadas':/refei/i.test(t)?'alimentacao':/imc/i.test(t)?'evolucao':/meta/i.test(t)?'meta':'evolucao';
 return '<article class="card animated"><div class="cardhead"><span class="statlabel">'+t+'</span><span class="circle">'+uiIcon(key,28)+'</span></div><div class="statnum">'+v+'</div><div class="hint">'+n+'</div></article>';
}
function empty(t,sub,em="🌿"){return '<div class="empty"><div class="em">'+uiIcon("meta",38)+'</div><b>'+t+'</b><small>'+sub+'</small></div>';}
function action(name,label,cls="btn",extra=""){return '<button class="'+cls+'" data-action="'+name+'" '+extra+'>'+label+'</button>';}

const SITE_ASSET_BASE = location.pathname.includes("/beta/") ? "../" : "";
function uiIcon(key,size=22){
 return window.EVOLUFIT_ICONS?.render(key,size)||'<span class="ef-icon-fallback" aria-hidden="true">✦</span>';
}
function nav(){
 const all = NAV.map((n,i)=>(i===5?'<div class="navtitle">MINHA JORNADA</div>':i===0?'<div class="navtitle">MENU PRINCIPAL</div>':'')+
 '<a href="#'+n[0]+'" class="navlink '+(view===n[0]?'active':'')+'">'+
 '<span class="navemoji">'+uiIcon(n[0])+'</span>'+n[1]+'</a>').join('');
 const name=es((data.profile?.name||'').trim().split(' ')[0]||'você');
 const mascot=SITE_ASSET_BASE+'assets/evolufit-gatinho-hd.webp?v=5';
 $('#sidebar').innerHTML='<a href="#inicio" class="brand"><img src="'+mascot+'" alt="Gatinho EvoluFit"><span>Evolu<em>Fit</em></span></a>'+
 all+'<div class="sidebarfoot">💚 Seu treino, sua rotina, sua evolução!<br><small>Um passo de cada vez.</small></div>';
 $('#topbar').innerHTML=
 '<div class="ef-user-header"><button class="menu-trigger" type="button" data-action="toggle-menu" aria-expanded="false" aria-label="Abrir menu">'+uiIcon("menu")+'</button>'+
 '<a class="mini-logo" href="#inicio">Evolu<em>Fit</em></a>'+
 '<div class="top-welcome"><strong>Olá, '+name+'! 👋</strong><small>Seu progresso, no seu ritmo.</small></div></div>'+
 '<div class="top-actions"><a class="quick-bell" href="#notificacoes" aria-label="Central de lembretes" title="Central de lembretes">'+uiIcon("bell")+'</a>'+
 '<a class="avatar" href="#ajustes" aria-label="Meu perfil">'+es((data.profile?.name||"E")[0].toUpperCase())+'</a></div>';
 $('#bottomnav').innerHTML=[NAV[0],NAV[1],NAV[4],NAV[7]].map(n=>
 '<a href="#'+n[0]+'" class="'+(view===n[0]?'active':'')+'"><b>'+uiIcon(n[0])+'</b><span>'+(n[0]==='ajustes'?'Perfil':n[1])+'</span></a>'
 ).join('');
 document.querySelectorAll('.ef-menu-backdrop').forEach(el=>el.setAttribute('aria-hidden',String(!document.body.classList.contains('menu-open'))));
 window.EvoluCloud?.decorateNav();
}

function render(){
 if(!NAV.find(n=>n[0]===view))view="inicio";
 nav();
 const views={inicio:home,treinos:trainings,caminhadas:walks,alimentacao:food,evolucao:evolution,fotos:photos,cronometro:timer,ajustes:settings,notificacoes:notificationsPage};
 $("#main").innerHTML='<div class="animated">'+views[view]()+'</div>';
 if(view==="fotos")loadPhotos();
 if(view==="cronometro")drawClock();
}
function home(){
 const name=es((data.profile?.name||'').trim().split(' ')[0]||'você');
 const minutes=sameWeek(data.walks).reduce((sum,w)=>sum+Number(w.minutes||0),0);
 const completed=sameWeek(data.workouts).length;
 const done=(data.mealDone[today()]||[]).length;
 const current=lastWeight();
 const target=Number(data.profile?.goal)||null;
 const completedPct=target&&current ? Math.max(0,Math.min(100,Math.round((1-Math.abs(current-target)/Math.max(current,target))*100))) : 0;
 const date=new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'short'}).format(new Date());
 const mascot=SITE_ASSET_BASE+'assets/evolufit-gatinho-hd.webp?v=5';
 const quick=[
 ['treinos','Treino'],['alimentacao','Alimentação'],['caminhadas','Caminhada'],['cronometro','Cronômetro']
 ].map(([k,label])=>'<a href="#'+k+'" class="ef-action">'+uiIcon(k,30)+'<span>'+label+'</span></a>').join('');
 const hero='<section class="hero ef-newhero"><div><small>EVOLUFIT · SUA JORNADA</small>'+
 '<h2>Seu treino, sua rotina,<br><em>sua evolução!</em></h2>'+
 '<p>Pequenos passos todos os dias. Vamos começar?</p>'+
 action("goto","Começar treino ▶","btn",'data-target="treinos"')+
 '</div><img src="'+mascot+'" alt="Gatinho esportista EvoluFit"></section>';
 const weekly='<section class="card"><div class="cardhead"><h2>Minha semana</h2><span class="pill">Últimos 7 dias</span></div>'+
 '<div class="ef-inline-stat"><span>Treinos realizados</span><strong>'+completed+'</strong></div>'+
 '<div class="ef-inline-stat"><span>Tempo de caminhada</span><strong>'+minutes+' min</strong></div>'+
 '<div class="ef-inline-stat"><span>Refeições registradas hoje</span><strong>'+done+' / '+data.meals.length+'</strong></div>'+
 '<p class="ef-empty-note">Acompanhe seu ritmo, sem metas obrigatórias.</p></section>';
 const progress='<section class="card"><div class="cardhead"><h2>Minha evolução</h2><a href="#evolucao" class="ef-chip">Ver histórico ›</a></div>'+
 '<div class="ef-progress-value">'+(current?money(current):'—')+'</div>'+
 '<div class="ef-subtle">'+(current?'Último peso registrado':'Registre seu peso para acompanhar sua evolução.')+'</div>'+
 (target&&current?'<div class="ef-inline-stat"><span>Meta informada</span><strong>'+money(target)+'</strong></div>'+
 '<div class="ef-progressbar"><span style="width:'+completedPct+'%"></span></div>':'')+
 '<div class="ef-mini-nav" style="margin-top:15px"><a href="#evolucao">Registrar peso →</a></div></section>';
 const measures='<div class="grid cards ef-today-stats">'+
 stat('Treinos',completed,'últimos 7 dias','🏋️')+
 stat('Caminhadas',minutes+' min','últimos 7 dias','🚶')+
 stat('Peso atual',current?money(current):'—','último registro','⚖️')+
 stat('Refeições',done+'/'+data.meals.length,'hoje','🥗')+'</div>';
 return hero+'<div class="ef-section-top"><h2>'+uiIcon("calendar")+' Meu dia</h2><span class="ef-date">'+es(date)+'</span></div>'+
 '<div class="ef-actions">'+quick+'</div>'+
 measures+'<div class="ef-summary-grid">'+weekly+progress+'</div>';
}

const EXERCISE_IMAGE_ROOT = location.pathname.includes("/beta/") ? "../assets/exercicios/" : "assets/exercicios/";
const EXERCISE_GUIDES = [
  [/sentar e levantar/i,"cadeira","Use uma cadeira firme e estável. Sente devagar e levante com controle."],
  [/flexão na parede/i,"parede","Apoie as mãos na parede, flexione os cotovelos e empurre suavemente de volta."],
  [/agachamento/i,"agachamento","Afaste os pés e dobre quadris e joelhos devagar, sem forçar a amplitude."],
  [/elevação dos calcanhares/i,"panturrilha","Com apoio firme, eleve os calcanhares e desça lentamente."],
  [/prancha/i,"prancha","Mantenha a coluna alinhada, com os joelhos apoiados se necessário."],
  [/polichinelo/i,"polichinelo","Abra uma perna de cada vez enquanto eleva os braços, sem saltar."],
  [/passada apoiada/i,"passada","Segure um apoio estável e dobre os joelhos em uma passada curta e confortável."],
  [/passos laterais/i,"lateral","Dê um passo para o lado e aproxime o outro pé, alternando as direções."],
  [/elevação de braços/i,"bracos","Eleve os braços até onde for confortável e retorne devagar."],
  [/rotação de ombros/i,"ombros","Faça pequenos círculos com os ombros, sem forçar a articulação."],
  [/mobilidade de pescoço/i,"pescoco","Incline a cabeça suavemente para cada lado, sem puxar ou forçar."],
  [/mobilidade de quadril/i,"quadril","Mova o quadril lentamente, mantendo os pés bem apoiados."],
  [/alongamento/i,"alongamento","Alongue com leve tensão, sem balanços e sem dor."],
  [/respiração e postura/i,"respiracao","Respire de forma confortável e mantenha o corpo relaxado e alinhado."],
  [/marcha|caminh|desaceleração|aquec/i,"marcha","Marche no lugar, elevando os joelhos dentro do seu conforto e movimentando os braços."]
];
function exerciseGuide(step){
 const found=EXERCISE_GUIDES.find(item=>item[0].test(step));
 return {kind:found?found[1]:"marcha", tip:found?found[2]:"Faça o movimento devagar, com controle e respeitando seus limites."};
}
const REAL_EXERCISES = new Set(["marcha","cadeira","bracos","lateral","agachamento","parede","prancha","alongamento"]);
function exerciseImage(kind){
 return EXERCISE_IMAGE_ROOT+kind+(REAL_EXERCISES.has(kind)?"-foto.webp":".svg");
}
function exerciseRow(step, index){
 const g=exerciseGuide(step), src=exerciseImage(g.kind);
 return '<details class="exercise-step"><summary><img src="'+src+'" loading="lazy" alt="Ilustração das posições do exercício">'+
 '<span class="exercise-step-title"><strong>'+es(step)+'</strong><small>Toque para ver como fazer</small></span>'+
 '<span class="exercise-chevron" aria-hidden="true">⌄</span></summary>'+
 '<div class="exercise-extra"><img src="'+src+'" loading="lazy" alt="Exemplo ilustrado em duas posições para '+es(step)+'">'+
 '<p>'+es(g.tip)+'</p></div></details>';
}

function trainings(){
 const cards=PLANS.map(p=>{
 const preview={inicio:"cadeira",corpo:"agachamento",mob:"alongamento",energia:"polichinelo"}[p.id]||"marcha";
 return '<article class="card training animated"><div class="cardhead"><span class="symbol">'+uiIcon(p.id==="mob"?"meta":p.id==="energia"?"cronometro":"treinos",31)+'</span><span class="pill">'+p.level+'</span></div>'+
 '<img class="plan-preview" src="'+exerciseImage(preview)+'" loading="lazy" alt="Exemplo ilustrado do treino">'+
 '<h3>'+p.title+'</h3><p>'+p.desc+'</p><div class="hint">⏱ '+p.time+' minutos · '+p.steps.length+' exercícios</div>'+
 action("open-training","Ver exercícios →","btn",'data-plan="'+p.id+'"')+'</article>';
}).join("");
 const history=[...data.workouts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7).map(w=>'<div class="listitem"><span class="circle">'+uiIcon("check")+'</span><div class="grow"><strong>'+es(w.title)+'</strong><small>'+es(w.date)+' · '+w.minutes+' min</small></div></div>').join("");
 return title("Treinos em casa","Escolha um treino e adapte ao seu condicionamento. Não precisa de academia.")+'<div class="grid two">'+cards+'</div><section class="card" style="margin-top:20px"><h2>Treinos concluídos</h2>'+(history||empty("Nenhum treino registrado","Seu histórico de atividades aparecerá aqui.","🏃"))+'</section><p class="footnote">Movimentos demonstrativos. Respeite seus limites e interrompa se houver dor, tontura ou falta de ar incomum.</p>';
}
function walks(){
 const history=[...data.walks].sort((a,b)=>b.date.localeCompare(a.date)).map(w=>'<div class="listitem"><span class="circle">'+uiIcon("caminhadas")+'</span><div class="grow"><strong>'+w.minutes+' minutos · '+(w.distance?fmt(w.distance)+" km":"distância não informada")+'</strong><small>'+es(w.date)+' · Ritmo '+es(w.pace)+'</small></div>'+action("remove-walk","Excluir","btn secondary small",'data-id="'+w.id+'"')+'</div>').join("");
 const minutes=sameWeek(data.walks).reduce((s,w)=>s+w.minutes,0);
 return title("Minhas caminhadas","Registre seus passeios, ritmos e distâncias.", "ATIVIDADE AO AR LIVRE")+'<div class="grid two"><section class="card"><h2>Registrar caminhada</h2><form data-form="walk" class="formgrid"><div class="field"><label>Data</label><input name="date" type="date" max="'+today()+'" value="'+today()+'" required></div><div class="field"><label>Tempo (min)</label><input name="minutes" type="number" min="1" max="1440" placeholder="Ex: 30" required></div><div class="field"><label>Distância (km, opcional)</label><input name="distance" type="number" step="0.01" min="0" max="100" placeholder="Ex: 2.5"></div><div class="field"><label>Ritmo percebido</label><select name="pace"><option>Leve</option><option>Moderado</option><option>Intenso</option></select></div><div class="field full"><button class="btn">Salvar caminhada</button></div></form><p class="footnote">Tempo e distância são informados manualmente; esta versão não usa GPS.</p></section><section class="card"><h2>Resumo da semana</h2><div class="statnum">'+minutes+' min</div><p>Tempo acumulado nos últimos 7 dias</p><div class="progress"><span style="width:'+Math.min(100,minutes/150*100)+'%"></span></div><p class="footnote">150 minutos é apenas uma referência visual nesta demonstração, não uma meta pessoal obrigatória.</p></section></div><section class="card" style="margin-top:20px"><h2>Histórico</h2>'+(history||empty("Sem caminhadas ainda","Registre sua primeira caminhada.","🚶"))+'</section>';
}
function food(){
 const done=data.mealDone[today()]||[];
 const list=data.meals.slice().sort((a,b)=>a.time.localeCompare(b.time)).map(m=>'<div class="listitem"><div class="circle">'+uiIcon("alimentacao")+'</div><div class="grow"><strong>'+es(m.name)+'</strong><small>⏰ '+es(m.time)+'</small></div><label class="mini"><input type="checkbox" data-action="meal-check" data-id="'+m.id+'" '+(done.includes(m.id)?"checked":"")+'> Feita</label>'+action("remove-meal","✕","btn secondary small",'data-id="'+m.id+'"')+'</div>').join("");
 return title("Alimentação & horários","Planeje suas refeições e acompanhe a rotina diária.","BEM-ESTAR",action("notify","🔔 Ativar lembretes","btn secondary"))+'<div class="grid two"><section class="card"><h2>Refeições de hoje <span class="pill">'+done.length+'/'+data.meals.length+'</span></h2>'+(list||empty("Sem refeições","Cadastre seus horários.","🍽️"))+'</section><section class="card"><h2>Adicionar horário</h2><form data-form="meal" class="formgrid"><div class="field"><label>Nome da refeição</label><input name="name" maxlength="45" placeholder="Ex: Lanche da tarde" required></div><div class="field"><label>Horário</label><input name="time" type="time" required></div><div class="field full"><button class="btn">Adicionar refeição</button></div></form><div class="notice" style="margin-top:20px">🔔 Os lembretes desta versão só aparecem enquanto o site estiver aberto e o navegador permitir notificações.</div></section></div><p class="footnote">Não há dietas prescritas nem metas calóricas automáticas nesta etapa.</p>';
}
function evolution(){
 const list=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date));
 const current=lastWeight(),h=Number(data.profile.height)/100;
 const bmi=current&&h>0?fmt(current/h/h):null;
 const target=Number(data.profile.goal)||null;
 let chart=list.slice(-10);
 const min=Math.min(...chart.map(x=>x.weight),0),max=Math.max(...chart.map(x=>x.weight),1);
 const bars=chart.length?'<div class="chart">'+chart.map(x=>'<div><small>'+fmt(x.weight)+'</small><span class="bar" style="height:'+(20+(x.weight-Math.min(...chart.map(y=>y.weight)))/(Math.max(1,max-Math.min(...chart.map(y=>y.weight))))*110)+'px"></span><small>'+x.date.slice(5)+'</small></div>').join("")+'</div>':empty("Sem medições","Seus pesos aparecerão no gráfico.","📊");
 const items=list.slice().reverse().map(x=>'<div class="listitem"><span class="circle">'+uiIcon("peso")+'</span><div class="grow"><strong>'+money(x.weight)+'</strong><small>'+es(x.date)+'</small></div>'+action("remove-weight","Excluir","btn secondary small",'data-id="'+x.id+'"')+'</div>').join("");
 return title("Minha evolução","Seu histórico no seu ritmo — sem comparações com outras pessoas.","SEU PROGRESSO")+'<div class="grid cards">'+stat("Peso atual",current?money(current):"—","último registro","⚖️")+stat("Altura",data.profile.height?data.profile.height+" cm":"—","valor informado","📏")+stat("IMC",bmi||"—","indicador informativo","📐")+stat("Meta pessoal",target?money(target):"—",current&&target?"diferença: "+money(Math.abs(current-target)):"opcional","🎯")+'</div><div class="grid two"><section class="card"><h2>Registrar peso</h2><form data-form="weight" class="formgrid"><div class="field"><label>Peso (kg)</label><input type="number" name="weight" min="10" max="500" step="0.1" required></div><div class="field"><label>Data</label><input type="date" name="date" max="'+today()+'" value="'+today()+'" required></div><div class="field full"><button class="btn">Salvar registro</button></div></form><div class="notice" style="margin-top:18px">O IMC isolado não é diagnóstico nem determina quanto alguém deve emagrecer.</div></section><section class="card"><h2>Gráfico de peso</h2>'+bars+'</section></div><section class="card" style="margin-top:20px"><h2>Histórico de medidas</h2>'+(items||empty("Nenhum peso registrado","Você pode começar quando quiser.","⚖️"))+'</section>';
}
function photos(){
 const cloud=!!window.EvoluCloud?.active;
 return title("Fotos da evolução","Guarde seus registros por data e compare seu progresso.", "SUA GALERIA",action("add-photo","＋ Adicionar foto"))+
 (cloud?'<div class="notice">🔒 Fotos privadas no Supabase, acessíveis somente na sua conta. Evite imagens íntimas ou de outras pessoas.</div>':'<div class="notice">🔒 As fotos ficam somente neste navegador (IndexedDB), não são enviadas ao GitHub ou à internet. Evite dispositivos compartilhados e faça cópias de segurança.</div>')+
 '<section class="card" style="margin-top:20px"><div class="cardhead"><h2>Minha galeria</h2><span class="pill">'+(cloud?'Conta privada':'Neste dispositivo')+'</span></div><div id="photo-list">'+empty("Carregando fotos","Seus registros aparecerão aqui.","📸")+'</div></section>';
}
function timer(){
 const currentTime=new Date().toLocaleTimeString('pt-BR',{hour12:false});
 return title("Relógio e cronômetro","Conte o tempo dos treinos e intervalos.","SEU TEMPO")+
 '<section class="card ef-timer-card" style="max-width:760px;margin:auto;text-align:center">'+
 '<div class="ef-live-clock">'+uiIcon("clock")+' Hora atual <strong id="wall-clock">'+currentTime+'</strong></div>'+
 '<div class="pill">⏱️ '+(chronoMode==="desc"?"Temporizador":"Cronômetro")+'</div>'+
 '<div id="clock" class="clock">00:00:00</div><div class="timerbuttons">'+
 action("timer-toggle",running?"⏸ Pausar":"▶ Iniciar")+
 action("timer-reset","↺ Reiniciar","btn secondary")+
 action("timer-mode","↔ Trocar modo","btn secondary")+'</div>'+
 '<div class="timerbuttons" style="margin-top:18px">'+
 [30,60,120,300,600].map(s=>action("timer-preset",s>=60?s/60+" min":s+" s","btn secondary small",'data-seconds="'+s+'"')).join("")+'</div>'+
 '<p class="footnote">O cronômetro funciona enquanto a página estiver ativa. O celular pode suspender a contagem quando o aplicativo está em segundo plano.</p></section>';
}

function notificationsPage(){
 const available=("Notification" in window);
 const permission=available?Notification.permission:"unsupported";
 const enabled=Boolean(data.notifications&&permission==="granted");
 const meals=[...data.meals].sort((a,b)=>a.time.localeCompare(b.time));
 const list=meals.map(m=>'<div class="listitem"><span class="circle">'+uiIcon("clock")+'</span>'+
 '<div class="grow"><strong>'+es(m.name)+'</strong><small>'+es(m.time)+' · '+(enabled?'Lembrete ativo':'Lembrete desativado')+'</small></div></div>').join("");
 return title("Notificações","Organize os lembretes dos horários das refeições.","MEUS LEMBRETES")+
 '<div class="grid two"><section class="card"><div class="cardhead"><h2>Avisos no navegador</h2>'+
 '<span class="pill">'+(enabled?'Ativados':'Desativados')+'</span></div>'+
 '<p>Receba avisos dos horários programados enquanto o EvoluFit estiver aberto.</p>'+
 action("notify-toggle",enabled?"Desativar lembretes":"Ativar lembretes",enabled?"btn secondary":"btn")+
 '<p class="footnote">'+(permission==="denied"?"Permissão bloqueada no navegador: altere nas configurações do site.":'O aplicativo ainda não envia alertas quando está fechado. Sem notificações em segundo plano nesta versão.')+'</p></section>'+
 '<section class="card"><div class="cardhead"><h2>Próximas refeições</h2><a class="ef-chip" href="#alimentacao">Editar horários ›</a></div>'+
 (list||empty("Nenhum horário","Adicione horários em Alimentação.","🔔"))+
 '</section></div>';
}

function settings(){
 const cloud=!!window.EvoluCloud?.active;
 return title("Configurações","Personalize seu perfil e cuide dos seus registros.","MEU EVOLUFIT")+'<div class="grid two"><section class="card"><h2>Meu perfil</h2><form data-form="profile" class="formgrid"><div class="field full"><label>Nome ou apelido</label><input name="name" maxlength="60" value="'+es(data.profile.name)+'"></div><div class="field"><label>Altura (cm)</label><input type="number" name="height" min="80" max="240" value="'+es(data.profile.height)+'" placeholder="Ex: 170"></div><div class="field"><label>Peso-meta opcional (kg)</label><input type="number" name="goal" min="10" max="500" step="0.1" value="'+es(data.profile.goal)+'" placeholder="Ex: 70"></div><div class="field full"><button class="btn">Salvar perfil</button></div></form><p class="footnote">Metas pessoais podem ser de manutenção ou evolução de hábitos; emagrecer não é obrigatório.</p></section><section class="card"><h2>Privacidade & dados</h2><p>'+(cloud?'Registros e fotos sincronizados com sua conta privada no Supabase. Não compartilhe sua senha. Alterações simultâneas em vários dispositivos podem sobrescrever registros.':'Dados de peso, treinos, alimentação e caminhadas ficam no localStorage deste navegador. Fotos ficam no IndexedDB. Não existe conta nem sincronização entre dispositivos.')+'</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+action("export","⬇ Exportar registros","btn secondary")+action("clear","🗑 Apagar dados","btn danger")+'</div><p class="footnote">A exportação JSON não inclui fotos. Limpar os dados do navegador pode apagar o histórico.</p></section></div><div class="notice" style="margin-top:20px">'+(cloud?'EvoluFit v0.2: seus registros estão vinculados à sua conta. Alarmes ainda dependem do navegador aberto.':'Versão de demonstração EvoluFit v0.1. Novos recursos virão após testes de segurança, acessibilidade e privacidade.')+'</div>';
}
function showModal(markup){let m=$("#modal");m.hidden=false;m.innerHTML='<div class="dialog" role="dialog" aria-modal="true">'+markup+'</div>';m.addEventListener("click",outside,{once:true});}
function outside(e){if(e.target===$("#modal"))closeModal();}
function closeModal(){$("#modal").hidden=true;$("#modal").innerHTML="";}
function modalTraining(plan){
 showModal('<div class="exercise-modal"><h2>'+es(plan.title)+'</h2><p>'+es(plan.desc)+'</p>'+
 '<span class="pill">'+plan.level+' • '+plan.time+' min</span>'+
 '<h3 style="margin:19px 0 12px">Exercícios ilustrados</h3>'+
 '<div class="exercise-sequence">'+plan.steps.map(exerciseRow).join("")+'</div>'+
 '<p class="footnote">Imagens demonstrativas geradas por IA; são exemplos, não substituem orientação profissional. Adapte ao seu ritmo; pare se sentir dor, tontura ou falta de ar incomum.</p>'+
 '<div class="dialogbtns">'+action("close","Voltar","btn secondary")+
 action("finish-plan","✓ Concluir treino","btn",'data-plan="'+plan.id+'"')+'</div></div>');
}
function modalPhoto(){
 showModal('<h2>Adicionar foto da evolução</h2><p>'+(window.EvoluCloud?.active?'Foto guardada de forma privada na sua conta.':'Foto guardada somente neste dispositivo.')+'</p><form data-form="photo" class="formgrid"><div class="field full"><label>Escolher imagem (JPG, PNG ou WebP)</label><input type="file" name="photo" accept="image/*" required></div><div class="field"><label>Data</label><input type="date" name="date" max="'+today()+'" value="'+today()+'" required></div><div class="field"><label>Observação</label><input name="note" maxlength="60" placeholder="Ex: Primeiro dia"></div><div class="field full"><button class="btn">Guardar foto</button></div></form>'+action("close","Cancelar","btn secondary")+'<p class="footnote">Fotos não são incluídas na exportação JSON. Não compartilhe seu dispositivo com outras pessoas se armazenar fotos pessoais.</p>');
}
function photoDB(){
 return new Promise((resolve,reject)=>{
 const req=indexedDB.open("evolufit-photos-v1",1);
 req.onupgradeneeded=()=>req.result.createObjectStore("photos",{keyPath:"id"});
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
async function photoOp(mode,item){
 if(window.EvoluCloud?.active)return window.EvoluCloud.photoOp(mode,item);
 if(window.EVOLUFIT_SUPABASE?.url && window.EVOLUFIT_SUPABASE?.publishableKey)throw new Error("Entre na sua conta.");
 const db=await photoDB();
 return new Promise((resolve,reject)=>{
 const tx=db.transaction("photos",mode==="get"?"readonly":"readwrite"),store=tx.objectStore("photos");
 const req=mode==="put"?store.put(item):mode==="delete"?store.delete(item):mode==="clear"?store.clear():store.getAll();
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();
 });
}
async function loadPhotos(){
 if(!$("#photo-list"))return;
 photoUrls.forEach(u=>URL.revokeObjectURL(u));photoUrls=[];
 try{
 const list=await photoOp("get");list.sort((a,b)=>b.date.localeCompare(a.date));
 if(!list.length){$("#photo-list").innerHTML=empty("Sua galeria começa aqui","Adicione sua primeira foto para registrar sua evolução.","📸");return;}
 $("#photo-list").innerHTML='<div class="photo-grid">'+list.map(p=>{
 const url=URL.createObjectURL(p.blob);photoUrls.push(url);
 return '<div class="photo-card"><img src="'+url+'" loading="lazy" alt="Foto de evolução de '+es(p.date)+'"><div><strong>'+es(p.date)+'</strong><br><small>'+es(p.note||"Minha evolução")+'</small><br>'+action("photo-delete","Excluir foto","btn secondary small",'data-id="'+p.id+'"')+'</div></div>';
 }).join("")+'</div>';
 }catch(e){$("#photo-list").innerHTML=empty("Galeria indisponível","Este navegador não disponibilizou armazenamento de fotos.","📷");}
}
function drawClock(){
 const el=$("#clock");if(!el)return;
 const v=Math.max(0,sec);
 el.textContent=pad(Math.floor(v/3600))+":"+pad(Math.floor((v%3600)/60))+":"+pad(v%60);
 const b=document.querySelector('[data-action="timer-toggle"]');
 if(b)b.textContent=running?"⏸ Pausar":"▶ Iniciar";
}

function stepClock(){
 const wall=$("#wall-clock");if(wall)wall.textContent=new Date().toLocaleTimeString("pt-BR",{hour12:false});
 if(!running)return;
 if(chronoMode==="desc"){sec=Math.max(0,sec-1);if(sec===0){running=false;toast("⏰ Seu tempo terminou!");}}
 else{sec++;}drawClock();
}

function checkMeals(){
 if(!data.notifications||!("Notification" in window)||Notification.permission!=="granted")return;
 const now=new Date(),time=pad(now.getHours())+":"+pad(now.getMinutes());
 for(const meal of data.meals){if(meal.time!==time)continue;const key="ef-notified-"+today()+"-"+meal.id+"-"+time;
 if(sessionStorage.getItem(key))continue;sessionStorage.setItem(key,"1");
 try{new Notification("EvoluFit • Hora da refeição",{body:"Lembrete: "+meal.name});}catch(_){toast("Hora de "+meal.name);}
 }
}
function downloadJson(){
 const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),data},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="evolufit-registros-"+today()+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener("click",async e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 const act=b.dataset.action,idv=b.dataset.id; if(act==="meal-check")return;
 if(act==="toggle-menu"){const opened=document.body.classList.toggle("menu-open");b.setAttribute("aria-expanded",String(opened));document.querySelector("#menu-overlay")?.setAttribute("aria-hidden",String(!opened));return;}
 if(act==="close-menu"){document.body.classList.remove("menu-open");document.querySelector("#menu-overlay")?.setAttribute("aria-hidden","true");return;}
 if(act==="notify-toggle"){
  if(data.notifications){data.notifications=false;save();render();toast("Lembretes desativados.");return;}
  if(!("Notification" in window)){toast("Seu navegador não oferece esse recurso.");return;}
  const permission=await Notification.requestPermission();
  data.notifications=(permission==="granted");save();render();
  toast(data.notifications?"Lembretes ativados enquanto o site estiver aberto.":"Permissão não concedida.");
  return;
 }
 if(act==="goto"){location.hash=b.dataset.target;return;}
 if(act==="open-training"){const p=PLANS.find(p=>p.id===b.dataset.plan);if(p)modalTraining(p);return;}
 if(act==="finish-plan"){const p=PLANS.find(p=>p.id===b.dataset.plan);if(!p)return;
 data.workouts.push({id:id(),date:today(),title:p.title,minutes:p.time});save();closeModal();render();toast("Treino registrado! 🎉");return;}
 if(act==="close"){closeModal();return;}
 if(act==="water-add"||act==="water-remove"){data.water[today()]=Math.max(0,Math.min(30,(data.water[today()]||0)+(act==="water-add"?1:-1)));save();render();return;}
 if(act==="remove-walk"){if(confirm("Excluir esta caminhada?")){data.walks=data.walks.filter(x=>x.id!==idv);save();render();}return;}
 if(act==="remove-weight"){if(confirm("Excluir este peso?")){data.weights=data.weights.filter(x=>x.id!==idv);save();render();}return;}
 if(act==="remove-meal"){if(confirm("Excluir este horário?")){data.meals=data.meals.filter(x=>x.id!==idv);save();render();}return;}
 if(act==="add-photo"){modalPhoto();return;}
 if(act==="photo-delete"){if(confirm("Excluir esta foto permanentemente?")){try{await photoOp("delete",idv);await loadPhotos();toast("Foto excluída.");}catch(_){toast("Não foi possível excluir a foto.");}}return;}
 if(act==="notify"){if(!("Notification" in window)){toast("Navegador sem suporte a notificações.");return;}
 const p=await Notification.requestPermission();data.notifications=p==="granted";save();toast(data.notifications?"Lembretes ativados enquanto o app estiver aberto.":"Permissão não concedida.");return;}
 if(act==="timer-toggle"){running=!running;drawClock();return;}
 if(act==="timer-reset"){running=false;sec=chronoMode==="desc"?300:0;drawClock();return;}
 if(act==="timer-mode"){running=false;chronoMode=chronoMode==="desc"?"up":"desc";sec=chronoMode==="desc"?300:0;render();return;}
 if(act==="timer-preset"){running=false;chronoMode="desc";sec=Number(b.dataset.seconds);render();return;}
 if(act==="export"){downloadJson();toast("Registros exportados.");return;}
 if(act==="clear"){
 if(window.EvoluCloud?.active){
  if(!confirm("Apagar seus registros sincronizados? As fotos serão preservadas. Esta ação não pode ser desfeita."))return;
  data=defaultData();save();render();toast("Registros limpos; fotos preservadas.");return;
 }
 if(!confirm("Apagar dados e fotos salvos neste navegador? Esta ação não pode ser desfeita."))return;
 localStorage.removeItem(KEY);try{await photoOp("clear");}catch(_){}data=defaultData();render();toast("Dados locais apagados.");return;
}
});
document.addEventListener("change",e=>{
 const t=e.target;
 if(t.dataset.action==="meal-check"){
 const set=new Set(data.mealDone[today()]||[]);
 if(t.checked)set.add(t.dataset.id);else set.delete(t.dataset.id);
 data.mealDone[today()]=[...set];save();render();toast("Rotina atualizada.");
 }
});
document.addEventListener("submit",async e=>{
 const form=e.target.closest("[data-form]");if(!form)return;e.preventDefault();
 const fd=new FormData(form),name=form.dataset.form;
 if(name==="walk"){
 const minutes=Number(fd.get("minutes")),distance=fd.get("distance")?Number(fd.get("distance")):null,date=String(fd.get("date"));
 if(!(minutes>0&&minutes<=1440)||!date||date>today()||distance!==null&&!(distance>=0&&distance<=100)){toast("Confira os dados da caminhada.");return;}
 data.walks.push({id:id(),date,minutes,distance,pace:String(fd.get("pace"))});save();render();toast("Caminhada registrada!");return;
 }
 if(name==="meal"){
 const n=String(fd.get("name")||"").trim().slice(0,45),t=String(fd.get("time")||"");
 if(!n||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)){toast("Informe nome e horário válido.");return;}
 data.meals.push({id:id(),name:n,time:t});save();render();toast("Horário adicionado.");return;
 }
 if(name==="weight"){
 const w=Number(fd.get("weight")),date=String(fd.get("date"));
 if(!(w>=10&&w<=500)||!date||date>today()){toast("Informe peso e data válidos.");return;}
 data.weights.push({id:id(),weight:w,date});save();render();toast("Peso registrado.");return;
 }
 if(name==="profile"){
 const n=String(fd.get("name")||"").trim().slice(0,60),h=String(fd.get("height")||""),g=String(fd.get("goal")||"");
 if(h&&!(Number(h)>=80&&Number(h)<=240)||g&&!(Number(g)>=10&&Number(g)<=500)){toast("Confira as medidas.");return;}
 data.profile={name:n,height:h,goal:g};save();render();toast("Perfil salvo.");return;
 }
 if(name==="photo"){
 const file=fd.get("photo"),date=String(fd.get("date")||""),note=String(fd.get("note")||"").slice(0,60);
 if(!(file instanceof File)||!file.size||file.size>8*1024*1024||!file.type.startsWith("image/")||!date||date>today()){toast("Use uma foto de até 8 MB com data válida.");return;}
 try{await photoOp("put",{id:id(),date,note,blob:file});closeModal();await loadPhotos();toast(window.EvoluCloud?.active?"Foto salva na sua conta!":"Foto salva neste navegador!");}
 catch(err){console.error(err);toast("Falha ao guardar foto. Verifique sua conexão e tente novamente.");}return;
 }
});
window.addEventListener("hashchange",()=>{document.body.classList.remove("menu-open");view=(location.hash||"#inicio").slice(1);render();window.scrollTo(0,0);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
window.EvoluApp={
 getData:()=>data,
 setData:(payload)=>{
  const base=defaultData();
  data={...base,...payload,profile:{...base.profile,...(payload?.profile||{})},
   walks:Array.isArray(payload?.walks)?payload.walks:[],workouts:Array.isArray(payload?.workouts)?payload.workouts:[],
   weights:Array.isArray(payload?.weights)?payload.weights:[],meals:Array.isArray(payload?.meals)?payload.meals:base.meals,
   water:payload?.water||{},mealDone:payload?.mealDone||{}};
  render();
 },
 defaultData,render,showToast:toast
};
interval=setInterval(()=>{stepClock();checkMeals();},1000);
render();
