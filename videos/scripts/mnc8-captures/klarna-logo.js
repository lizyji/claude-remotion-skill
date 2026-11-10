const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 const p = await b.newPage({viewport:{width:1280,height:900},ignoreHTTPSErrors:true,userAgent:UA});
 await p.goto('https://www.klarna.com/us/',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(5000);
 const info = await p.evaluate(()=>{const out=[]; for(const a of document.querySelectorAll('header a, a[aria-label*=Klarna i]')){const s=a.querySelector('svg,img'); if(s) out.push({href:a.href,label:a.getAttribute('aria-label'),tag:s.tagName,html:s.outerHTML.slice(0,4000)});} return out.slice(0,4);});
 console.log(JSON.stringify(info,null,1).slice(0,6000));
 const links = await p.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.textContent.trim()+' | '+a.href).filter(t=>/pay|4|installment|later/i.test(t)).slice(0,30));
 console.log(links.join('\n'));
 await b.close();
})();
