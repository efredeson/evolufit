/* EvoluFit — Biblioteca de treinos em casa (2026).
 * Diretrizes de referência: OMS 2020 (atividade aeróbica + força 2x/semana),
 * ACSM Position Stand 2026 (treino resistido com peso corporal é válido),
 * CDC (teste da conversa para intensidade moderada).
 * Volume, duração e exercícios são exemplos educativos para adultos saudáveis,
 * não prescrição individual nem prova de eficácia de uma rotina específica.
 */
(() => {
 'use strict';
 const LEVELS=['Iniciante','Intermediário','Avançado'];
 const GOALS={forca:'Força e condicionamento',cardio:'Cardio de baixo impacto',mobilidade:'Mobilidade e estabilidade'};
 const photoKinds=new Set(['cadeira','marcha','bracos','lateral','agachamento','parede','prancha','alongamento']);
 const preferredKey='evolufit-workout-level-v1';
 const move=(name,work,kind,technique,easier,harder,phase='Principal',rest=null)=>({name,work,kind,technique,easier,harder,phase,rest});
 const library=[
  {
   id:'inicio',level:'Iniciante',goal:'forca',title:'Primeiros passos: corpo todo',time:22,days:'2–3 sessões/semana',rest:75,intensity:'Leve a moderada · esforço percebido 3–4/10',equipment:'Cadeira firme, parede e espaço livre',
   desc:'Aprenda os movimentos básicos com controle e sem saltos.',
   weekly:'Faça em dias alternados; nos outros dias, escolha caminhadas leves ou mobilidade.',
   progress:'Quando completar todas as séries com boa técnica em duas sessões, acrescente 1–2 repetições OU uma série, nunca tudo de uma vez.',
   drills:[
    move('Marcha confortável no lugar','3 minutos','marcha','Movimente braços e pernas sem prender a respiração; comece lento.','Caminhe pelo cômodo, segurando um apoio se necessário.','Aumente ligeiramente o ritmo sem saltar.','Aquecimento',0),
    move('Sentar e levantar da cadeira','2 séries × 8 repetições','cadeira','Pés firmes na largura do quadril, incline levemente o tronco e levante sem impulso.','Use os braços para apoiar ou uma cadeira um pouco mais alta.','Faça até 12 repetições com controle.','Principal',75),
    move('Flexão na parede','2 séries × 8 repetições','parede','Mãos na parede na altura do peito, tronco alinhado, cotovelos flexionam sem abrir demais.','Aproxime os pés da parede.','Afaste os pés gradualmente.','Principal',75),
    move('Elevação de calcanhares','2 séries × 12 repetições','panturrilha','Segure em apoio firme, eleve os calcanhares e retorne devagar.','Faça com menos amplitude e os dois pés no chão.','Pause 2 segundos no alto.','Principal',60),
    move('Passos laterais sem salto','2 séries × 40 segundos','lateral','Dê um passo de lado e aproxime o outro pé; mantenha joelhos soltos.','Diminua a velocidade e use apoio próximo.','Aumente para 60 segundos sem perder o controle.','Principal',60),
    move('Alongamento leve e respiração','3 minutos','alongamento','Desacelere, alongue suavemente e respire normalmente.','Faça sentado.','Acrescente mobilidade suave de ombros.','Desaceleração',0)
   ]
  },
  {
   id:'cardioleve',level:'Iniciante',goal:'cardio',title:'Cardio leve sem pular',time:20,days:'2–4 sessões/semana',rest:45,intensity:'Leve · esforço percebido 3–4/10',equipment:'Espaço livre e cadeira como apoio opcional',
   desc:'Ative a circulação com passos simples, sem corrida e sem impacto.',
   weekly:'Alterne com dias de fortalecimento. Se ainda está começando, sessões curtas já contam.',
   progress:'Acrescente 2 minutos totais ou aumente suavemente o ritmo quando conseguir conversar durante a sessão.',
   drills:[
    move('Marcha leve para aquecer','3 minutos','marcha','Comece com passos baixos e braços soltos.','Marche sentado movimentando pernas e braços.','Marche com braços mais ativos.','Aquecimento',0),
    move('Marcha no lugar','2 séries × 2 minutos','marcha','Mantenha postura confortável e ritmo em que ainda consiga conversar.','Faça 1 minuto e descanse.','Eleve um pouco os joelhos mantendo a respiração estável.','Principal',45),
    move('Passos laterais','2 séries × 1 minuto','lateral','Vá e volte com passos curtos, sem cruzar as pernas.','Dê passos menores, perto de apoio.','Amplie os passos e mantenha os braços ativos.','Principal',45),
    move('Sentar e levantar','2 séries × 8 repetições','cadeira','Levante e sente de forma suave, olhando à frente.','Use as mãos no apoio.','Tente 10–12 repetições sem pressa.','Principal',60),
    move('Elevação alternada de braços','2 séries × 40 segundos','bracos','Levante os braços sem tensionar o pescoço; movimento confortável.','Mova apenas até a altura dos ombros.','Combine com marcha lenta.','Principal',45),
    move('Caminhada lenta e alongamento','3 minutos','alongamento','Diminua o ritmo aos poucos e alongue sem dor.','Faça sentado.','Alongue panturrilhas de modo suave.','Desaceleração',0)
   ]
  },
  {
   id:'mob',level:'Iniciante',goal:'mobilidade',title:'Mobilidade e postura',time:16,days:'3–5 sessões curtas/semana',rest:30,intensity:'Muito leve · sem forçar amplitude',equipment:'Parede ou cadeira firme como apoio',
   desc:'Ganhe conforto nos movimentos e estabilidade do dia a dia.',
   weekly:'Pode complementar dias de caminhada ou servir como sessão leve de recuperação.',
   progress:'Aumente a amplitude só quando estiver confortável, nunca buscando dor ou alongamento extremo.',
   drills:[
    move('Marcha leve e aquecimento','2 minutos','marcha','Caminhe no lugar para acordar as articulações.','Use cadeira como apoio.','Aumente um pouco o movimento dos braços.','Aquecimento',0),
    move('Círculos pequenos com ombros','2 séries × 8 para cada direção','ombros','Gire os ombros lentamente, sem elevar excessivamente o pescoço.','Faça sentado.','Aumente um pouco a amplitude sem dor.','Principal',30),
    move('Mobilidade de quadril','2 séries × 8 para cada lado','quadril','Apoie-se na parede e faça pequenos movimentos de quadril confortáveis.','Reduza a amplitude.','Faça com mais controle e menos apoio.','Principal',30),
    move('Equilíbrio com apoio','2 séries × 20 segundos por perna','lateral','Fique ao lado de uma parede, mantenha o corpo alinhado e erga levemente um pé.','Mantenha os dedos encostados no apoio.','Reduza gradualmente o apoio, sempre com a parede ao alcance.','Principal',30),
    move('Sentar e levantar devagar','1 série × 8 repetições','cadeira','Levante em velocidade confortável; mantenha a cadeira estável.','Use apoio das mãos.','Faça 10 repetições se estiver fácil.','Principal',30),
    move('Alongamento confortável','3 minutos','alongamento','Alongue suavemente panturrilha, braços e quadril respirando normalmente.','Faça sentado.','Aumente alguns segundos sem rebotes.','Desaceleração',0)
   ]
  },
  {
   id:'corpo',level:'Intermediário',goal:'forca',title:'Força funcional em casa',time:32,days:'3 sessões/semana',rest:75,intensity:'Moderada · esforço percebido 5–6/10',equipment:'Parede, cadeira firme e tapete opcional',
   desc:'Fortaleça pernas, empurrar e centro do corpo sem aparelhos.',
   weekly:'Alterne sessões de força com descanso ou caminhada. Evite repetir o treino intenso do mesmo grupo muscular em dias seguidos.',
   progress:'Se dominar 3 séries de 12 com postura estável, aumente a dificuldade do exercício antes de acelerar o movimento.',
   drills:[
    move('Aquecimento com marcha e ombros','4 minutos','marcha','Marche e mova os ombros sem acelerar demais.','Reduza para 3 minutos.','Inclua passos laterais leves.','Aquecimento',0),
    move('Agachamento controlado','3 séries × 10 repetições','agachamento','Desça até uma amplitude confortável, mantendo pés firmes e tronco estável.','Agache até encostar em uma cadeira.','Faça pausa de 2 segundos ao descer.','Principal',75),
    move('Flexão inclinada na parede','3 séries × 10 repetições','parede','Ajuste a distância da parede; mantenha cabeça e tronco alinhados.','Aproxime os pés da parede.','Afaste os pés um pouco mais.','Principal',75),
    move('Ponte de glúteos no chão','3 séries × 12 repetições','quadril','Deitado, joelhos dobrados; suba o quadril até alinhar coxas e tronco, sem arquear lombar.','Eleve menos o quadril.','Pause 2 segundos no alto.','Principal',60),
    move('Elevação de calcanhares','3 séries × 12 repetições','panturrilha','Segure apoio firme, suba e desça com controle.','Duas mãos apoiadas.','Desça em 3 segundos.','Principal',60),
    move('Prancha com joelhos apoiados','3 séries × 20 segundos','prancha','Apoie antebraços e joelhos no tapete, mantenha abdômen firme sem prender o ar.','Faça prancha inclinada na parede.','Amplie para 30 segundos mantendo alinhamento.','Principal',75),
    move('Desaceleração suave','3 minutos','alongamento','Relaxe o ritmo e alongue os músculos trabalhados sem forçar.','Faça sentado.','Respire lentamente, sem retenção.','Desaceleração',0)
   ]
  },
  {
   id:'energia',level:'Intermediário',goal:'cardio',title:'Circuito de energia sem saltos',time:28,days:'2–3 sessões/semana',rest:60,intensity:'Moderada · esforço percebido 5–6/10',equipment:'Espaço livre, parede e água por perto',
   desc:'Eleve a respiração com movimentos dinâmicos, sem precisar correr.',
   weekly:'Alterne com treino de força ou caminhadas; mantenha dias mais leves para recuperar.',
   progress:'Comece com 2 circuitos. Passe a 3 circuitos se conseguir manter o teste da conversa e técnica estável.',
   drills:[
    move('Marcha progressiva','4 minutos','marcha','Aumente o ritmo gradualmente durante o aquecimento.','Use passos baixos.','Acrescente movimentos amplos dos braços.','Aquecimento',0),
    move('Marcha rápida sem corrida','3 séries × 50 segundos','marcha','Eleve ligeiramente o joelho mantendo controle e respiração fluida.','Faça 30 segundos em ritmo menor.','Chegue a 60 segundos sem perder controle.','Principal',45),
    move('Passos laterais acelerados','3 séries × 40 segundos','lateral','Desloque-se lateralmente em espaço livre, evitando mudanças bruscas.','Faça passos curtos.','Acrescente movimentos coordenados dos braços.','Principal',45),
    move('Agachamento com alcance frontal','3 séries × 10 repetições','agachamento','Agache confortavelmente e alcance à frente ao subir.','Use cadeira como referência.','Aumente até 12 repetições.','Principal',60),
    move('Flexão na parede','3 séries × 10 repetições','parede','Flexione os cotovelos com tronco alinhado.','Aproxime-se da parede.','Afaste os pés um pouco mais.','Principal',60),
    move('Marcha de recuperação','2 minutos','marcha','Reduza a intensidade até recuperar o ritmo de respiração.','Marche lentamente.','Acrescente movimentos suaves de ombros.','Desaceleração',0),
    move('Alongamento leve','2 minutos','alongamento','Alongue sem dor e respire normalmente.','Faça sentado.','Inclua alongamento suave de panturrilhas.','Desaceleração',0)
   ]
  },
  {
   id:'estabilidade',level:'Intermediário',goal:'mobilidade',title:'Core, equilíbrio e controle',time:25,days:'2–3 sessões/semana',rest:60,intensity:'Moderada · esforço percebido 4–6/10',equipment:'Tapete opcional e parede como apoio',
   desc:'Trabalhe estabilidade, equilíbrio e postura com movimentos lentos.',
   weekly:'Combine com força ou caminhada; treine estabilidade apenas quando estiver descansado para manter controle.',
   progress:'Aumente alguns segundos por série ou diminua ligeiramente o apoio sem arriscar perder o equilíbrio.',
   drills:[
    move('Marcha e mobilidade leve','3 minutos','marcha','Comece com passo confortável e ombros relaxados.','Segure apoio firme.','Inclua passos laterais lentos.','Aquecimento',0),
    move('Equilíbrio próximo à parede','3 séries × 25 segundos por perna','lateral','Fique ao alcance da parede; olhe à frente e mantenha quadril estável.','Mantenha as pontas dos dedos apoiadas.','Diminua o apoio progressivamente.','Principal',45),
    move('Ponte de glúteos','3 séries × 10 repetições','quadril','Eleve o quadril sem arquear a lombar e desça controlado.','Reduza a amplitude.','Segure 2 segundos no alto.','Principal',60),
    move('Prancha com joelhos apoiados','3 séries × 25 segundos','prancha','Mantenha abdômen firme, pescoço neutro e respiração constante.','Prancha apoiada na parede.','Estenda uma perna por vez, se estável.','Principal',60),
    move('Passos laterais controlados','2 séries × 45 segundos','lateral','Faça passos confortáveis, estabilizando a cada movimento.','Aproxime-se de uma parede para apoio.','Aumente um pouco a duração.','Principal',45),
    move('Alongamento e respiração','3 minutos','alongamento','Desacelere, alongue suavemente e respire normalmente.','Faça sentado.','Prolongue cada alongamento com leve tensão.','Desaceleração',0)
   ]
  },
  {
   id:'forca-avancada',level:'Avançado',goal:'forca',title:'Força progressiva sem academia',time:42,days:'3–4 sessões/semana',rest:90,intensity:'Desafiadora e controlada · esforço percebido 6–8/10',equipment:'Chão/tapete, parede e cadeira firme opcional',
   desc:'Mais séries, amplitude controlada e movimentos unilaterais.',
   weekly:'Intercale sessões difíceis com pelo menos um dia leve para cada grupo muscular. Não é necessário treinar até a falha.',
   progress:'Aumente apenas uma variável por vez: repetições, tempo, série extra ou versão mais desafiadora.',
   drills:[
    move('Aquecimento dinâmico','5 minutos','marcha','Marche, mova ombros e quadril e aumente gradualmente a amplitude.','Reduza o ritmo.','Acrescente agachamentos sem carga.','Aquecimento',0),
    move('Agachamento com pausa','4 séries × 10 repetições','agachamento','Desça com controle, pause 2 segundos e suba sem prender a respiração.','Agache até cadeira firme.','Aumente a pausa, sem sacrificar alinhamento.','Principal',90),
    move('Flexão no chão ou inclinada','4 séries × 8–12 repetições','parede','Mantenha cabeça, tronco e quadril alinhados; cotovelos controlados.','Faça na parede ou com joelhos apoiados.','Faça flexão no chão com amplitude confortável.','Principal',90),
    move('Passada reversa apoiada','3 séries × 10 por perna','passada','Dê um passo para trás, flexione ambos os joelhos e retorne com controle, perto de apoio.','Faça passada curta segurando cadeira.','Aumente a amplitude mantendo equilíbrio.','Principal',90),
    move('Ponte de glúteos com pausa','3 séries × 12 repetições','quadril','Eleve o quadril e mantenha 2 segundos, sem arquear a lombar.','Ponte curta com os dois pés.','Estenda uma perna apenas se controlar quadril e coluna.','Principal',75),
    move('Prancha com apoio de antebraços','3 séries × 30–40 segundos','prancha','Mantenha corpo alinhado, abdômen ativo e respiração contínua.','Apoie os joelhos.','Aumente alguns segundos, não a tensão no pescoço.','Principal',90),
    move('Desaceleração e mobilidade','4 minutos','alongamento','Reduza o esforço e faça alongamentos suaves.','Faça sentado ou apoiado.','Inclua mobilidade de quadril e ombros.','Desaceleração',0)
   ]
  },
  {
   id:'cardio-avancado',level:'Avançado',goal:'cardio',title:'Condicionamento forte sem salto',time:36,days:'2–3 sessões/semana',rest:75,intensity:'Vigorosa adaptável · esforço percebido 6–8/10',equipment:'Espaço livre e parede como apoio opcional',
   desc:'Circuito contínuo em casa com opções de baixo impacto.',
   weekly:'Evite dois dias intensos consecutivos. Intercale caminhadas leves e recuperação.',
   progress:'Comece com 2 voltas; avance para 3–4 só quando tolerar o ritmo e recuperar bem a respiração.',
   drills:[
    move('Aquecimento com marcha','5 minutos','marcha','Aumente o ritmo gradualmente, sem saltos.','Faça passos baixos.','Amplie os movimentos dos braços.','Aquecimento',0),
    move('Marcha rápida com braços','4 séries × 60 segundos','marcha','Use ritmo firme e mantenha a respiração fluindo.','Faça 40 segundos e descanse mais.','Aumente o ritmo, sem corrida ou saltos.','Principal',45),
    move('Passos laterais em circuito','4 séries × 45 segundos','lateral','Troque de direção com suavidade e mantenha joelhos flexíveis.','Reduza a distância dos passos.','Acrescente deslocamento maior se houver espaço seguro.','Principal',45),
    move('Agachamento cadenciado','3 séries × 12 repetições','agachamento','Controle a descida e suba com postura firme.','Agache até cadeira.','Inclua pausa de 2 segundos na parte baixa.','Principal',75),
    move('Flexão inclinada','3 séries × 10 repetições','parede','Use parede firme e tronco alinhado, sem travar a respiração.','Aproxime os pés.','Afaste os pés gradualmente.','Principal',75),
    move('Prancha estável','3 séries × 30 segundos','prancha','Mantenha pescoço neutro e ombros firmes, respirando.','Apoie joelhos ou faça na parede.','Aumente tempo em pequenos blocos.','Principal',75),
    move('Marcha leve para desacelerar','4 minutos','marcha','Reduza gradualmente os batimentos e a respiração.','Caminhe devagar.','Alongue suavemente após desacelerar.','Desaceleração',0)
   ]
  },
  {
   id:'controle-avancado',level:'Avançado',goal:'mobilidade',title:'Estabilidade e domínio corporal',time:33,days:'2–3 sessões/semana',rest:75,intensity:'Desafiadora com controle · esforço percebido 6–7/10',equipment:'Tapete opcional, parede e apoio firme próximo',
   desc:'Pratique equilíbrio unilateral e core com qualidade de movimento.',
   weekly:'Alterne com dias de força, sem repetir movimentos de grande exigência de equilíbrio quando cansado.',
   progress:'Progrida 5 segundos ou 1–2 repetições a cada duas boas sessões. Nunca retire um apoio se houver risco de queda.',
   drills:[
    move('Aquecimento articular e marcha','4 minutos','marcha','Aqueça quadris, ombros e pernas com movimentos suaves.','Use apoio de cadeira.','Aumente devagar a amplitude.','Aquecimento',0),
    move('Passada reversa lenta','3 séries × 8 por perna','passada','Dê um passo para trás controlando joelho e quadril; apoio perto.','Segure cadeira para equilíbrio.','Faça pausas curtas na parte baixa.','Principal',75),
    move('Ponte de glúteos unilateral adaptada','3 séries × 8 por lado','quadril','Comece com ponte bilateral; transfira pouco peso para uma perna mantendo quadril nivelado.','Permaneça na ponte com os dois pés.','Eleve uma perna mantendo estabilidade.','Principal',75),
    move('Prancha com toques de ombro adaptada','3 séries × 20 segundos','prancha','Na parede ou no chão, transfira peso suavemente sem girar o quadril.','Faça prancha parada apoiada na parede.','Alterne toques com maior controle.','Principal',75),
    move('Equilíbrio unipodal apoiado','3 séries × 30 segundos por perna','lateral','Mantenha-se ao lado da parede e ajuste o equilíbrio sem rigidez.','Apoie dedos ou pés alternadamente.','Diminua apoio sem sair da área segura.','Principal',60),
    move('Alongamento e controle respiratório','4 minutos','alongamento','Desacelere, mobilize e alongue sem dor.','Faça sentado.','Mantenha alongamentos suaves por mais alguns segundos.','Desaceleração',0)
   ]
  }
 ];
 for(const plan of library){
  plan.steps=plan.drills.map(d=>d.name+' • '+d.work);
  plan.emoji=plan.level==='Iniciante'?'🌱':plan.level==='Intermediário'?'💪':'⚡';
 }
 // Reusa os registros e eventos existentes: as IDs principais permanecem válidas.
 if(typeof PLANS!=='undefined' && Array.isArray(PLANS))PLANS.splice(0,PLANS.length,...library);
 function getPreferredLevel(){try{const l=localStorage.getItem(preferredKey);return LEVELS.includes(l)?l:'Iniciante'}catch{return 'Iniciante'}}
 function setPreferredLevel(level){if(!LEVELS.includes(level))return false;try{localStorage.setItem(preferredKey,level)}catch{};return true}
 function forLevel(level){return library.filter(p=>p.level===level)}
 function getRecommended(){return forLevel(getPreferredLevel())[0]||library[0]}
 function stepInfo(plan,idx){return plan?.drills?.[idx]||null}
 function imageUrl(kind){const prefix=location.pathname.includes('/beta/')?'../assets/exercicios/':'assets/exercicios/';return prefix+(photoKinds.has(kind)?kind+'-foto.webp':kind+'.svg')}
 window.EvoluWorkouts={version:'2.0',LEVELS,GOALS,plans:library,forLevel,getRecommended,getPreferredLevel,setPreferredLevel,stepInfo,imageUrl,
  sources:[{name:'OMS — recomendações de atividade física',url:'https://www.who.int/initiatives/behealthy/physical-activity'},
   {name:'ACSM — exercícios resistidos em casa (2026)',url:'https://acsm.org/resistance-training-guidelines-update-2026/'},
   {name:'CDC — intensidade e teste da conversa',url:'https://www.cdc.gov/physical-activity-basics/measuring/index.html'}]};
})();