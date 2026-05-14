import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
p.on('console', m => console.log('PAGE>', m.type(), m.text()));
p.on('pageerror', e => console.log('PAGEERR>', e.message));
await p.setViewport({width:460,height:900});
await p.goto('http://localhost:8765/export.html#doctor-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,1500));
const before = await p.evaluate(()=>{
  const d1 = document.querySelector('[data-screen="doctor-d1"]');
  return {pills:d1?.querySelectorAll('[data-slot-pill]').length, ctas:d1?.querySelectorAll('[data-goto="booking-current"]').length, ctaText:d1?.querySelector('[data-goto="booking-current"]')?.textContent?.trim()};
});
console.log('before',before);
// click first pill
await p.evaluate(()=>{
  const d1=document.querySelector('[data-screen="doctor-d1"]');
  d1.querySelector('[data-slot-pill]')?.click();
});
await new Promise(r=>setTimeout(r,300));
const mid = await p.evaluate(()=>{
  const d1=document.querySelector('[data-screen="doctor-d1"]');
  const cta = d1?.querySelector('[data-goto="booking-current"]');
  return {selected: !!d1?.querySelector('[data-slot-pill].proto-slot-active'), ctaText: cta?.textContent?.trim(), disabled: cta?.disabled};
});
console.log('after slot click',mid);
// click cta
await p.evaluate(()=>{
  const d1=document.querySelector('[data-screen="doctor-d1"]');
  d1.querySelector('[data-goto="booking-current"]')?.click();
});
await new Promise(r=>setTimeout(r,500));
const final = await p.evaluate(()=>{
  const vis = [...document.querySelectorAll('[data-screen]')].filter(s=>s.style.display!=='none').map(s=>s.dataset.screen);
  return {hash: location.hash, visible: vis};
});
console.log('after book click',final);
await b.close();
