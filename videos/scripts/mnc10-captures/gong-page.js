const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 const p = await b.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
 await p.goto('https://www.gong.io/blog/sales-demos',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
 try{ await p.locator('#onetrust-close-btn-container button, button[aria-label="Close"]').first().click({timeout:3000}); }catch(e){}
 await p.evaluate(()=>{ for (const el of document.querySelectorAll('[id*=onetrust i]')) el.style.display='none'; });
 await p.waitForTimeout(800);
 // logo + headline together: from top of logo to bottom of h1
 const box = await p.evaluate(()=>{ const logo=[...document.querySelectorAll('a svg, a img')].map(e=>[e,e.getBoundingClientRect()]).filter(([e,r])=>r.left<120&&r.top>40&&r.top<200&&r.width>60).map(([e])=>e)[0]; const h=document.querySelector('h1');
   const r1=(logo||h).getBoundingClientRect(), r2=h.getBoundingClientRect(); return {lx:r1.left,ly:r1.top+scrollY,lw:r1.width,lh:r1.height,hx:r2.left,hy:r2.top+scrollY,hw:r2.width,hh:r2.height, found:!!logo};});
 console.log(JSON.stringify(box));
 await p.screenshot({path:'shots/gong_logo.png',clip:{x:box.lx-8,y:box.ly-8,width:box.lw+16,height:box.lh+16}});
 await p.screenshot({path:'shots/gong_h1.png',clip:{x:box.hx-16,y:box.hy-16,width:Math.min(1090-box.hx,box.hw+32),height:box.hh+32}});
 for (const [k,re] of [['q67','67,149 sales demos'],['q76','76 seconds']]){
   const r = await p.evaluate((k)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.textContent.includes(k)){let e=n.parentElement;while(e&&getComputedStyle(e).display==='inline')e=e.parentElement;const b=e.getBoundingClientRect(); if(b.width>0&&b.height>0&&b.height<300){return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height};}}}return null;},re);
   console.log(k, JSON.stringify(r));
   if(r) await p.screenshot({path:`shots/gong_${k}.png`,fullPage:true,clip:{x:r.x-16,y:r.y-12,width:r.w+32,height:r.h+24}});
 }
 await b.close();
})();
