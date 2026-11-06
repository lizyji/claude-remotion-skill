const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 // FreightWaves headline + date
 let p = await b.newPage({viewport:{width:720,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
 await p.goto('https://www.freightwaves.com/news/technology-ups-orion-defies-law-of-physics',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
 for (const n of ['Accept','Reject All','Deny All','I Accept','Close']) { try{ await p.getByRole('button',{name:n}).first().click({timeout:1500}); }catch(e){} }
 const box = await p.evaluate(()=>{const h=document.querySelector('h1'); const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n,d=null;while(n=w.nextNode()){if(/December 14, 2018/.test(n.textContent)){d=n.parentElement;break;}}
   const r1=h.getBoundingClientRect(), r2=d?d.getBoundingClientRect():r1; return {x:Math.min(r1.left,r2.left)+scrollX,y:Math.min(r1.top,r2.top)+scrollY,x2:Math.max(r1.right,r2.right)+scrollX,y2:Math.max(r1.bottom,r2.bottom)+scrollY, dfound:!!d};});
 console.log(JSON.stringify(box));
 await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el); if(s.position==='fixed'||s.position==='sticky') el.style.visibility='hidden';}});
 await p.screenshot({path:'shots/ups_fw_head.png',fullPage:true,clip:{x:Math.max(0,box.x-24),y:box.y-24,width:Math.min(720,box.x2-box.x+48),height:box.y2-box.y+48}});
 await p.close();
 // Pexels: list results
 p = await b.newPage({viewport:{width:1280,height:1200},ignoreHTTPSErrors:true,userAgent:UA});
 await p.goto('https://www.pexels.com/search/videos/delivery%20truck%20highway/',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
 const items = await p.evaluate(()=>[...document.querySelectorAll('a[href*="/video/"]')].map(a=>a.href).filter((v,i,a)=>a.indexOf(v)===i).slice(0,16));
 console.log(items.join('\n'));
 await p.screenshot({path:'shots/pexels_grid.png'});
 await b.close();
})();
