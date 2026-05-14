import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
await p.setViewport({width:460,height:900});
await p.goto('file:///mnt/documents/zwara-tabeya-export.html#doctor-d1',{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,500));
// find slot pill in visible screen
const info = await p.evaluate(()=>{
  const screen = document.querySelector('[data-screen="doctor-d1"]');
  const pills = screen?.querySelectorAll('[data-slot-pill]');
  const cta = screen?.querySelector('[data-goto="booking-current"]');
  return {pills: pills?.length, ctaText: cta?.textContent?.trim(), ctaDisabled: cta?.disabled, screenVisible: screen?.style.display};
});
console.log('before', info);
// click first pill
await p.evaluate(()=>{
  const screen = document.querySelector('[data-screen="doctor-d1"]');
  screen.querySelector('[data-slot-pill]')?.click();
});
await new Promise(r=>setTimeout(r,300));
const info2 = await p.evaluate(()=>{
  const screen = document.querySelector('[data-screen="doctor-d1"]');
  const cta = screen?.querySelector('[data-goto="booking-current"]');
  const sel = screen?.querySelector('[data-slot-pill].proto-slot-active');
  return {selected: !!sel, ctaText: cta?.textContent?.trim(), ctaDisabled: cta?.disabled};
});
console.log('after slot click', info2);
await p.evaluate(()=>{
  const screen = document.querySelector('[data-screen="doctor-d1"]');
  screen.querySelector('[data-goto="booking-current"]')?.click();
});
await new Promise(r=>setTimeout(r,500));
console.log('hash now', await p.evaluate(()=>location.hash));
const visScreens = await p.evaluate(()=>[...document.querySelectorAll('[data-screen]')].filter(s=>s.style.display!=='none').map(s=>s.dataset.screen));
console.log('visible screens', visScreens);
await b.close();
