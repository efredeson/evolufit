/* EvoluFit · Assistente de migração GitHub Pages → Vercel
 * Dados ficam sempre no dispositivo do usuário; não há upload de backups.
 * A versão antiga permanece acessível para exportação e recuperação.
 */
(() => {
 "use strict";
 const OLD="https://efredeson.github.io/evolufit/";
 const NEW="https://evolufit-lake.vercel.app/";
 const oldHost=location.hostname==="efredeson.github.io";
 const newHost=location.hostname==="evolufit-lake.vercel.app";
 if (!oldHost && !newHost) return;

 const extra = () => {
   const message=oldHost
     ? "Seu histórico local está guardado no navegador deste endereço antigo. Antes de mudar para a Vercel, exporte uma cópia."
     : "Para trazer seu histórico local do GitHub Pages, exporte um backup no endereço antigo e importe o arquivo aqui.";
   const controls=oldHost
     ? action("export","⬇ Exportar meus registros","btn")
       +'<a class="btn secondary" href="'+NEW+'" target="_blank" rel="noopener noreferrer">Conhecer a versão Vercel ↗</a>'
     : '<label for="efmig-file" class="btn">⬆ Importar histórico JSON</label>'
       +'<input id="efmig-file" type="file" accept="application/json,.json" hidden>'
       +'<a class="btn secondary" href="'+OLD+'#ajustes" target="_blank" rel="noopener noreferrer">Abrir endereço antigo ↗</a>';
   return '<section class="card efmig-panel"><div class="cardhead"><h2>Transferência de dados</h2>'
       +'<span class="pill">'+(oldHost?"GitHub Pages":"Vercel")+'</span></div>'
       +'<p>'+message+'</p><div class="efmig-actions">'+controls+'</div>'
       +'<p class="footnote">O arquivo JSON contém seus registros, mas não inclui as fotos. Para fotos, abra a galeria antiga, salve as imagens e adicione-as novamente na Vercel. O backup não é enviado a nenhum servidor.</p>'
       +'</section>';
 };
 const baseSettings=settings;
 settings=function(){return baseSettings()+extra()};
 const baseLoadPhotos=loadPhotos;
 loadPhotos=async function(){
   await baseLoadPhotos();
   const cards=[...document.querySelectorAll("#photo-list .photo-card")];
   let photoRows=[];
   try {photoRows=(await photoOp("get")).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));} catch(_) { /* fotos opcionais */ }
   for(const [i,card] of cards.entries()){
     const img=card.querySelector("img");
     const footer=card.querySelector("div");
     if(!img||!footer||footer.querySelector(".efmig-photo-save"))continue;
     const date=(img.getAttribute("alt")||"").match(/\d{4}-\d{2}-\d{2}/)?.[0]||"registro";
     const link=document.createElement("a");
     link.className="btn secondary small efmig-photo-save";
     link.href=img.src;
     const mime=String(photoRows[i]?.blob?.type||"");
     const ext=mime.includes("png")?"png":mime.includes("webp")?"webp":"jpg";
     link.download="evolufit-foto-"+date+"-"+(i+1)+"."+ext;
     link.textContent="⬇ Salvar foto";
     link.setAttribute("aria-label","Salvar foto de evolução "+date);
     footer.appendChild(link);
   }
 };
 function asNumber(n,min,max){
  const x=Number(n);return Number.isFinite(x)&&x>=min&&x<=max?x:null;
 }
 function restore(raw){
  const d=raw?.data;
  if(!d||typeof d!=="object"||Array.isArray(d)||
     !Array.isArray(d.walks)||!Array.isArray(d.workouts)||!Array.isArray(d.weights)||!Array.isArray(d.meals)){
    throw Error("Arquivo inválido. Use o JSON exportado pelo EvoluFit.");
  }
  const dateOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x);
  const txt=(x,n=70)=>String(x??"").slice(0,n);
  if(d.walks.length>20000||d.weights.length>20000||d.workouts.length>20000||d.meals.length>500){
    throw Error("Backup excede o limite seguro de registros.");
  }
  const base=defaultData();
  const walks=d.walks.filter(x=>x&&dateOK(x.date)&&asNumber(x.minutes,1,1440)!==null).map(x=>({
    id:txt(x.id,80)||id(),date:x.date,minutes:Number(x.minutes),
    distance:(x.distance===null||x.distance===undefined||x.distance==="")?null:asNumber(x.distance,0,100),pace:txt(x.pace||"Leve",30)
  }));
  const workouts=d.workouts.filter(x=>x&&dateOK(x.date)&&asNumber(x.minutes,0,1440)!==null).map(x=>({
    id:txt(x.id,80)||id(),date:x.date,minutes:Number(x.minutes),title:txt(x.title,100)
  }));
  const weights=d.weights.filter(x=>x&&dateOK(x.date)&&asNumber(x.weight,10,500)!==null).map(x=>({
    id:txt(x.id,80)||id(),date:x.date,weight:Number(x.weight)
  }));
  const meals=d.meals.filter(x=>x&&typeof x.name==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)).map(x=>({
    id:txt(x.id,80)||id(),name:txt(x.name,45),time:x.time
  }));
  const water={};
  if(d.water&&typeof d.water==="object"&&!Array.isArray(d.water))
   for(const [key,val] of Object.entries(d.water).slice(0,2500))
    if(dateOK(key)&&asNumber(val,0,30)!==null)water[key]=Number(val);
  const mealDone={};
  if(d.mealDone&&typeof d.mealDone==="object"&&!Array.isArray(d.mealDone))
   for(const [key,val] of Object.entries(d.mealDone).slice(0,2500))
    if(dateOK(key)&&Array.isArray(val))mealDone[key]=val.filter(v=>typeof v==="string").slice(0,500).map(v=>txt(v,80));
  const profile=d.profile&&typeof d.profile==="object"?d.profile:{};
  return { ...base,
    profile:{name:txt(profile.name,60),height:txt(profile.height,10),goal:txt(profile.goal,15)},
    walks,workouts,weights,meals:meals.length?meals:base.meals,water,mealDone,
    notifications:false
  };
 }
 document.addEventListener("change",async event=>{
   if(!newHost||event.target?.id!=="efmig-file")return;
   const picker=event.target,file=picker.files?.[0];if(!file)return;
   try{
     if(file.size>3*1024*1024)throw Error("O arquivo é muito grande (máximo 3 MB).");
     const parsed=JSON.parse(await file.text());
     const imported=restore(parsed);
     const summary="Backup encontrado:\n"+
       "• "+imported.workouts.length+" treinos\n"+
       "• "+imported.walks.length+" caminhadas\n"+
       "• "+imported.weights.length+" medições\n"+
       "• "+imported.meals.length+" horários de refeição\n\n"+
       "Substituir os registros locais deste endereço? Esta ação não altera os registros da sua conta Supabase.";
     if(!window.confirm(summary))return;
     data=imported;save();render();
     toast("Histórico importado com sucesso! 💚");
   }catch(error){
     toast(error?.message||"Não foi possível importar o backup.");
   }finally{picker.value="";}
 });
 const style=document.createElement("style");
 style.textContent=".efmig-panel{margin-top:18px;border-color:#578c2b}.efmig-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}.efmig-actions label{cursor:pointer;display:inline-flex;align-items:center}.efmig-photo-save{display:inline-flex;margin:7px 7px 0 0}";
 document.head.appendChild(style);
 render();
 window.EvoluMigration={version:"1.0",isOld:oldHost,isNew:newHost};
})();