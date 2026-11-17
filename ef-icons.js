/* EvoluFit · Ícones oficiais aprovados pelo proprietário.
 * Os desenhos foram recortados da arte aprovada sem redesenhar.
 * Sprite 4×4, cores neon/prata em fundo preto AMOLED.
 */
(function(){
 "use strict";
 const locations={
  inicio:[0,0],treinos:[1,0],caminhadas:[2,0],alimentacao:[3,0],
  evolucao:[0,1],fotos:[1,1],ajustes:[2,1],cronometro:[3,1],
  notificacoes:[0,2],agua:[1,2],meta:[2,2],peso:[3,2],
  calendar:[0,3],check:[1,3],clock:[2,3],menu:[3,3],
  bell:[0,2]
 };
 const isBeta=location.pathname.includes("/beta/");
 const source=(isBeta?"../":"")+"assets/ef-icons-approved.svg";
 window.EVOLUFIT_ICONS={
  keys:Object.keys(locations),
  render:function(key,size=26){
   const pos=locations[key]||locations.inicio;
   const dimension=Math.min(90,Math.max(18,Number(size)||26));
   const backgroundPosition=(pos[0]*100/3).toFixed(4)+"% "+(pos[1]*100/3).toFixed(4)+"%";
   return '<span class="ui-icon ef-approved-icon" aria-hidden="true" style="'+
      'width:'+dimension+'px;height:'+dimension+'px;'+
      'background-image:url(&quot;'+source+'&quot;);'+
      'background-position:'+backgroundPosition+'"></span>';
  }
 };
})();