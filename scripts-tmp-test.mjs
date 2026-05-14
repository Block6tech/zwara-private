import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
await p.setViewport({width:460,height:900});
await p.goto('http://localhost:8765/export.html#booking-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,800));
const btns = await p.evaluate(()=>{
  const s = document.querySelector('[data-screen="booking-d1"]');
  return [...s.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim().slice(0,40), goto:b.dataset.goto}));
});
console.log(JSON.stringify(btns,null,2));
await b.close();
