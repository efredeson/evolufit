/* EvoluFit Premium · 2026
   Componentes reais inspirados nas telas aprovadas. Nunca inventa peso,
   passos, calorias ou conquistas: tudo vem dos registros já existentes. */
(() => {
 'use strict';
 const P={level:window.EvoluWorkouts?.getPreferredLevel?.()||'Iniciante',goal:'all',photoUrls:[]};
 const ROOT=location.pathname.includes('/beta/')?'../':'';
 const img=(name)=>ROOT+'assets/'+name;
 const workoutImage={inicio:'agachamento-capa-premium',cardioleve:'marcha',mob:'alongamento',corpo:'agachamento',energia:'marcha',estabilidade:'prancha','forca-avancada':'agachamento','cardio-avancado':'marcha','controle-avancado':'prancha'};
 const ico=(name,n=23)=>uiIcon(name,n);
 const clean=t=>es(t);
 const count=(n)=>Number(n||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
 const shortDate=d=>{try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(d+'T12:00:00'))}catch{return clean(d)}};
 const greeting=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'};
 const firstName=()=>clean(String(data.profile?.name||'').trim().split(' ')[0]||'');
 const todayWorkouts=()=>data.workouts.filter(x=>x.date===today());
 const todayWalks=()=>data.walks.filter(x=>x.date===today());
 const todayMeals=()=>data.mealDone[today()]||[];
 const waterCount=()=>Math.max(0,Number(data.water[today()]||0));
 const weekStart=()=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()-6);return d};
 const thisWeek=items=>items.filter(x=>{const d=new Date(x.date+'T12:00:00');return d>=weekStart()&&d<=new Date(today()+'T23:59:59')});
 const weekDays=()=>new Set([...thisWeek(data.workouts),...thisWeek(data.walks)].map(x=>x.date)).size;
 const dailyHabits=()=>[todayWorkouts().length>0,todayWalks().length>0,todayMeals().length>0,waterCount()>0];
 const round=(n)=>Math.max(0,Math.min(100,Math.round(n)));
 const ring=(pct,sub)=>'<div class="efp-ring" style="--progress:'+round(pct)+'%"><div><strong>'+round(pct)+'%</strong><small>'+clean(sub)+'</small></div></div>';
 const primary=(action,label,extra='')=>'<button type="button" class="efp-primary" data-action="'+action+'" '+extra+'>'+label+'</button>';
 const secLink=(url,label)=>'<a class="efp-more" href="'+url+'">'+label+' ›</a>';
 const heading=(name,desc,symbol)=>'<div class="efp-page-heading"><span class="efp-heading-symbol">'+ico(symbol||'meta',31)+'</span><div><h1>'+name+'</h1><p>'+desc+'</p></div></div>';
 const sectionTitle=(name,action='')=>'<div class="efp-section-title"><h2>'+name+'</h2>'+action+'</div>';
 const emptyUI=(name,description)=>'<div class="efp-empty"><span>'+ico('meta',30)+'</span><strong>'+name+'</strong><small>'+description+'</small></div>';
 const link=(name,label,sub)=>'<a href="#'+name+'" class="efp-shortcut"><span class="efp-shortcut-icon">'+ico(name,30)+'</span><span class="efp-shortcut-label"><strong>'+label+'</strong><small>'+sub+'</small></span><span class="efp-shortcut-arrow">›</span></a>';
 const photo=(name,alt)=>'<img src="'+img('exercicios/'+name+'-foto.webp')+'" loading="lazy" alt="'+clean(alt)+'">';
 function premiumNav(){
  const sections=[['inicio','Início'],['treinos','Treinos'],['caminhadas','Caminhadas'],['alimentacao','Alimentação'],['cronometro','Cronômetro'],['evolucao','Evolução'],['fotos','Fotos'],['ajustes','Perfil'],['notificacoes','Notificações']];
  $('#sidebar').innerHTML='<a class="efp-side-logo" href="#inicio"><span class="efp-logo-icon">'+ico('treinos',26)+'</span><span>Evolu<b>Fit</b></span></a><p class="efp-side-caption">SEU ESPAÇO FITNESS</p><nav class="efp-side-links">'+sections.map(([k,l],i)=>'<a href="#'+k+'" class="'+(view===k?'active':'')+'">'+ico(k,22)+'<span>'+l+'</span></a>').join('')+'</nav><div class="sidebarfoot efp-side-footer"><span class="efp-status-dot"></span> EvoluFit · Seu ritmo, sua evolução</div>';
  $('#topbar').innerHTML='<div class="efp-top-left"><button type="button" class="menu-trigger" data-action="toggle-menu" aria-label="Abrir menu" aria-expanded="false">'+ico('menu',25)+'</button><a class="efp-top-logo" href="#inicio"><span class="efp-logo-icon">'+ico('treinos',24)+'</span>Evolu<b>Fit</b></a></div><div class="top-actions"><a class="efp-bell" href="#notificacoes" aria-label="Notificações">'+ico('notificacoes',23)+'</a><a class="efp-avatar" href="#ajustes" aria-label="Meu perfil">'+clean((data.profile?.name||'E').charAt(0).toUpperCase())+'</a></div>';
  const tabs=[['inicio','Início'],['treinos','Treinos'],['evolucao','Evolução'],['fotos','Fotos'],['ajustes','Perfil']];
  $('#bottomnav').innerHTML=tabs.map(([k,l])=>'<a href="#'+k+'" class="'+(view===k?'active':'')+'" aria-label="'+l+'" '+(view===k?'aria-current="page"':'')+'><b>'+ico(k,24)+'</b><span>'+l+'</span></a>').join('');
  window.EvoluCloud?.decorateNav();
 }
 function premiumHome(){
  const habits=dailyHabits(),complete=habits.filter(Boolean).length,pct=complete*25;
  const plan=window.EvoluWorkouts?.getRecommended?.()||PLANS[0],water=waterCount(),done=todayMeals().length,walks=todayWalks(),walkDistance=walks.reduce((s,w)=>s+Number(w.distance||0),0);
  const displayGreeting=greeting()+(firstName()?', '+firstName():'');
  const legacy=location.hostname==='efredeson.github.io'?
   '<aside class="efp-old-domain" role="note"><span>Você está no endereço antigo. Os dados locais ficam separados entre domínios.</span><a href="https://evolufit-lake.vercel.app/" target="_blank" rel="noopener noreferrer">Abrir na Vercel ›</a></aside>':'';
  return '<div class="efp-home">'+legacy+
  '<div class="efp-greeting"><div><h1>'+displayGreeting+'<span class="efp-green-dot">.</span></h1><p>Disciplina hoje, resultados amanhã.</p></div></div>'+ 
  '<section class="efp-surface efp-home-hero"><div class="efp-hero-copy"><span class="efp-overline">RESUMO DO SEU DIA</span><h2>'+(complete?'Continue sua evolução.':'Um passo de cada vez.')+'</h2><p>'+(complete?'Você já concluiu '+complete+' de 4 hábitos hoje.':'Explore um treino de '+plan.time+' minutos no nível '+plan.level.toLowerCase()+'.')+'</p>'+primary('efm-start','▶ &nbsp; Começar treino','data-plan="'+plan.id+'"')+'</div><div class="efp-hero-stats">'+ring(pct,'da rotina')+'<strong>'+complete+' de 4 hábitos</strong><span>concluídos hoje</span><div class="efp-hero-week">'+ico('meta',19)+' '+weekDays()+' de 7 dias ativos na semana</div></div></section>'+ 
  '<div class="efp-shortcuts">'+link('treinos','Treinos','Planos e exercícios')+link('caminhadas','Caminhadas','Registro e metas')+link('alimentacao','Alimentação','Refeições e água')+link('cronometro','Cronômetro','Seu tempo de treino')+'</div>'+
  sectionTitle('Treino recomendado',secLink('#treinos','Ver planos'))+
  '<section class="efp-surface efp-feature-plan"><div class="efp-feature-image"><img src="'+img('exercicios/'+(workoutImage[plan.id]||'agachamento')+(workoutImage[plan.id]==='agachamento-capa-premium'?'.webp':'-foto.webp'))+'" loading="lazy" alt="Imagem demonstrativa do treino em casa"></div><div class="efp-feature-copy"><span class="efp-tag">SEU NÍVEL · '+clean(plan.level.toUpperCase())+'</span><h3>'+clean(plan.title)+'</h3><p>'+clean(plan.desc)+'</p><div class="efp-feature-chips"><span>'+ico('clock',17)+' '+plan.time+' min</span><span>'+ico('treinos',17)+' '+plan.steps.length+' exercícios</span><span>'+clean(plan.level)+'</span></div>'+primary('efm-start','▶ &nbsp; Iniciar treino','data-plan="'+plan.id+'"')+'</div></section>'+
  sectionTitle('Resumo do dia',secLink('#evolucao','Ver detalhes'))+
  '<div class="efp-stats-grid">'+[
    ['agua','Água',water+' copo(s)','registrados',water?Math.min(100,water/8*100):0],
    ['alimentacao','Refeições',done+'/'+data.meals.length,'concluídas',data.meals.length?done/data.meals.length*100:0],
    ['caminhadas','Caminhada',walkDistance?count(walkDistance)+' km':walks.length+' registro(s)','hoje',walks.length?100:0],
    ['meta','Semana',weekDays()+'/7','dias ativos',weekDays()/7*100]
  ].map(([icon,label,num,unit,progress])=>'<a href="#'+(label==='Água'?'alimentacao':label==='Semana'?'evolucao':label==='Refeições'?'alimentacao':'caminhadas')+'" class="efp-surface efp-stat"><span class="efp-stat-symbol">'+ico(icon,23)+'</span><span>'+label+'</span><strong>'+num+'</strong><small>'+unit+'</small><i class="efp-mini-progress"><i style="width:'+round(progress)+'%"></i></i></a>').join('')+'</div></div>';
 }
 function premiumTrainings(){
  const workout=window.EvoluWorkouts;
  const levels=workout?.LEVELS||['Iniciante','Intermediário','Avançado'];
  const level=levels.includes(P.level)?P.level:'Iniciante';
  const levelPlans=PLANS.filter(p=>p.level===level);
  const plans=levelPlans.filter(p=>P.goal==='all'||p.goal===P.goal);
  const recommended=plans[0]||levelPlans[0]||PLANS[0];
  const history=[...data.workouts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const descriptions={
   Iniciante:'Para quem está começando ou retomando: técnica, confiança, sem saltos e pausas maiores.',
   Intermediário:'Para quem já executa movimentos com controle: mais séries, força e resistência.',
   'Avançado':'Para quem domina a técnica e tolera maior volume: desafios sem precisar de academia.'
  };
  const highlights={Iniciante:['2–3 dias de força','15–25 min por sessão','Descanso de 45–75 s'],Intermediário:['3 dias de força/semana','25–35 min por sessão','Descanso de 60–90 s'],'Avançado':['3–4 sessões/semana','30–45 min por sessão','Descanso de 60–90 s']};
  const toCard=(plan)=>{
   const kind=workoutImage[plan.id]||'agachamento';
   const imagePath=kind==='agachamento-capa-premium'?img('exercicios/'+kind+'.webp'):img('exercicios/'+kind+'-foto.webp');
   const drillList=(plan.drills||[]).map((d,i)=>'<li><div class="efp-drill-line"><b>'+clean(d.name)+'</b><span>'+clean(d.work)+'</span></div><p>'+clean(d.technique)+'</p><small><b>Mais fácil:</b> '+clean(d.easier)+'</small><small><b>Para progredir:</b> '+clean(d.harder)+'</small></li>').join('');
   return '<article class="efp-surface efp-train-program"><div class="efp-train-header"><img src="'+imagePath+'" loading="lazy" alt="Ilustração de exercício para '+clean(plan.title)+'"><div class="efp-train-summary"><span class="efp-training-label">'+clean(plan.level)+' · '+clean(workout.GOALS[plan.goal]||'Treino em casa')+'</span><h3>'+clean(plan.title)+'</h3><p>'+clean(plan.desc)+'</p><div class="efp-training-chips"><span>'+ico('clock',16)+' '+plan.time+' min</span><span>'+ico('treinos',16)+' '+plan.steps.length+' exercícios</span><span>'+ico('calendar',16)+' '+clean(plan.days)+'</span></div></div></div><div class="efp-train-controls">'+primary('efm-start','▶ Iniciar treino','data-plan="'+plan.id+'"')+'<details class="efp-plan-details"><summary>Ver exercícios e adaptações</summary><div class="efp-plan-body"><p><strong>Intensidade:</strong> '+clean(plan.intensity)+'</p><p><strong>Em casa:</strong> '+clean(plan.equipment)+'</p><p><strong>Organização semanal:</strong> '+clean(plan.weekly)+'</p><ol>'+drillList+'</ol><p class="efp-plan-progress"><strong>Como evoluir:</strong> '+clean(plan.progress)+'</p></div></details></div></article>';
  };
  const sourceLinks=workout.sources.map(item=>'<a href="'+item.url+'" target="_blank" rel="noopener noreferrer">'+clean(item.name)+' ↗</a>').join('');
  return '<div class="efp-page efp-training-page">'+heading('Treinos em casa','Escolha seu nível, respeite os descansos e acompanhe sua evolução.','treinos')+
   '<section class="efp-levels" aria-label="Nível do treino"><h2>Seu nível de treino</h2><div class="efp-level-selector" role="group" aria-label="Selecionar nível">'+levels.map(l=>'<button type="button" data-action="efp-workout-level" data-level="'+l+'" aria-pressed="'+(level===l)+'" class="'+(level===l?'active':'')+'">'+l+'</button>').join('')+'</div><p>'+clean(descriptions[level])+'</p><div class="efp-level-highlights">'+highlights[level].map(x=>'<span>'+ico('check',15)+' '+x+'</span>').join('')+'</div></section>'+
   '<section class="efp-surface efp-workout-method"><div><h3>Um programa que cabe na sua casa</h3><p>Sem máquinas, sem suplementos e sem necessidade de saltar. Uma cadeira firme, uma parede e espaço livre já ajudam nos movimentos propostos.</p></div><div><label for="efp-goal">O que você quer trabalhar?</label><select id="efp-goal"><option value="all" '+(P.goal==='all'?'selected':'')+'>Todos os objetivos</option>'+Object.entries(workout.GOALS).map(([g,name])=>'<option value="'+g+'" '+(P.goal===g?'selected':'')+'>'+clean(name)+'</option>').join('')+'</select></div></section>'+
   sectionTitle('Programas para '+level.toLowerCase(),'<span class="efp-text-muted">'+plans.length+' planos</span>')+
   '<div class="efp-programs">'+(plans.map(toCard).join('')||emptyUI('Sem planos neste filtro','Selecione outro objetivo para ver exercícios.'))+'</div>'+
   '<section class="efp-surface efp-training-advice"><h3>Como treinar com segurança</h3><p><strong>Aqueça:</strong> comece devagar por 3–5 minutos. <strong>Respire:</strong> evite prender o ar nas repetições. <strong>Descanse:</strong> respeite as pausas descritas em cada plano. <strong>Progrida:</strong> mude apenas uma variável de cada vez, com boa execução.</p><p>Os tempos e as séries são sugestões educativas para adultos, não uma avaliação individual. Se você tem alguma condição de saúde, está retornando após longo período sem exercício ou sente sintomas, procure orientação profissional antes de fazer treinos intensos. Interrompa se houver dor no peito, tontura, mal-estar ou falta de ar fora do esperado.</p><details><summary>Progressão sugerida para 4 semanas</summary><div class="efp-plan-body"><p><strong>Semana 1:</strong> conheça o plano e faça apenas o volume confortável.</p><p><strong>Semana 2:</strong> mantenha a rotina, aprimorando a técnica e respeitando os descansos.</p><p><strong>Semana 3:</strong> se os movimentos estiverem fáceis, acrescente 1–2 repetições OU 5–10 segundos em um exercício.</p><p><strong>Semana 4:</strong> reavalie a recuperação. Não precisa subir de nível se ainda houver dificuldade.</p></div></details><details><summary>Entenda a base científica e as recomendações</summary><p>A OMS recomenda atividade aeróbica regular e fortalecimento muscular pelo menos duas vezes na semana. O ACSM (2026) reconhece que treinos com o próprio peso do corpo em casa podem trazer benefícios. Para esforço aeróbico moderado, o CDC usa o teste da conversa: conseguir falar, mas não cantar.</p><div class="efp-research-links">'+sourceLinks+'</div></details></section>'+
   sectionTitle('Seus treinos realizados')+'<section class="efp-surface efp-history">'+(history.map(w=>'<div class="efp-history-row"><span class="efp-history-icon">'+ico('check',22)+'</span><div><strong>'+clean(w.title)+'</strong><small>'+shortDate(w.date)+' · '+count(w.minutes)+' min ativos</small></div></div>').join('')||emptyUI('Nenhum treino registrado','Conclua seu primeiro treino para criar seu histórico.'))+'</section></div>';
 }
 function premiumWalks(){
  const items=[...data.walks].sort((a,b)=>b.date.localeCompare(a.date));const week=thisWeek(items);const mins=week.reduce((s,w)=>s+Number(w.minutes||0),0);const distance=week.reduce((s,w)=>s+Number(w.distance||0),0);
  return '<div class="efp-page">'+heading('Caminhadas','Registre seus passos, tempo e trajetos.','caminhadas')+
  '<section class="efp-surface efp-walk-cover"><div class="efp-walk-img">'+photo('marcha','Atividade de caminhada leve')+'</div><div><span class="efp-overline">ATIVIDADE AO AR LIVRE</span><h2>Caminhe no seu ritmo</h2><p>Um registro de cada vez, no seu tempo.</p><button class="efp-primary" type="button" data-action="efp-walk-form">＋ &nbsp; Registrar caminhada</button></div></section>'+
  '<div class="efp-triple"><div class="efp-surface"><span>'+ico('caminhadas',23)+' Distância</span><strong>'+count(distance)+' km</strong><small>Últimos 7 dias</small></div><div class="efp-surface"><span>'+ico('clock',23)+' Tempo</span><strong>'+mins+' min</strong><small>Últimos 7 dias</small></div><div class="efp-surface"><span>'+ico('meta',23)+' Registros</span><strong>'+week.length+'</strong><small>Últimos 7 dias</small></div></div>'+
  '<section id="efp-walk-form" class="efp-surface efp-form-card"><h2>Registrar caminhada</h2><form data-form="walk" class="formgrid"><div class="field"><label>Data</label><input name="date" type="date" max="'+today()+'" value="'+today()+'" required></div><div class="field"><label>Tempo (minutos)</label><input name="minutes" type="number" min="1" max="1440" required placeholder="Ex.: 30"></div><div class="field"><label>Distância (km, opcional)</label><input name="distance" type="number" min="0" max="100" step="0.01" placeholder="Ex.: 2.5"></div><div class="field"><label>Ritmo percebido</label><select name="pace"><option>Leve</option><option>Moderado</option><option>Intenso</option></select></div><div class="field full"><button class="efp-primary" type="submit">Salvar caminhada</button></div></form><p class="efp-help">Os dados são informados manualmente. O EvoluFit Web ainda não registra GPS automaticamente.</p></section>'+
  sectionTitle('Histórico recente')+'<section class="efp-surface efp-history">'+(items.slice(0,30).map(w=>'<div class="efp-history-row"><span class="efp-history-icon">'+ico('caminhadas',23)+'</span><div><strong>'+((w.distance!==null&&w.distance!==undefined&&w.distance!=='')?count(w.distance)+' km':'Caminhada registrada')+'</strong><small>'+shortDate(w.date)+' · '+count(w.minutes)+' min · '+clean(w.pace||'Leve')+'</small></div><button type="button" class="efp-text-action" data-action="remove-walk" data-id="'+clean(w.id)+'" aria-label="Excluir caminhada">Excluir</button></div>').join('')||emptyUI('Nenhuma caminhada ainda','Registre sua primeira caminhada para acompanhar seu ritmo.'))+'</section></div>';
 }
 function premiumFood(){
  const done=todayMeals(),meals=[...data.meals].sort((a,b)=>a.time.localeCompare(b.time)),water=waterCount(),pct=meals.length?round(done.length/meals.length*100):0;
  const list=meals.map(m=>'<div class="efp-meal-row"><span class="efp-meal-ico">'+ico('alimentacao',25)+'</span><div class="efp-meal-text"><strong>'+clean(m.name)+'</strong><small>'+clean(m.time)+' · '+(done.includes(m.id)?'Concluída':'Pendente')+'</small></div><label class="efp-meal-check"><input type="checkbox" data-action="meal-check" data-id="'+clean(m.id)+'" '+(done.includes(m.id)?'checked':'')+' aria-label="Marcar '+clean(m.name)+' como concluída"><span>Feita</span></label><button class="efp-text-action" type="button" data-action="remove-meal" data-id="'+clean(m.id)+'" aria-label="Excluir horário">×</button></div>').join('');
  return '<div class="efp-page">'+heading('Alimentação','Planeje suas refeições e acompanhe sua rotina.','alimentacao')+
    '<div class="efp-date-strip">'+ico('calendar',21)+' Hoje, '+new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long'}).format(new Date())+'</div>'+
    '<section class="efp-surface efp-food-summary">'+ring(pct,'das refeições')+'<div><h2>Resumo do dia</h2><strong>'+done.length+' de '+meals.length+'</strong><p>refeições concluídas</p><div class="efp-progress-track"><i style="width:'+pct+'%"></i></div><small>O controle atual registra horários e refeições realizadas.</small></div></section>'+
    sectionTitle('Refeições do dia','<span class="efp-text-muted">'+done.length+'/'+meals.length+' feitas</span>')+
    '<section class="efp-surface efp-meals">'+(list||emptyUI('Sem refeições cadastradas','Adicione seus horários abaixo.'))+'</section>'+
    '<section class="efp-surface efp-form-card"><h2>Adicionar refeição</h2><form data-form="meal" class="formgrid"><div class="field"><label>Nome da refeição</label><input name="name" required maxlength="45" placeholder="Ex.: Café da manhã"></div><div class="field"><label>Horário</label><input name="time" type="time" required></div><div class="field full"><button class="efp-primary" type="submit">＋ &nbsp; Adicionar refeição</button></div></form></section>'+
    '<section class="efp-surface efp-water"><div class="efp-water-icon">'+ico('alimentacao',28)+'</div><div><h2>Água</h2><p>'+water+' copo(s) registrados hoje</p><div class="efp-progress-track"><i style="width:'+round(water/8*100)+'%"></i></div></div><div class="efp-water-buttons"><button data-action="water-remove" type="button" aria-label="Retirar um copo">−</button><button data-action="water-add" type="button" aria-label="Adicionar um copo">＋</button></div></section><p class="efp-help">Não calculamos calorias nem macronutrientes automaticamente: essas informações não existem nos seus registros atuais. Lembretes funcionam enquanto a página estiver aberta.</p></div>';
 }
 function sortedWeights(){return [...data.weights].filter(x=>Number.isFinite(Number(x.weight))&&Number(x.weight)>0).sort((a,b)=>a.date.localeCompare(b.date));}
 function weightChart(a){
  const pts=a.slice(-9);if(!pts.length)return emptyUI('Sem registros de peso','Adicione sua primeira medição para visualizar o gráfico.');
  if(pts.length===1)return '<div class="efp-chart-single">'+count(pts[0].weight)+' kg <small>em '+shortDate(pts[0].date)+'</small></div>';
  const W=600,H=240,L=28,R=20,T=26,B=33,values=pts.map(x=>Number(x.weight)),min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min),graph=values.map((v,i)=>[L+i*(W-L-R)/(values.length-1),H-B-(v-min)/range*(H-T-B)]);
  const path=graph.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' '),area=path+' L'+graph.at(-1)[0]+','+(H-B)+' L'+L+','+(H-B)+' Z';
  return '<svg class="efp-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico real de peso com '+pts.length+' registros"><defs><linearGradient id="efp-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8bd94e" stop-opacity=".25"/><stop offset="1" stop-color="#8bd94e" stop-opacity=".01"/></linearGradient></defs><path d="M'+L+' '+(H-B)+'H'+(W-R)+' M'+L+' '+Math.round((H-B+T)/2)+'H'+(W-R)+'" stroke="#353a35" fill="none"/><path d="'+area+'" fill="url(#efp-chart-fill)"/><path d="'+path+'" fill="none" stroke="#94df50" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'+graph.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#9ee662" stroke="#18220f" stroke-width="2"/>').join('')+'<text x="'+L+'" y="'+(H-7)+'" fill="#a0a7a0" font-size="15">'+shortDate(pts[0].date)+'</text><text x="'+(W-R)+'" y="'+(H-7)+'" text-anchor="end" fill="#a0a7a0" font-size="15">'+shortDate(pts.at(-1).date)+'</text></svg>';
 }
 async function fillCompare(){const el=$('#efp-compare');if(!el)return;P.photoUrls.forEach(u=>URL.revokeObjectURL(u));P.photoUrls=[];try{const a=(await photoOp('get')).slice().sort((x,y)=>x.date.localeCompare(y.date));if(!$('#efp-compare')||a.length<2)return;el.innerHTML=[a[0],a.at(-1)].map((p,i)=>{const u=URL.createObjectURL(p.blob);P.photoUrls.push(u);return '<div class="efp-compare-photo"><img src="'+u+'" alt="Registro de evolução '+clean(p.date)+'"><small>'+(i?'Mais recente':'Primeiro registro')+' · '+shortDate(p.date)+'</small></div>'}).join('')}catch(e){/* sem armazenamento disponível */}}
 function premiumEvolution(){
  const a=sortedWeights(),first=a[0],last=a.at(-1),target=Number(data.profile?.goal)||null,delta=a.length>1?Number(last.weight)-Number(first.weight):null;
  const pct=target&&first&&last&&Number(first.weight)!==target?round((Number(last.weight)-Number(first.weight))/(target-Number(first.weight))*100):null;
  const stat1=(label,num,extra)=>'<div><span>'+label+'</span><strong>'+num+'</strong><small>'+extra+'</small></div>';
  setTimeout(fillCompare,10);
  return '<div class="efp-page">'+heading('Minha evolução','Acompanhe seu progresso e seus resultados reais.','evolucao')+
  '<section class="efp-surface efp-evolution-summary">'+stat1('Peso atual',last?count(last.weight)+' kg':'—','Último registro')+stat1('Meta pessoal',target?count(target)+' kg':'—','Opcional')+stat1('Variação',delta===null?'—':(delta>0?'+':'')+count(delta)+' kg',a.length>1?'Desde o início':'Sem comparação')+(pct!==null?'<div class="efp-evolution-progress"><div class="efp-progress-track"><i style="width:'+pct+'%"></i></div><small>'+pct+'% do caminho entre o primeiro peso e a meta</small></div>':'')+'</section>'+
  '<section class="efp-surface efp-evolution-chart">'+sectionTitle('Progresso do peso')+weightChart(a)+'</section>'+
  '<section class="efp-surface efp-form-card">'+sectionTitle('Registrar peso')+'<form data-form="weight" class="formgrid"><div class="field"><label>Peso em kg</label><input name="weight" type="number" min="10" max="500" step="0.1" required></div><div class="field"><label>Data</label><input name="date" type="date" max="'+today()+'" value="'+today()+'" required></div><div class="field full"><button type="submit" class="efp-primary">＋ &nbsp; Salvar medição</button></div></form></section>'+
  sectionTitle('Fotos de progresso',secLink('#fotos','Ver galeria'))+'<section class="efp-surface efp-comparison"><div id="efp-compare" class="efp-compare"><div class="efp-compare-empty">'+ico('fotos',29)+'<small>Primeira foto</small></div><div class="efp-compare-empty">'+ico('fotos',29)+'<small>Foto mais recente</small></div></div><a class="efp-secondary" href="#fotos">＋ &nbsp; Adicionar registro</a></section>'+
  sectionTitle('Histórico de peso')+'<section class="efp-surface efp-history">'+(a.slice().reverse().map(w=>'<div class="efp-history-row"><span class="efp-history-icon">'+ico('peso',20)+'</span><div><strong>'+count(w.weight)+' kg</strong><small>'+shortDate(w.date)+'</small></div><button class="efp-text-action" type="button" data-action="remove-weight" data-id="'+clean(w.id)+'">Excluir</button></div>').join('')||emptyUI('Nenhuma medição','Registre seu peso quando quiser.'))+'</section><p class="efp-help">Peso e IMC não definem a sua saúde; os dados servem apenas para acompanhar seu próprio histórico.</p></div>';
 }
 function premiumPhotos(){
  return '<div class="efp-page">'+heading('Fotos da evolução','Sua galeria pessoal para comparar momentos da sua jornada.','fotos')+
  '<section class="efp-surface efp-photo-intro"><div class="efp-photo-graphic">'+ico('fotos',48)+'</div><div><span class="efp-overline">REGISTROS PESSOAIS</span><h2>Seu progresso, em imagens.</h2><p>Organize os registros por data. Nada é mostrado publicamente.</p></div></section>'+
  '<div class="efp-photo-actions">'+primary('add-photo','＋ &nbsp; Adicionar nova foto')+'<a class="efp-secondary" href="#evolucao">Ver comparativo</a></div>'+
  sectionTitle('Minha galeria','<span class="efp-text-muted">Privada</span>')+'<section class="efp-surface efp-gallery"><div id="photo-list">'+emptyUI('Carregando imagens','As fotos adicionadas aparecerão aqui.')+'</div></section><p class="efp-help">As fotos são privadas e ficam neste dispositivo na versão principal, ou na sua conta privada na versão Beta. A exportação JSON não inclui fotos.</p></div>';
 }
 function premiumSettings(){
  const wt=sortedWeights().at(-1)?.weight||null,profile=data.profile||{},h=Number(profile.height)||0,goal=Number(profile.goal)||0;
  return '<div class="efp-page">'+heading('Meu perfil','Gerencie suas informações e preferências.','ajustes')+
   '<section class="efp-surface efp-profile-hero"><div class="efp-profile-avatar">'+clean((profile.name||'E')[0].toUpperCase())+'</div><div><span class="efp-overline">MEU EVOLUFIT</span><h2>'+clean(profile.name||'Seu perfil')+'</h2><p>Seu espaço para evoluir no seu ritmo.</p></div><button type="button" data-action="efp-profile-form" class="efp-secondary">'+ico('ajustes',17)+' Editar perfil</button></section>'+
   '<div class="efp-triple efp-profile-metrics"><div class="efp-surface"><span>'+ico('peso',21)+' Peso</span><strong>'+(wt?count(wt)+' kg':'—')+'</strong><small>Último registro</small></div><div class="efp-surface"><span>'+ico('meta',21)+' Meta</span><strong>'+(goal?count(goal)+' kg':'—')+'</strong><small>Opcional</small></div><div class="efp-surface"><span>'+ico('evolucao',21)+' Altura</span><strong>'+(h?count(h)+' cm':'—')+'</strong><small>Informada</small></div></div>'+
   sectionTitle('Minha conta')+
   '<section class="efp-surface efp-setting-links">'+[
   ['evolucao','Minhas metas','Peso e registros de evolução'],['notificacoes','Notificações','Lembretes de refeições'],['alimentacao','Alimentação','Organizar meus horários'],['fotos','Fotos privadas','Sua galeria de evolução']
   ].map(([k,l,s])=>link(k,l,s)).join('')+'</section>'+
   '<section id="efp-profile-form" class="efp-surface efp-form-card">'+sectionTitle('Editar dados pessoais')+
   '<form data-form="profile" class="formgrid"><div class="field full"><label>Nome ou apelido</label><input name="name" value="'+clean(profile.name||'')+'" maxlength="60" placeholder="Como prefere ser chamado"></div><div class="field"><label>Altura (cm)</label><input name="height" type="number" min="80" max="240" value="'+clean(profile.height||'')+'" placeholder="Ex.: 175"></div><div class="field"><label>Meta de peso (kg, opcional)</label><input name="goal" type="number" min="10" max="500" step="0.1" value="'+clean(profile.goal||'')+'" placeholder="Ex.: 75"></div><div class="field full"><button class="efp-primary" type="submit">Salvar meu perfil</button></div></form></section>'+
   sectionTitle('Outras opções')+'<section class="efp-surface efp-profile-extras"><button type="button" data-action="export">'+ico('evolucao',21)+' Exportar meus registros <span>↓</span></button><a href="#notificacoes">'+ico('notificacoes',21)+' Configurar lembretes <span>›</span></a>'+(window.EvoluCloud?.enabled?'<button type="button" data-action="efp-logout">'+ico('ajustes',21)+' Sair da conta <span>›</span></button>':'')+'<button class="efp-danger" type="button" data-action="clear">'+ico('meta',21)+' Apagar dados locais <span>›</span></button></section><p class="efp-help">Dados e fotos podem depender da conta ou do navegador. Faça backup antes de apagar qualquer informação.</p></div>';
 }
 const originalSettings=settings;
 nav=premiumNav;
 home=premiumHome;
 trainings=premiumTrainings;
 walks=premiumWalks;
 food=premiumFood;
 evolution=premiumEvolution;
 photos=premiumPhotos;
 settings=premiumSettings;
 document.addEventListener('change',event=>{
  const id=event.target?.id;
  if(id==='efp-goal'){P.goal=event.target.value;render()}
  if(id==='efp-level'){P.level=event.target.value;window.EvoluWorkouts?.setPreferredLevel?.(P.level);render()}
 });
 document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el)return;
  if(el.dataset.action==='efp-workout-level'){P.level=el.dataset.level;window.EvoluWorkouts?.setPreferredLevel?.(P.level);P.goal='all';render();return}
  if(el.dataset.action==='efp-logout'){window.EvoluCloud?.signOut?.()}
  if(el.dataset.action==='efp-walk-form'||el.dataset.action==='efp-profile-form'){const target=document.getElementById(el.dataset.action);target?.scrollIntoView({block:'start',behavior:'smooth'});}
  if(el.dataset.action==='efp-password'){
   const input=document.getElementById('auth-password');if(!input)return;
   input.type=input.type==='password'?'text':'password';el.setAttribute('aria-label',input.type==='password'?'Mostrar senha':'Ocultar senha');
  }
 });
 window.addEventListener('hashchange',()=>{P.photoUrls.forEach(u=>URL.revokeObjectURL(u));P.photoUrls=[]});
 window.EvoluPremium={version:'1.0',style:'Dark Premium Fitness',current:()=>view};
 document.documentElement.classList.add('efp-premium');
 render();
})();