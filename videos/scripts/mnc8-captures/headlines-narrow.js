const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const jobs=[['b2','https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/',/^Klarna AI assistant handles/, /February 27, 2024 -/],
['b10b','https://tech.co/news/klarna-reverses-ai-overhaul',/^Klarna Reverses AI Customer Service Overhaul$/, /^May 20, 2025$/]];
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 for (const [k,u,hre,dre] of jobs){
  const p = await b.newPage({viewport:{width:720,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
  await p.goto(u,{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
  for (const n of ['Deny All','Reject All']) { try{ await p.getByRole('button',{name:n}).first().click({timeout:2500}); break;}catch(e){} }
  await p.waitForTimeout(800);
  const box = await p.evaluate(([hs,ds])=>{const H=new RegExp(hs),D=new RegExp(ds); const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const els=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
    const h=els.filter(e=>H.test(e.textContent.trim())).sort((a,b)=>parseFloat(getComputedStyle(b).fontSize)-parseFloat(getComputedStyle(a).fontSize))[0];
    const d=els.find(e=>D.test(e.textContent.trim()));
    if(!h||!d) return {err:[!!h,!!d]};
    const r1=h.getBoundingClientRect(), r2=d.getBoundingClientRect();
    return {x:Math.min(r1.left,r2.left)+scrollX,y:Math.min(r1.top,r2.top)+scrollY,x2:Math.max(r1.right,r2.right)+scrollX,y2:Math.max(r1.bottom,r2.bottom)+scrollY};},[hre.source,dre.source]);
  console.log(k,JSON.stringify(box));
  if(!box.err){ await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el); if(s.position==='fixed') el.style.visibility='hidden';}});
   const pad=24; await p.screenshot({path:`shots/n_${k}.png`,fullPage:true,clip:{x:Math.max(0,box.x-pad),y:box.y-pad,width:Math.min(720,box.x2-box.x+2*pad),height:box.y2-box.y+2*pad}}); }
  await p.close();
 }
 await b.close();
})();
