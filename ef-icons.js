/* EvoluFit iconography: original coordinated vector family. No external icon font. */
(function(){
 "use strict";
 const P=(s)=>s;
 const art={
  inicio:[
   '<path d="M10 29 31 11 54 29V53H10Z" fill="none"/><path d="M25 53V39h14v14"/>',
   '<path d="M13 35h11l5-8 7 16 5-8h10" stroke-width="4"/>'
  ],
  treinos:[
   '<rect x="3" y="22" width="8" height="24" rx="2"/><rect x="53" y="22" width="8" height="24" rx="2"/><rect x="12" y="17" width="8" height="34" rx="3"/><rect x="44" y="17" width="8" height="34" rx="3"/><path d="M20 34h24" stroke-width="6"/>',
   '<path d="m25 33 4-7 4 14 4-7 3 0" stroke-width="3"/>'
  ],
  caminhadas:[
   '<path d="M8 41c9 2 17 0 23-9l8-14 9 5-3 12 12 12c3 3 1 9-4 9H17c-8 0-12-6-9-15Z"/><path d="M12 53h43"/><path d="m32 27 9 7"/><path d="m13 41 13 4"/>',
   '<path d="m23 22 7-7m5 8 7-6M7 56l-4 4" stroke-width="4"/>'
  ],
  alimentacao:[
   '<path d="M9 32h46c-1 17-10 24-23 24S10 49 9 32Z"/><path d="M6 32h52M22 54h20"/><path d="M31 32c-5-14-2-24 7-27"/>',
   '<path d="M34 19C35 9 44 7 51 8c-2 9-9 13-17 11Zm-5 4c-8-1-13-6-13-14 9 0 15 6 13 14Z" fill="#aaff29" stroke-width="2"/>'
  ],
  evolucao:[
   '<path d="M6 56V36h12v20M26 56V27h12v29M46 56V14h12v42"/><path d="M5 59h56"/>',
   '<path d="m8 28 16-12 10 8L55 5m-11 0h11v11" stroke-width="4"/>'
  ],
  fotos:[
   '<rect x="8" y="10" width="48" height="44" rx="7" /><circle cx="23" cy="24" r="5"/><path d="M13 46 25 34l9 7 8-9 10 12"/>',
   '<circle cx="42" cy="19" r="3.1" fill="#aaff29" stroke="none"/><circle cx="49" cy="22" r="2.7" fill="#aaff29" stroke="none"/><circle cx="38" cy="26" r="2.2" fill="#aaff29" stroke="none"/><path d="M41 30q7-7 11 2" stroke-width="3"/>'
  ],
  cronometro:[
   '<circle cx="32" cy="36" r="24"/><path d="M24 5h16M32 11v-5M48 15l6-5"/>',
   '<path d="m33 17-9 20h10l-4 17 14-25H34Z" fill="#aaff29" stroke-width="2"/>'
  ],
  ajustes:[
   '<path d="m9 25-2-17 17 9a28 28 0 0 1 17 0L58 8l-2 17c2 20-7 32-24 33C16 58 7 46 9 25Z"/><path d="M15 36c5-7 10-7 15 0m5 0c5-7 11-7 16 0M29 45l3 3 3-3"/>',
   '<path d="M13 24C22 17 38 17 51 24" stroke-width="5"/><path d="m19 14 4 3m20 0 3-3" stroke-width="3"/>'
  ],
  notificacoes:[
   '<path d="M16 45c6-8 2-17 8-26a13 13 0 0 1 21 0c6 9 2 18 8 26l4 6H9Z"/><path d="M26 56q6 8 13 0"/>',
   '<circle cx="28" cy="34" r="3" fill="#aaff29" stroke="none"/><circle cx="39" cy="34" r="3" fill="#aaff29" stroke="none"/><path d="M28 42q5-6 11 0" stroke-width="3"/>'
  ],
  calendar:[
   '<rect x="7" y="13" width="50" height="43" rx="6"/><path d="M18 7v14m28-14v14M7 26h50"/>',
   '<path d="m18 40 8 7 17-14" stroke-width="5"/>'
  ],
  bell:[
   '<path d="M16 45c6-8 2-17 8-26a13 13 0 0 1 21 0c6 9 2 18 8 26l4 6H9Z"/><path d="M26 56q6 8 13 0"/>',
   '<circle cx="45" cy="17" r="6" fill="#aaff29" stroke-width="2"/>'
  ],
  clock:[
   '<circle cx="32" cy="32" r="26"/><path d="M32 12v21l15 9"/>',
   '<path d="M13 32h8l4-8 5 17 4-8h8" stroke-width="3"/>'
  ],
  menu:[
   '<path d="M11 16h42M11 33h33M11 50h42"/>',
   '<path d="M45 27l8 6-8 6" stroke-width="4"/>'
  ],
  check:[
   '<path d="M10 32 26 47 55 16"/>',
   '<path d="m16 32 11 9 23-20" stroke-width="3"/>'
  ],
  agua:[
   '<path d="M32 5c10 17 22 32 22 40a22 22 0 0 1-44 0C10 37 21 22 32 5Z"/>',
   '<path d="M15 46q11-6 17-1t17-2" stroke-width="4"/>'
  ],
  meta:[
   '<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="15"/><circle cx="32" cy="32" r="5"/>',
   '<path d="m27 36 22-22m-10 0h10v10" stroke-width="4"/>'
  ],
  peso:[
   '<path d="M10 19h44l6 39H4Z"/><path d="M22 19v-7a10 10 0 0 1 20 0v7"/>',
   '<path d="M24 38h16l-8-11Z" stroke-width="4"/>'
  ]
 };
 window.EVOLUFIT_ICONS={
  keys:Object.keys(art),
  render:function(kind,size){
   const item=art[kind]||art.inicio,sz=Number(size)||22;
   return '<svg class="ui-icon ef-brand-icon" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" role="img" aria-label="'+(kind||'EvoluFit')+'" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e7f6ea" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'+
    '<g>'+item[0]+'</g><g stroke="#adff23">'+item[1]+'</g></svg>';
  }
 };
})();
