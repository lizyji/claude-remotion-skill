const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 const shot = async (u, jobs) => {
  const p = await b.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
  await p.goto(u,{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(7000);
  try{ await p.getByRole('button',{name:'Reject All'}).click({timeout:4000}); }catch(e){ console.log('no reject btn'); }
  await p.waitForTimeout(1200);
  for (const [name, fn] of jobs) { const r = await p.evaluate(fn); console.log(name, JSON.stringify(r)); await p.screenshot({path:`shots/${name}.png`, clip:r}); }
  await p.close();
 };
 await shot('https://x.ai/bot', [
  ['grok_meet', () => { const h=document.querySelector('h1').getBoundingClientRect(); return {x:h.left-30,y:h.top+scrollY-20,width:h.width+60,height:h.height+40}; }],
  ['grok_app', () => { const im=[...document.querySelectorAll('img,video,div')].map(e=>[e,e.getBoundingClientRect()]).filter(([e,r])=>r.width>900&&r.width<1060&&r.height>300&&r.top>350).sort((a,b)=>a[1].top-b[1].top)[0]; const r=im?im[1]:{left:55,top:440,width:890,height:470}; return {x:r.left,y:r.top+scrollY,width:r.width,height:Math.min(r.height,520)}; }],
 ]);
 await shot('https://x.ai/news/introducing-grok-bot', [
  ['grok_news', () => { const h=document.querySelector('h1').getBoundingClientRect(); return {x:40,y:100,width:1020,height:(h.bottom-100)+140}; }],
 ]);
 // logo svg
 const p = await b.newPage({ignoreHTTPSErrors:true,userAgent:UA}); await p.goto('https://x.ai/bot',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(5000);
 const svg = await p.evaluate(()=>{const h=document.querySelector('h1'); const s=h.querySelector('svg'); const i=h.querySelector('img'); return s?s.outerHTML:(i?i.src:null);});
 require('fs').writeFileSync('shots/grok_logo.txt', String(svg)); console.log('logo', String(svg).slice(0,200));
 await b.close();
})();
