import puppeteer from 'puppeteer-core';
import fs from 'fs';
fs.copyFileSync('/mnt/documents/zwara-tabeya-export.html','/tmp/export.html');
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
await p.setViewport({width:460,height:900});
await p.goto('http://localhost:8765/export.html#home',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,800));
// click first specialty
let r1 = await p.evaluate(()=>{
  const s=document.querySelector('[data-screen="home"]');
  const h=[...s.querySelectorAll('h2')].find(x=>/Specialties/.test(x.textContent));
  const grid=h.closest('section').querySelector('.grid');
  const btn=grid.querySelectorAll('button')[1];
  btn.click();
  return {goto: btn.dataset.goto};
});
await new Promise(r=>setTimeout(r,300));
const vis1 = await p.evaluate(()=>[...document.querySelectorAll('[data-screen]')].filter(s=>s.style.display!=='none').map(s=>s.dataset.screen));
console.log('specialty click', r1, '→', vis1);

// doctor → reviews
await p.goto('http://localhost:8765/export.html#doctor-d1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,500));
const r2 = await p.evaluate(()=>{
  const s=document.querySelector('[data-screen="doctor-d1"]');
  const btn=[...s.querySelectorAll('button')].find(b=>/^Reviews$/.test((b.textContent||'').trim()));
  const goto=btn?.dataset.goto;
  btn?.click();
  return {goto};
});
await new Promise(r=>setTimeout(r,300));
const vis2 = await p.evaluate(()=>[...document.querySelectorAll('[data-screen]')].filter(s=>s.style.display!=='none').map(s=>s.dataset.screen));
console.log('reviews click', r2, '→', vis2);
// confirm reviews screen has review content
const reviewsContent = await p.evaluate(()=>{
  const s=document.querySelector('[data-screen="doctor-d1-reviews"]');
  return s?.innerText.slice(0,200);
});
console.log('reviews content:', reviewsContent);
await b.close();
