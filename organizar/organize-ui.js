/* EvoluFit · organização interna para aprovação
   Prévia isolada: usa o mesmo motor de registros, formulários, exercícios e fotos.
   Não modifica a versão principal nem inventa atividades concluídas. */
(() => {
 "use strict";
 const icon=(name,size=25)=>uiIcon(name,size);
 const a=(name,label,cls="btn",props="")=>action(name,label,cls,props);
 const head=(title,desc,iconName)=>'<div class="eforg-heading"><span class="eforg-heading-icon">'+icon(iconName,28)+'</span><div><h1>'+title+'</h1><p>'+desc+'</p></div></div>';
 const pane=(name,body,extra="")=>'<section class="eforg-panel '+extra+'">'+body+'</section>';
 const item=(key,txt,detail)=>'<div class="eforg-mini-row">'+icon(key,22)+'<div><strong>'+txt+'</strong><small>'+detail+'</small></div></div>';
 const activityDates=arr=>[...(arr||[])].sort((x,y)=>String(y.date).localeCompare(String(x.date)));
 const planPicture=plan=>{
  const match={inicio:"cadeira",corpo:"agachamento",mob:"alongamento",energia:"agachamento"};
  return exerciseImage(match[plan.id]||"marcha");
 };
 const intro=(label,sub)=>'<div class="eforg-section-title"><div><h2>'+label+'</h2>'+(sub?'<p>'+sub+'</p>':'')+'</div></div>';
 const summaryDetails=(title,desc,content,iconName)=>'<details class="eforg-fold">'+
 '<summary><span class="eforg-fold-ico">'+icon(iconName||"meta",23)+'</span><span class="eforg-fold-text"><b>'+title+'</b><small>'+desc+'</small></span>'+
 '<span class="eforg-fold-arrow" aria-hidden="true">⌄</span></summary>'+
 '<div class="eforg-fold-inside">'+content+'</div></details>';
 const hint=(body)=>'<p class="eforg-hint">'+body+'</p>';
 function organizedTraining(){
  const featured=window.EvoluWorkouts?.getRecommended?.()||PLANS[0];
  const cards=PLANS.map((p,idx)=>{
   const image=planPicture(p);
   return '<article class="eforg-plan">'+
     (image?'<img src="'+image+'" alt="Demonstração do treino '+es(p.title)+'" loading="lazy">':'<div class="eforg-photo-placeholder">'+icon("treinos",32)+'</div>')+
     '<div class="eforg-plan-body"><div class="eforg-plan-meta"><span>'+es(p.level)+'</span><span>'+p.time+' min</span></div>'+
     '<h3>'+es(p.title)+'</h3><p>'+es(p.desc)+'</p>'+
     '<button class="btn eforg-plan-btn" data-action="open-training" data-plan="'+es(p.id)+'">Ver e iniciar treino ›</button></div></article>';
  }).join("");
  const recent=activityDates(data.workouts).slice(0,8);
  const history=recent.map(t=>item("check",es(t.title),es(t.date)+" · "+Number(t.minutes||0).toLocaleString("pt-BR")+" min")).join("")||'<p class="eforg-empty">Nenhum treino registrado ainda.</p>';
  return '<div class="eforg-page">'+head("Treinos","Escolha uma missão de acordo com seu ritmo.","treinos")+
   '<div class="eforg-feature">'+
   '<div class="eforg-feature-left"><span class="eforg-kicker">MISSÃO RECOMENDADA PARA COMEÇAR</span><h2>'+es(featured.title)+'</h2>'+
   '<p>'+es(featured.desc)+'</p><div class="eforg-feature-chips"><span>'+featured.time+' minutos</span><span>'+featured.steps.length+' exercícios</span><span>'+featured.level+'</span></div>'+
   '<button class="btn eforg-primary" data-action="efm-start" data-plan="'+featured.id+'">▶ Começar missão</button></div>'+
   '<img src="'+planPicture(featured)+'" alt="Exemplo de exercício para iniciantes"></div>'+
   intro("Escolha seu treino","Nove programas em casa: iniciante, intermediário e avançado.")+
   '<div class="eforg-plan-grid">'+cards+'</div>'+
   summaryDetails("Treinos concluídos","Veja suas últimas atividades",history,"evolucao")+
   hint("Imagens geradas para demonstração. Respeite seus limites; interrompa se houver dor ou tontura.")+'</div>';
 }
 function organizedWalks(){
  const rows=activityDates(data.walks);
  const minutes=sameWeek(data.walks).reduce((s,w)=>s+(Number(w.minutes)||0),0);
  const count=sameWeek(data.walks).length;
  const history=rows.slice(0,30).map(w=>'<div class="eforg-history-item">'+icon("caminhadas",24)+
   '<div><strong>'+Number(w.minutes)+' min'+(w.distance?' · '+fmt(w.distance)+' km':'')+'</strong>'+
   '<small>'+es(w.date)+' · Ritmo '+es(w.pace||"não informado")+'</small></div>'+
   a("remove-walk","Excluir","btn secondary small",'data-id="'+es(w.id)+'"')+'</div>').join("")||'<p class="eforg-empty">Você ainda não registrou caminhadas.</p>';
  const form='<form data-form="walk" class="formgrid eforg-form">'+
   '<div class="field"><label>Data</label><input name="date" type="date" max="'+today()+'" value="'+today()+'" required></div>'+
   '<div class="field"><label>Tempo (minutos)</label><input name="minutes" type="number" min="1" max="1440" placeholder="Ex.: 20" required></div>'+
   '<div class="field"><label>Distância (km) · opcional</label><input name="distance" type="number" min="0" max="100" step="0.01" placeholder="Ex.: 1,5"></div>'+
   '<div class="field"><label>Como foi?</label><select name="pace"><option>Leve</option><option>Moderado</option><option>Intenso</option></select></div>'+
   '<div class="field full"><button class="btn eforg-primary" type="submit">✓ Salvar caminhada</button></div></form>';
  return '<div class="eforg-page">'+head("Caminhadas","Registre sua atividade e acompanhe seu tempo.","caminhadas")+
   '<div class="eforg-two-column">'+pane("register",intro("Registrar caminhada","Informe os dados da sua atividade.")+form)+
   pane("week",intro("Nesta semana","Últimos sete dias.")+
   '<div class="eforg-big-value">'+minutes+'<small> minutos registrados</small></div>'+
   item("check",count+' caminhada(s)',"registrada(s) nos últimos sete dias")+
   hint("Tempo e distância informados por você; não existe rastreamento por GPS nesta versão."))+'</div>'+
   summaryDetails("Histórico de caminhadas",rows.length+' registro(s)',history,"calendar")+'</div>';
 }
 function organizedFood(){
  const done=new Set(data.mealDone[today()]||[]);
  const meals=[...(data.meals||[])].sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  const water=Number(data.water[today()]||0);
  const mealRows=meals.map(m=>'<div class="eforg-meal-row"><div class="eforg-meal-ico">'+icon("alimentacao",25)+'</div>'+
   '<div class="eforg-meal-body"><strong>'+es(m.name)+'</strong><small>'+es(m.time)+'</small></div>'+
   '<label class="eforg-checkbox"><input type="checkbox" data-action="meal-check" data-id="'+es(m.id)+'" '+(done.has(m.id)?"checked":"")+'> <span>Feita</span></label>'+
   '<button class="eforg-minimal-btn" type="button" data-action="remove-meal" data-id="'+es(m.id)+'" aria-label="Remover horário '+es(m.name)+'">×</button></div>').join("")||
   '<p class="eforg-empty">Adicione horários para organizar seu dia.</p>';
  const form='<form class="formgrid eforg-form" data-form="meal">'+
    '<div class="field"><label>Refeição</label><input name="name" maxlength="45" placeholder="Ex.: Lanche da tarde" required></div>'+
    '<div class="field"><label>Horário</label><input name="time" type="time" required></div>'+
    '<div class="field full"><button class="btn" type="submit">Adicionar à rotina</button></div></form>';
  return '<div class="eforg-page">'+head("Alimentação","Seus horários, sem dietas ou números desnecessários.","alimentacao")+
   '<div class="eforg-two-column"><section class="eforg-panel">'+intro("Refeições de hoje",done.size+' de '+meals.length+' marcadas')+
   '<div class="eforg-meal-list">'+mealRows+'</div>'+
   summaryDetails("Adicionar horário","Personalize sua rotina",form,"calendar")+'</section>'+
   '<section class="eforg-panel">'+intro("Água e lembretes","Registre hábitos com simplicidade")+
   '<div class="eforg-big-value">'+Math.max(0,water)+'<small> copo(s) registrados hoje</small></div>'+
   '<div class="eforg-water-controls">'+a("water-remove","− Retirar","btn secondary")+
   a("water-add","+ Registrar copo","btn")+'</div>'+
   '<a href="#notificacoes" class="eforg-text-link">'+icon("notificacoes",22)+' Configurar lembretes ›</a>'+
   hint("A quantidade em mL por copo não é medida. Os lembretes funcionam apenas com a página aberta.")+'</section></div></div>';
 }
 function organizedPhotos(){
  return '<div class="eforg-page">'+head("Fotos de evolução","Sua galeria privada para acompanhar mudanças.","fotos")+
   '<div class="eforg-photo-intro">'+
   '<div>'+intro("Sua jornada em imagens","Organizada por data, sem comparações com outras pessoas.")+
   '<p>Adicione fotos quando quiser e acompanhe sua evolução no seu ritmo.</p>'+
   a("add-photo","＋ Adicionar foto","btn eforg-primary")+'</div>'+
   '<span class="eforg-photo-icon">'+icon("fotos",75)+'</span></div>'+
   '<section class="eforg-panel">'+intro("Minha galeria","Seus registros aparecem aqui.")+
   '<div id="photo-list">'+empty("Carregando fotos","Suas fotos serão exibidas aqui.","📷")+'</div></section>'+
   hint(window.EvoluCloud?.active?"As fotos são privadas na sua conta Supabase. Não compartilhe sua senha.":"Nesta prévia, fotos ficam somente neste navegador; não são enviadas ao GitHub.")+'</div>';
 }
 function organizedTimer(){
  const wall=new Date().toLocaleTimeString("pt-BR",{hour12:false});
  const count=chronoMode==="desc"?"Temporizador":"Cronômetro";
  return '<div class="eforg-page">'+head("Relógio e cronômetro","Acompanhe o tempo de exercícios e descansos.","cronometro")+
   '<div class="eforg-timer-area">'+
   '<section class="eforg-panel eforg-clock-panel">'+
    '<div class="eforg-wallclock">'+icon("clock",22)+' Hora atual <strong id="wall-clock">'+wall+'</strong></div>'+
    '<span class="eforg-timer-type">'+count+'</span>'+
    '<div id="clock" class="clock eforg-clock">00:00:00</div>'+
    '<div class="eforg-clock-buttons">'+a("timer-toggle",running?"⏸ Pausar":"▶ Iniciar","btn")+
    a("timer-reset","↺ Zerar","btn secondary")+'</div>'+
    '<button class="eforg-mode-btn" type="button" data-action="timer-mode">⇄ Usar '+(chronoMode==="desc"?"cronômetro":"temporizador")+'</button>'+
   '</section>'+
   '<section class="eforg-panel eforg-timer-options">'+intro("Intervalos rápidos","Toque para definir um tempo.")+
    '<div class="eforg-quicktimes">'+[30,60,120,300,600].map(s=>a("timer-preset",s<60?s+" s":s/60+" min","btn secondary small",'data-seconds="'+s+'"')).join("")+'</div>'+
    hint("A contagem funciona enquanto o aplicativo estiver ativo; o celular pode suspender a execução em segundo plano.")+
   '</section></div></div>';
 }
 function organizedSettings(){
  const profileForm='<form class="formgrid eforg-form" data-form="profile">'+
   '<div class="field full"><label>Nome ou apelido</label><input name="name" maxlength="60" autocomplete="nickname" value="'+es(data.profile.name)+'"></div>'+
   '<div class="field"><label>Altura (cm) · opcional</label><input name="height" type="number" min="80" max="240" value="'+es(data.profile.height)+'"></div>'+
   '<div class="field"><label>Meta de peso (kg) · opcional</label><input name="goal" type="number" min="10" max="500" step="0.1" value="'+es(data.profile.goal)+'"></div>'+
   '<div class="field full"><button type="submit" class="btn eforg-primary">Salvar meu perfil</button></div></form>';
  const privacy='<p>Seus registros ficam salvos neste navegador nesta prévia isolada. O site principal não é alterado.</p>'+
    '<div class="eforg-secondary-actions">'+a("export","Exportar registros","btn secondary")+
    a("clear","Apagar dados desta prévia","btn danger")+'</div>'+
    hint("Exportar registros gera um JSON sem fotos. Apagar dados desta prévia não altera os dados do site principal.");
  return '<div class="eforg-page">'+head("Meu perfil","Seus dados e preferências em um só lugar.","ajustes")+
   pane("profile",intro("Informações pessoais","Preencha somente o que quiser.")+profileForm)+
   '<div class="eforg-setting-links">'+
    '<a href="#notificacoes" class="eforg-setting-link">'+icon("notificacoes",25)+'<span><strong>Notificações</strong><small>Organizar horários e avisos</small></span>›</a>'+
    '<a href="#evolucao" class="eforg-setting-link">'+icon("evolucao",25)+'<span><strong>Minha evolução</strong><small>Peso, histórico e conquistas</small></span>›</a>'+
    '<a href="#fotos" class="eforg-setting-link">'+icon("fotos",25)+'<span><strong>Fotos privadas</strong><small>Visualizar minha galeria</small></span>›</a>'+
   '</div>'+summaryDetails("Privacidade e dados","Exportar ou apagar informações",privacy,"ajustes")+'</div>';
 }
 function organizedNotifications(){
  const status=typeof Notification!=="undefined"?Notification.permission:"unsupported";
  const active=Boolean(data.notifications&&status==="granted");
  const rows=[...(data.meals||[])].sort((a,b)=>String(a.time).localeCompare(String(b.time)))
   .map(m=>item("clock",es(m.name),es(m.time))).join("")||'<p class="eforg-empty">Nenhum horário cadastrado.</p>';
  return '<div class="eforg-page">'+head("Lembretes","Tudo que precisa lembrar, em uma tela.","notificacoes")+
   '<div class="eforg-two-column">'+pane("notify",intro("Avisos do aplicativo",active?"Ativados":"Desativados")+
    '<p>Receba lembretes das suas refeições nos horários programados.</p>'+
    a("notify-toggle",active?"Desativar lembretes":"Ativar lembretes",active?"btn secondary":"btn eforg-primary")+
    hint(status==="denied"?"O navegador bloqueou as notificações. Altere a permissão nas configurações do site.":
    "Por enquanto, notificações só aparecem com o EvoluFit aberto."))+
   pane("hours",intro("Horários de hoje","Edite as refeições para mudar os horários.")+
    rows+'<a class="eforg-text-link" href="#alimentacao">Editar horários ›</a>')+'</div></div>';
 }
 const oldEvolution=evolution;
 function organizedEvolution(){
  let html=oldEvolution();
  const marker='<section class="efm-card efm-card-padding"><h2>Registrar meu peso</h2>';
  const idx=html.lastIndexOf(marker);
  const end=html.lastIndexOf("</section></div>");
  if(idx>=0&&end>idx){
   html=html.slice(0,idx)+
    '<details class="eforg-fold eforg-evolution-add"><summary><span class="eforg-fold-ico">'+icon("peso",23)+'</span>'+
    '<span class="eforg-fold-text"><b>Registrar novo peso</b><small>Abre o formulário de registro</small></span>'+
    '<span class="eforg-fold-arrow">⌄</span></summary><div class="eforg-fold-inside">'+
    html.slice(idx,end)+"</section></div></details></div>"+html.slice(end+"</section></div>".length);
  }
  return html.replace('class="efm-evolution"','class="efm-evolution eforg-evolution"');
 }
 trainings=organizedTraining;
 walks=organizedWalks;
 food=organizedFood;
 photos=organizedPhotos;
 timer=organizedTimer;
 settings=organizedSettings;
 notificationsPage=organizedNotifications;
 evolution=organizedEvolution;
 document.documentElement.classList.add("eforg-enabled");
 render();
})();