/* EvoluFit / Central de Missões
 * Layer on existing v0.1/v0.2 app; all personal data stays in the existing
 * local/Supabase store. Mockup figures are not used as sample data.
 */
(() => {
 "use strict";
 const assetBase=location.pathname.includes("/beta/")?"../":"";
 const mascot=assetBase+"assets/evolufit-gatinho-hd.webp";
 const logo=assetBase+"assets/evolufit-marca-hd.webp";
 const guidePhoto=assetBase+"assets/exercicios/cadeira-foto.webp";
 const wanted=[["inicio","Início"],["treinos","Treinos"],["caminhadas","Caminhadas"],["alimentacao","Alimentação"],["cronometro","Cronômetro"],["evolucao","Minha evolução"],["fotos","Fotos"],["ajustes","Perfil"],["notificacoes","Notificações"]];
 const state={guided:null,guideInterval:null,restInterval:null,tab:"progress",photos:[],starting:false};
 const E=x=>es(x);
 const icon=(k,n=25)=>uiIcon(k,n);
 const arrow="›";
 const formatDate=d=>{try{return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short"}).format(new Date(d+"T12:00:00"))}catch{return E(d)}};
 const displayName=()=>E((data.profile?.name||"").trim().split(" ")[0]||"você");
 const weightData=()=>[...(data.weights||[])].filter(x=>Number.isFinite(Number(x.weight))&&Number(x.weight)>0&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||"")).sort((a,b)=>a.date.localeCompare(b.date));
 const activeDates=()=>{
  const days=new Set();
  for(const item of [...(data.workouts||[]),...(data.walks||[])])if(/^\d{4}-\d\d-\d\d$/.test(item.date||""))days.add(item.date);
  return days;
 };
 const weekDates=()=>{
  const d=new Date(today()+"T12:00:00"),arr=[];
  for(let i=6;i>=0;i--){const t=new Date(d);t.setDate(d.getDate()-i);arr.push(t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"));}
  return arr;
 };
 const streak=()=>{
  const days=activeDates();let now=new Date(today()+"T12:00:00");
  if(!days.has(today()))now.setDate(now.getDate()-1);
  let n=0;for(let i=0;i<365&&days.has(now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0"));i++){n++;now.setDate(now.getDate()-1);}
  return n;
 };
 const weekCount=()=>weekDates().filter(x=>activeDates().has(x)).length;
 const chart=()=>{
  const a=weightData().slice(-9);
  if(a.length===0)return '<div class="efm-chart-empty">Registre seu primeiro peso para acompanhar a evolução.</div>';
  const w=410,h=130,pad=20,values=a.map(x=>Number(x.weight));
  const min=Math.min(...values),max=Math.max(...values),span=Math.max(max-min,1);
  const pts=values.map((v,i)=>[pad+i*(w-2*pad)/Math.max(values.length-1,1),h-pad-(v-min)/span*(h-2*pad)]);
  const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
  const fill=d+" L"+pts[pts.length-1][0].toFixed(1)+","+(h-4)+" L"+pts[0][0].toFixed(1)+","+(h-4)+"Z";
  return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Evolução real de peso com '+values.length+' registros">'+
   '<defs><linearGradient id="efm-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8ff13" stop-opacity=".42"/><stop offset="1" stop-color="#a8ff13" stop-opacity="0"/></linearGradient></defs>'+
   '<path d="M12 '+(h-pad)+' H398 M12 '+(h/2)+' H398" fill="none" stroke="#254a21" stroke-width="1"/>'+
   '<path d="'+fill+'" fill="url(#efm-fill)"/><path d="'+d+'" fill="none" stroke="#b7ff14" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'+
   pts.map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.8" fill="#cbff39" stroke="#305c12" stroke-width="1.3"/>').join("")+
   '<text x="'+pad+'" y="'+(h-2)+'" text-anchor="start" font-size="12" fill="#abc1ac">'+E(formatDate(a[0].date))+'</text>'+
   '<text x="'+(w-pad)+'" y="'+(h-2)+'" text-anchor="end" font-size="12" fill="#abc1ac">'+E(formatDate(a[a.length-1].date))+'</text>'+
   '</svg>';
 };
 const panelTitle=(key,title,aside="")=>'<div class="efm-card-title">'+icon(key,30)+' <span>'+title+'</span>'+aside+'</div>';
 const miniNotify=()=>{
  const enabled=Boolean(data.notifications&&typeof Notification!=="undefined"&&Notification.permission==="granted");
  const meals=[...(data.meals||[])].sort((a,b)=>String(a.time).localeCompare(String(b.time))).slice(0,3);
  if(meals.length===0)return '<p class="efm-footer-hint">Configure horários de refeições para receber lembretes.</p>';
  return meals.map((meal,i)=>'<div class="efm-notify-row">'+icon(i===0?"alimentacao":"clock",25)+
   '<div><strong>'+E(meal.name)+'</strong><small>'+E(meal.time)+' · '+(enabled?"Lembrete ligado":"Lembrete desligado")+'</small></div>'+
   '<span class="efm-switch '+(enabled?"on":"")+'" aria-hidden="true"></span></div>').join("");
 };
 function customNav(){
  const name=displayName(),photo=mascot;
  $("#sidebar").innerHTML='<a href="#inicio" class="efm-sidebar-logo"><img src="'+logo+'" alt="EvoluFit"></a>'+
   '<div class="efm-sidebar-groups">'+wanted.map((n,i)=>(i===0||i===5?'<div class="navtitle">'+(i===0?"MISSÕES":"MEU EVOLUFIT")+'</div>':"")+
    '<a href="#'+n[0]+'" class="navlink '+(view===n[0]?"active":"")+'">'+icon(n[0],24)+' <span>'+n[1]+'</span></a>').join("")+'</div>'+
   '<div class="sidebarfoot"><a href="#ajustes" class="efm-user-chip"><div class="efm-user-avatar">'+E((data.profile?.name||"E")[0].toUpperCase())+'</div><div><strong>'+name+'</strong><span>Seu espaço EvoluFit</span></div></a></div>';
  $("#topbar").innerHTML='<button class="menu-trigger" type="button" data-action="toggle-menu" aria-label="Abrir menu" aria-expanded="false">'+icon("menu")+'</button>'+
   '<a href="#inicio" class="efm-top-brand">Evolu<b>Fit</b></a>'+
   '<div class="efm-top-greeting">'+(view==="inicio"?"Sua evolução é a missão":E(NAV.find(n=>n[0]===view)?.[1]||"Seu espaço"))+'</div>'+
   '<div class="top-actions"><a class="quick-bell" href="#notificacoes" aria-label="Lembretes">'+icon("notificacoes",20)+'</a>'+
   '<a class="avatar" href="#ajustes" aria-label="Meu perfil">'+E((data.profile?.name||"E")[0].toUpperCase())+'</a></div>';
  const items=[["inicio","Início"],["treinos","Treinos"],["evolucao","Evolução"],["ajustes","Perfil"]];
  $("#bottomnav").innerHTML=items.map(([key,label])=>'<a href="#'+key+'" class="'+(view===key?"active":"")+'"><b>'+icon(key,21)+'</b><span>'+label+'</span></a>').join("");
  window.EvoluCloud?.decorateNav();
 }
 function customHome(){
  const plan=PLANS[0],completed=data.workouts.some(x=>x.date===today()&&x.title===plan.title);
  const dayCount=weekCount(),days=weekDates(),act=activeDates(),weight=weightData(),latest=weight.at(-1),initial=weight[0];
  const delta=latest&&initial&&weight.length>1?(Number(latest.weight)-Number(initial.weight)):null;
  const hero='<section class="efm-card efm-hero"><div class="efm-hero-mascot"><img src="'+mascot+'" alt="Gatinho treinador EvoluFit"></div>'+
   '<div class="efm-hero-copy"><span class="efm-kicker">◆ FOCO · DISCIPLINA · EVOLUÇÃO</span>'+
   '<h1 class="efm-display">CENTRAL DE <span>MISSÕES</span></h1>'+
   '<p class="efm-lede"><strong>Olá, '+displayName()+'!</strong>Pronto para mais um passo na sua evolução? Escolha sua missão e bora evoluir!</p></div></section>';
  const mission='<section class="efm-card efm-mission">'+panelTitle("meta","Missão do dia")+
   '<div class="efm-mission-item">'+icon("treinos",40)+'<div><strong>'+E(plan.title)+'</strong>'+
   '<small>'+plan.time+' min · '+plan.steps.length+' exercícios · '+E(plan.level)+'</small></div></div>'+
   '<div class="efm-kicker">'+(completed?"✓ MISSÃO CONCLUÍDA HOJE":"● MISSÃO DISPONÍVEL")+'</div>'+
   '<button class="btn efm-mission-begin" data-action="efm-start" data-plan="'+E(plan.id)+'">▶ '+(completed?"Repetir missão":"Iniciar missão")+'</button></section>';
  const buttons=[["treinos","Treinos"],["caminhadas","Caminhadas"],["alimentacao","Alimentação"],["cronometro","Cronômetro"]].map(([id,label])=>
   '<a href="#'+id+'" class="efm-action">'+icon(id,45)+'<strong>'+label+'</strong></a>').join("");
  const exercise='<section class="efm-card efm-card-padding efm-preview">'+panelTitle("treinos","Treino guiado",'<span class="pill" style="margin-left:auto">Em casa · Iniciante</span>')+
   '<div class="efm-preview-content"><img class="efm-preview-photo" src="'+guidePhoto+'" alt="Pessoa demonstrando sentar e levantar de uma cadeira">'+
   '<div class="efm-preview-text"><h3>Sentar e levantar</h3><p>Atividade leve com cadeira firme · 8 repetições</p>'+
   '<div class="efm-preview-controls"><button class="efm-round" data-action="efm-start" data-plan="inicio" title="Iniciar treino" aria-label="Iniciar treino">◀</button>'+
   '<button class="efm-round efm-primary" data-action="efm-start" data-plan="inicio" aria-label="Iniciar treino">▶</button>'+
   '<button class="efm-round" data-action="efm-start" data-plan="inicio" title="Ver passos" aria-label="Ver passos">▶</button></div></div></div></section>';
  const evolution='<section class="efm-card efm-card-padding efm-progress">'+panelTitle("evolucao","Minha evolução",'<a class="efm-mini-button" style="margin-left:auto" href="#evolucao">Ver tudo ›</a>')+
   '<div class="efm-chart-container">'+chart()+'</div>'+
   '<div class="efm-progress-summary"><div><small>Peso registrado</small><strong>'+(latest?money(latest.weight):"—")+'</strong></div>'+
   '<div><small>'+(delta===null?"Seu ritmo":"Variação registrada")+'</small><strong style="color:#b7ff31;font-size:17px">'+(delta===null?"Comece hoje":(delta>0?"+":"")+fmt(delta)+" kg")+'</strong></div></div></section>';
  const weekly='<section class="efm-card efm-card-padding efm-weekly">'+panelTitle("meta","Meta da semana")+
   '<div class="efm-weekly-numbers"><strong>'+dayCount+'</strong><span>de 7 dias com atividade</span></div>'+
   '<div class="efm-weekly-bars">'+days.map(d=>'<span class="'+(act.has(d)?"on":"")+'" title="'+E(d)+'"></span>').join("")+'</div>'+
   '<p class="efm-footer-hint">Conta treinos e caminhadas registrados.</p></section>';
  const notifications='<section class="efm-card efm-card-padding efm-notifications">'+panelTitle("notificacoes","Lembretes")+
   miniNotify()+'<a href="#notificacoes" class="efm-mini-button">Gerenciar avisos ›</a>'+
   '<p class="efm-footer-hint">Avisos disponíveis enquanto o site estiver aberto.</p></section>';
  return '<div class="efm-dashboard"><div class="efm-core">'+hero+'<div class="efm-actions">'+buttons+'</div>'+
   '<div class="efm-main-lower">'+exercise+evolution+'</div></div>'+
   '<div class="efm-rail">'+mission+weekly+notifications+'</div></div>';
 }
 function awards(){
  const workouts=data.workouts.length,walks=data.walks.length,days=activeDates().size;
  const all=[["treinos","Primeiro treino",workouts>0,"Conclua seu primeiro treino"],["caminhadas","Primeira caminhada",walks>0,"Registre uma caminhada"],
   ["meta","3 dias de evolução",days>=3,"Registre atividades em três dias"],["check","7 dias ativos",days>=7,"Movimente-se em sete dias"]];
  return '<div class="efm-achievements">'+all.map(([k,title,unlocked,hint])=>'<div class="efm-award '+(unlocked?"":"locked")+'">'+icon(k,44)+
   '<strong>'+title+'</strong><small>'+(unlocked?"✓ Conquistada":hint)+'</small></div>').join("")+'</div>';
 }
 function photoSection(){
  return '<section class="efm-card efm-card-padding">'+panelTitle("fotos","Antes e depois",'<a href="#fotos" class="efm-mini-button" style="margin-left:auto">Minha galeria ›</a>')+
   '<div id="efm-compare" class="efm-before-after"><div class="efm-empty-photo">Sua primeira foto privada</div><div class="efm-empty-photo">Sua foto mais recente</div></div>'+
   '<p class="efm-footer-hint">As fotos só aparecem se você as adicionar à sua galeria.</p></section>';
 }
 async function loadCompare(){
  const el=document.querySelector("#efm-compare");if(!el)return;
  state.photos.forEach(u=>URL.revokeObjectURL(u));state.photos=[];
  try {
   const items=await photoOp("get");
   if(!document.querySelector("#efm-compare"))return;
   if(items.length<2)return;
   const sorted=items.slice().sort((a,b)=>a.date.localeCompare(b.date));
   const pair=[sorted[0],sorted[sorted.length-1]];
   el.innerHTML=pair.map((p,i)=>{
    const url=URL.createObjectURL(p.blob);state.photos.push(url);
    return '<div><img src="'+url+'" alt="'+(i===0?"Foto inicial":"Foto mais recente")+' de evolução"><small>'+(i?"Mais recente":"Primeira foto")+' · '+E(formatDate(p.date))+'</small></div>';
   }).join("");
  }catch(_){/* No authentication/no IndexedDB support: keep safe placeholder. */}
 }
 function customEvolution(){
  const a=weightData(),last=a.at(-1),first=a[0],delta=first&&last&&a.length>1?Number(last.weight)-Number(first.weight):null;
  const days=activeDates(),w=weekCount();
  const tabs='<div class="efm-tabs" role="group" aria-label="Visualização da evolução">'+
   '<button class="'+(state.tab==="progress"?"active":"")+'" data-action="efm-tab" data-tab="progress" aria-pressed="'+(state.tab==="progress")+'">Progresso</button>'+
   '<button class="'+(state.tab==="awards"?"active":"")+'" data-action="efm-tab" data-tab="awards" aria-pressed="'+(state.tab==="awards")+'">Conquistas</button></div>';
  const progress='<div class="efm-evolution-main"><section class="efm-card efm-card-padding">'+
   panelTitle("peso","Peso e medidas")+'<div class="efm-progress-summary" style="margin-bottom:14px"><div><small>Peso atual</small>'+
   '<strong>'+(last?money(last.weight):"—")+'</strong></div>'+
   '<div><small>Variação registrada</small><strong style="font-size:17px">'+(delta===null?"—":(delta>0?"+":"")+fmt(delta)+" kg")+'</strong></div></div>'+
   '<div class="efm-chart-container" style="height:210px">'+chart()+'</div><a class="efm-mini-button" href="#ajustes">Configurar perfil ›</a></section>'+
   '<section class="efm-card efm-card-padding">'+panelTitle("meta","Constância")+
   '<div class="efm-streak"><span>Sequência atual</span><strong style="color:#c0ff35">'+streak()+' dia(s)</strong></div>'+
   '<div class="efm-streak" style="margin-top:12px"><span>Dias ativos nesta semana</span><strong>'+w+'/7</strong></div>'+
   '<div class="efm-weekly-bars">'+weekDates().map(d=>'<span class="'+(days.has(d)?"on":"")+'"></span>').join("")+'</div>'+
   '<p class="efm-footer-hint">Contagem baseada nas suas caminhadas e treinos registrados.</p>'+
   '<a href="#evolucao" class="efm-mini-button" data-action="efm-tab" data-tab="awards">Ver conquistas ›</a></section></div>';
  const content=state.tab==="progress"?progress:
   '<section class="efm-card efm-card-padding">'+panelTitle("meta","Conquistas reais")+awards()+'</section>';
  setTimeout(loadCompare,0);
  return '<div class="efm-evolution">'+title("Minha evolução","Seu progresso, seu ritmo. Sem números fictícios.","CENTRAL DE EVOLUÇÃO")+
   tabs+content+photoSection()+'<section class="efm-card efm-card-padding"><h2>Registrar meu peso</h2>'+
   '<form data-form="weight" class="formgrid"><div class="field"><label>Peso em kg</label><input name="weight" type="number" min="10" max="500" step="0.1" required></div>'+
   '<div class="field"><label>Data</label><input name="date" type="date" max="'+today()+'" value="'+today()+'" required></div>'+
   '<div class="field full"><button class="btn">Salvar registro</button></div></form>'+
   '<p class="efm-footer-hint">O peso é apenas um registro. Ele não define seu sucesso nem sua saúde.</p></section></div>';
 }
 function formatClock(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
 function stopTicker(){if(state.guideInterval){clearInterval(state.guideInterval);state.guideInterval=null}}
 function guideElapsed(){
  const g=state.guided;if(!g)return 0;
  return Math.floor((g.accumulated+(g.playing?Date.now()-g.startAt:0))/1000);
 }
 function displayGuideClock(){
  const el=document.querySelector("#efm-guide-clock");
  if(el)el.textContent=formatClock(guideElapsed());
 }
 function pauseGuide(){
  const g=state.guided;if(!g||!g.playing)return;
  g.accumulated+=Date.now()-g.startAt;g.playing=false;stopTicker();
 }
 function showGuide(plan){
  if(!plan)return;
  state.guided={plan,idx:0,accumulated:0,playing:false,startAt:0,totalMs:0,restUntil:0};
  renderGuide();
 }
 function stopRestTicker(){if(state.restInterval){clearInterval(state.restInterval);state.restInterval=null}}
 function displayRestClock(){
  const g=state.guided,el=document.querySelector('#efm-rest-clock');if(!g||!el)return;
  const remaining=Math.max(0,Math.ceil((g.restUntil-Date.now())/1000));
  el.textContent=remaining?remaining+' s':'Pronto para continuar';
  if(remaining===0)stopRestTicker();
 }
 function startGuideRest(){
  const g=state.guided;if(!g)return;
  const drill=window.EvoluWorkouts?.stepInfo(g.plan,g.idx);
  const rest=drill?.rest??g.plan?.rest??60;
  if(rest<=0)return;
  stopRestTicker();g.restUntil=Date.now()+rest*1000;
  displayRestClock();state.restInterval=setInterval(displayRestClock,400);
 }
 function renderGuide(){
  const g=state.guided;if(!g)return;
  const step=g.plan.steps[g.idx],drill=window.EvoluWorkouts?.stepInfo(g.plan,g.idx);
  const fallback=exerciseGuide(step),name=drill?.name||step;
  const src=drill?.kind?window.EvoluWorkouts?.imageUrl(drill.kind):exerciseImage(fallback.kind);
  const tip=drill?.technique||fallback.tip;
  const rest=drill?.rest??g.plan.rest??60;
  const progress=g.plan.steps.map((s,i)=>'<span class="'+(i<=g.idx?'on':'')+'" aria-label="Etapa '+(i+1)+' de '+g.plan.steps.length+'"></span>').join('');
  const photo=src?'<img src="'+src+'" alt="Demonstração do exercício '+E(name)+'">':
   '<div class="efm-guided-placeholder">'+icon('treinos',60)+'<div>Realize o movimento seguindo as instruções.</div></div>';
  const phase=drill?.phase||'Exercício';
  const prescription=drill?.work||'';
  const adaptations=drill?'<div class="efp-guide-alternatives"><div><strong>Mais leve</strong><p>'+E(drill.easier)+'</p></div><div><strong>Para progredir</strong><p>'+E(drill.harder)+'</p></div></div>':'';
  const restRow=rest>0?'<div class="efp-guide-rest"><div><strong>Descanso entre séries</strong><small>'+rest+' segundos sugeridos</small></div><button type="button" class="btn secondary" data-action="efm-rest">⏲ Iniciar pausa</button><span id="efm-rest-clock" class="efp-rest-clock">'+(g.restUntil?'':'Quando precisar')+'</span></div>':'';
  const markup='<div class="efm-guided"><div><div class="efm-guided-header"><div>'+ 
    '<div class="efm-kicker">'+E(g.plan.title)+' · Exercício '+(g.idx+1)+' de '+g.plan.steps.length+'</div>'+ 
    '<h2>TREINO EM CASA · '+E(g.plan.level)+'</h2></div>'+ 
    '<button class="btn secondary" type="button" data-action="efm-exit" aria-label="Sair do treino">✕ Fechar</button></div>'+ 
    '<div class="efm-guide-progress">'+progress+'</div></div>'+ 
    '<div class="efm-guided-body"><div class="efm-guided-media">'+photo+'</div>'+ 
    '<div class="efm-guide-details"><span class="efp-guide-phase">'+E(phase)+'</span>'+ 
    '<h3>'+E(name)+'</h3><div class="efp-guide-prescription">'+E(prescription)+'</div>'+ 
    '<div class="efp-guide-time-label">Tempo ativo da sessão</div><span id="efm-guide-clock" class="efm-guide-clock">'+formatClock(guideElapsed())+'</span>'+ 
    '<div class="efm-guide-cue">'+E(tip)+'</div>'+adaptations+restRow+
    '<div class="efm-guide-actions"><button class="btn secondary" data-action="efm-prev" '+(g.idx===0?'disabled':'')+'>‹ Anterior</button>'+ 
    '<button class="btn" data-action="efm-play">'+(g.playing?'⏸ Pausar':'▶ Iniciar')+'</button>'+ 
    '<button class="btn secondary" data-action="'+(g.idx===g.plan.steps.length-1?'efm-complete':'efm-next')+'">'+(g.idx===g.plan.steps.length-1?'✓ Concluir':'Próximo ›')+'</button></div></div></div>'+ 
    '<div class="efm-guide-footer">'+E(g.plan.equipment||'Sem academia')+' · Expire durante o esforço; evite prender a respiração. Pare em caso de dor, tontura ou falta de ar incomum.</div></div>';
  if($('#modal')?.hidden!==false)showModal(markup);
  else $('#modal').innerHTML='<div class="dialog" role="dialog" aria-modal="true" aria-label="Treino guiado">'+markup+'</div>';
  displayGuideClock();
  if(g.restUntil){displayRestClock();if(g.restUntil>Date.now()&&!state.restInterval)state.restInterval=setInterval(displayRestClock,400)}
  if(g.playing&&!state.guideInterval)state.guideInterval=setInterval(displayGuideClock,250);
 }
 function playGuide(){
  const g=state.guided;if(!g)return;
  if(g.playing){pauseGuide();renderGuide();}
  else{g.playing=true;g.startAt=Date.now();renderGuide();}
 }
 function stepGuide(delta){
  const g=state.guided;if(!g)return;pauseGuide();stopRestTicker();g.restUntil=0;g.totalMs+=g.accumulated;
  g.idx=Math.max(0,Math.min(g.plan.steps.length-1,g.idx+delta));g.accumulated=0;renderGuide();
 }
 function exitGuide(){pauseGuide();stopRestTicker();state.guided=null;closeModal()}
 function completeGuide(){
  const g=state.guided;if(!g||state.starting)return;
  state.starting=true;
  try {
   pauseGuide();
   const activityMs=g.totalMs+g.accumulated;
   if(activityMs<30000){toast("Inicie o cronômetro e realize pelo menos 30 segundos de atividade antes de concluir.");return}
   const realMinutes=Math.round(activityMs/6000)/10;
   data.workouts.push({id:id(),date:today(),title:g.plan.title,minutes:realMinutes});
   save();exitGuide();render();toast("Missão concluída! Seu treino foi registrado. 💚");
  }finally{state.starting=false}
 }
 // Replace views, preserve existing save / photo / training infrastructure.
 nav=customNav;
 home=customHome;
 evolution=customEvolution;
 modalTraining=showGuide;
 document.addEventListener("click",e=>{
  const b=e.target.closest("[data-action]");if(!b)return;
  switch(b.dataset.action){
   case "efm-start":e.preventDefault();showGuide(PLANS.find(p=>p.id===b.dataset.plan)||PLANS[0]);break;
   case "efm-play":e.preventDefault();playGuide();break;
   case "efm-rest":e.preventDefault();startGuideRest();break;
   case "efm-prev":e.preventDefault();stepGuide(-1);break;
   case "efm-next":e.preventDefault();stepGuide(1);break;
   case "efm-complete":e.preventDefault();completeGuide();break;
   case "efm-exit":e.preventDefault();exitGuide();break;
   case "efm-tab":e.preventDefault();state.tab=b.dataset.tab==="awards"?"awards":"progress";render();break;
  }
 });
 window.addEventListener("hashchange",()=>{
  if(state.guided){exitGuide();}
  if(state.photos.length){state.photos.forEach(u=>URL.revokeObjectURL(u));state.photos=[]}
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.guided)exitGuide()});
 window.EvoluMission={version:"0.4",getStatus:()=>({guided:Boolean(state.guided),tab:state.tab})};
 document.documentElement.classList.add("efm-ready");
 render();
})();