const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const jobs = [
 ['b2','https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/', /February 27, 2024/],
 
 
];
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 for (const [k,u,dre] of jobs){
  const p = await b.newPage({viewport:{width:1280,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true,userAgent:UA});
  try{
   const r = await p.goto(u,{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
   console.log(k, r.status(), await p.title());
   try{await p.getByRole('button',{name:'Deny All'}).click({timeout:5000});}catch(e){console.log('no deny');} await p.waitForTimeout(1000);
   if(0) await p.evaluate(()=>{ for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el); if(s.position==='fixed'||s.position==='sticky') el.style.display='none';}
     for (const el of document.querySelectorAll('[id*=cookie i],[class*=cookie i],[id*=onetrust i],[class*=consent i],iframe')) el.style.display='none'; });
   await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:'shots/crop_b2.png', clip:{x:50,y:225,width:1180,height:170}});
  }catch(e){console.log(k,'ERR',e.message.slice(0,200));}
  await p.close();
 }
 await b.close();
})();
