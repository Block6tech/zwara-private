import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
p.on('console', m => console.log('PAGE>', m.text()));
await p.setViewport({width:460,height:900});
await p.goto('file:///mnt/documents/zwara-tabeya-export.html#doctor-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,800));
const dump = await p.evaluate(()=>{
  const all = [...document.querySelectorAll('[data-screen]')].map(s=>({id:s.dataset.screen,disp:s.style.display}));
  const d1 = document.querySelector('[data-screen="doctor-d1"]');
  return {all, d1exists: !!d1, pills: d1?.querySelectorAll('[data-slot-pill]').length, ctas: d1?.querySelectorAll('[data-goto="booking-current"]').length};
});
console.log(JSON.stringify(dump,null,2));
await b.close();
