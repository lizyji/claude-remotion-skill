const { chromium } = require('playwright');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const Q=process.argv.slice(2);
(async()=>{
 const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy:{server:process.env.HTTPS_PROXY}, args:['--ignore-certificate-errors']});
 for (const q of Q){
  const p = await b.newPage({viewport:{width:1280,height:1600},ignoreHTTPSErrors:true,userAgent:UA});
  await p.goto('https://www.pexels.com/search/videos/'+encodeURIComponent(q)+'/?orientation=landscape',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(6000);
  const items = await p.evaluate(()=>[...document.querySelectorAll('a[href*="/video/"]')].map(a=>a.href).filter(h=>!h.includes('/download/')).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12));
  console.log('##',q); console.log(items.join('\n'));
  await p.screenshot({path:`shots/px_${q.replace(/ /g,'_')}.png`});
  await p.close();
 }
 await b.close();
})();
