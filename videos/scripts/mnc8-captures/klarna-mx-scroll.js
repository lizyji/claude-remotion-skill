const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 const p = await b.newPage({viewport:{width:1080,height:960},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
 await p.goto('https://www.klarna.com/mx/',{waitUntil:'networkidle',timeout:90000}).catch(()=>{}); await p.waitForTimeout(4000);
 for (const n of ['Rechazar todo','Rechazar','Deny All','Aceptar todo']) { try{ await p.getByRole('button',{name:n}).first().click({timeout:2500}); console.log('clicked',n); break;}catch(e){} }
 // slow scroll to trigger lazy images
 for (let y=0;y<4000;y+=400){ await p.evaluate(v=>window.scrollTo(0,v),y); await p.waitForTimeout(500);} 
 await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el); if(s.position==='fixed') el.style.display='none';} for (const el of document.querySelectorAll('[id*=onetrust i]')) el.style.display='none'; });
 await p.waitForTimeout(800);
 const ys = await p.evaluate(()=>[...document.querySelectorAll('p,span,div,h2,h3')].filter(e=>e.children.length===0&&/plazos/.test(e.textContent)).map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.top+scrollY),e.textContent.slice(0,90)]}));
 console.log(JSON.stringify(ys));
 await p.screenshot({path:'shots/mx_full.png',fullPage:true});
 await b.close();
})();
