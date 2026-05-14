import puppeteer from 'puppeteer-core';
import fs from 'fs';
fs.copyFileSync('/mnt/documents/zwara-tabeya-export.html','/tmp/export.html');
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
await p.setViewport({width:460,height:900});
await p.goto('http://localhost:8765/export.html#booking-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,800));
const dump = await p.evaluate(()=>{
  const s = document.querySelector('[data-screen="booking-d1"]');
  return {
    hasConfirm: s.innerText.includes('Confirm booking') || s.innerText.includes('تأكيد'),
    btns: [...s.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim().slice(0,30), goto:b.dataset.goto})).filter(x=>x.goto||x.t),
  };
});
console.log(JSON.stringify(dump,null,2));

// Now full journey: doctor-d1 → slot → book → confirm → register → send code → otp → verify → bookings
await p.goto('http://localhost:8765/export.html#doctor-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,500));
const journey = [];
async function step(label, fn){
  await fn();
  await new Promise(r=>setTimeout(r,300));
  const visible = await p.evaluate(()=>[...document.querySelectorAll('[data-screen]')].filter(s=>s.style.display!=='none').map(s=>s.dataset.screen));
  journey.push({label, visible});
}
await step('click slot', ()=>p.evaluate(()=>{
  const s=document.querySelector('[data-screen="doctor-d1"]');
  s.querySelector('[data-slot-pill]').click();
}));
await step('click book', ()=>p.evaluate(()=>{
  const s=document.querySelector('[data-screen="doctor-d1"]');
  s.querySelector('[data-goto="booking-current"]').click();
}));
await step('click confirm', ()=>p.evaluate(()=>{
  const s=document.querySelector('[data-screen="booking-d1"]');
  const btn=[...s.querySelectorAll('button')].find(b=>/Confirm|تأكيد/.test(b.textContent));
  btn.click();
}));
await step('click send code', ()=>p.evaluate(()=>{
  const s=document.querySelector('[data-screen="register"]');
  const btn=[...s.querySelectorAll('button')].find(b=>/Send code|إرسال/.test(b.textContent));
  btn.click();
}));
await step('click verify', ()=>p.evaluate(()=>{
  const s=document.querySelector('[data-screen="otp"]');
  const btn=[...s.querySelectorAll('button')].find(b=>/^Verify|تحقق/.test(b.textContent));
  btn?.click();
}));
console.log(JSON.stringify(journey,null,2));
await b.close();
