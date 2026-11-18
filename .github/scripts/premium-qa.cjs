const {chromium}=require('playwright'), http=require('http'),fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'../..');
const out=path.join(base,'premium-qa-results');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((req,res)=>{let url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname);if(name.endsWith('/'))name+='index.html';const file=path.resolve(base,'.'+name);if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
fs.readFile(file,(e,body)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(body);});});
const date=new Date(),today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const seed={profile:{name:'Teste',height:'175',goal:'75'},walks:[{id:'w1',date:today,minutes:32,distance:2.4,pace:'Moderado'}],workouts:[{id:'t1',date:today,title:'Comece no seu ritmo',minutes:12}],weights:[{id:'pw1',date:'2026-11-01',weight:80},{id:'pw2',date:today,weight:78.5}],water:{[today]:5},mealDone:{[today]:['cafe']}};
(async()=>{
 await new Promise(ok=>server.listen(8765,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--disable-dev-shm-usage','--no-sandbox']});
 const problems=[],results=[],sizes=[[320,700],[390,844],[768,1024],[1366,900]],views=['inicio','treinos','caminhadas','alimentacao','evolucao','fotos','cronometro','ajustes','notificacoes'];
 for(const [w,h] of sizes){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});
  await ctx.addInitScript(data=>{localStorage.setItem('evolufit-data-v01',JSON.stringify(data));},seed);
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const view of views){
   await page.goto('http://127.0.0.1:8765/#'+view,{waitUntil:'domcontentloaded'});await page.waitForTimeout(110);
   const info=await page.evaluate(()=>({width:document.documentElement.scrollWidth,body:document.body.scrollWidth,html:document.querySelector('#main')?.innerText.length||0,premium:!!window.EvoluPremium}));
   results.push({size:w,view,...info});if(info.width>w+2||info.body>w+2||info.html<30||!info.premium)problems.push({size:w,view,...info});
   if((w===390||w===1366)&&['inicio','treinos','caminhadas','alimentacao','evolucao','fotos','ajustes'].includes(view))await page.screenshot({path:path.join(out,w+'-'+view+'.png'),fullPage:true});
  }
  if(w===390){
   await page.goto('http://127.0.0.1:8765/#inicio');await page.locator('[data-action="efm-start"]').first.click();await page.waitForTimeout(70);
   if(await page.locator('.efm-guided').count()!==1)problems.push('Guided workout modal not opening');
   else await page.locator('[data-action="efm-exit"]').click();
  }
  if(errors.length)problems.push({size:w,errors:errors.slice(0,10)});
  await ctx.close();
 }
 for(const [w,h] of sizes){
  const ctx=await browser.newContext({viewport:{width:w,height:h}});
  await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  await ctx.addInitScript(()=>{window.supabase={createClient(){return {auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}})}}}};});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/beta/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(250);
  const state=await page.evaluate(()=>({width:document.documentElement.scrollWidth,auth:!document.querySelector('#auth-root').hidden,inputs:document.querySelectorAll('#auth-root input').length,login:document.querySelector('#auth-root').innerText.includes('Entre na sua conta'),top:document.querySelector('.cloud-auth-panel')?.getBoundingClientRect().top}));
  if(state.width>w+2||!state.auth||state.inputs<2||!state.login)problems.push({login:w,...state});
  await page.screenshot({path:path.join(out,w+'-login.png'),fullPage:true});
  if(w===390){
   const input=page.locator('#auth-email');await input.focus();const before=await page.locator('.cloud-auth-panel').boundingBox();
   await page.setViewportSize({width:w,height:590});await page.waitForTimeout(130);
   const after=await page.locator('.cloud-auth-panel').boundingBox();
   if(Math.abs(before.y-after.y)>9)problems.push({loginJump:{before:before.y,after:after.y}});
  }
  if(errors.length)problems.push({login:w,errors});
  await ctx.close();
 }
 fs.writeFileSync(path.join(out,'diagnostic.json'),JSON.stringify({problems,results:results.length,viewportSizes:sizes,checkedViews:views},null,2));
 console.log('Result:',JSON.stringify({problems,views:results.length}));
 await browser.close();server.close();
 if(problems.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});