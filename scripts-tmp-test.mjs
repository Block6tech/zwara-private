import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/bin/chromium',args:['--no-sandbox'],headless:'new'});
const p = await b.newPage();
p.on('console', m => console.log('PAGE>', m.type(), m.text()));
p.on('pageerror', e => console.log('PAGEERR>', e.message));
await p.goto('file:///mnt/documents/zwara-tabeya-export.html',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,1500));
const dump = await p.evaluate(()=>({
  bodyLen: document.body.innerHTML.length,
  screens: document.querySelectorAll('[data-screen]').length,
  childCount: document.body.children.length,
  firstChild: document.body.firstElementChild?.outerHTML?.slice(0,200),
}));
console.log(JSON.stringify(dump,null,2));
await b.close();
