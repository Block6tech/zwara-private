import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const URL = 'http://localhost:8080/';
const OUT = '/mnt/documents/zwara-tabeya-export.html';

const browser = await puppeteer.launch({
  executablePath: '/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  headless: 'new',
});

const mimeFor = (url) => {
  const ext = path.extname(new URL(url, 'http://x').pathname).toLowerCase();
  return ({
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.otf': 'font/otf', '.ico': 'image/x-icon',
  })[ext] || 'application/octet-stream';
};

// cache fetched assets
const assetCache = new Map();
async function fetchAsDataUri(absUrl) {
  if (assetCache.has(absUrl)) return assetCache.get(absUrl);
  try {
    const res = await fetch(absUrl);
    if (!res.ok) throw new Error(res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get('content-type')?.split(';')[0] || mimeFor(absUrl);
    const data = `data:${mime};base64,${buf.toString('base64')}`;
    assetCache.set(absUrl, data);
    return data;
  } catch (e) {
    console.warn('fetch fail', absUrl, e.message);
    assetCache.set(absUrl, absUrl);
    return absUrl;
  }
}

async function inlineCssUrls(cssText, baseUrl) {
  // url(...) replacements
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const parts = [];
  let last = 0; let m;
  const tasks = [];
  while ((m = urlRe.exec(cssText)) !== null) {
    parts.push(cssText.slice(last, m.index));
    last = m.index + m[0].length;
    const ref = m[2];
    if (ref.startsWith('data:')) { parts.push(`url(${ref})`); continue; }
    const abs = new URL(ref, baseUrl).href;
    const idx = parts.length;
    parts.push(''); // placeholder
    tasks.push(fetchAsDataUri(abs).then(d => { parts[idx] = `url(${d})`; }));
  }
  parts.push(cssText.slice(last));
  await Promise.all(tasks);
  return parts.join('');
}

async function snap(page, id) {
  await new Promise(r => setTimeout(r, 500));
  // Collect external CSS as text
  const cssLinks = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href)
  );
  const cssBlocks = [];
  for (const href of cssLinks) {
    try {
      const css = await (await fetch(href)).text();
      cssBlocks.push({ css, base: href });
    } catch {}
  }
  // Also style tags (inline)
  const styleTags = await page.evaluate(() =>
    [...document.querySelectorAll('style')].map(s => s.textContent || '')
  );
  for (const css of styleTags) cssBlocks.push({ css, base: URL });

  // Collect all img srcs and replace on page with data URIs
  const imgSrcs = await page.evaluate(() =>
    [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(Boolean)
  );
  const uniq = [...new Set(imgSrcs)];
  for (const src of uniq) {
    if (src.startsWith('data:')) continue;
    const data = await fetchAsDataUri(src);
    await page.evaluate(({ from, to }) => {
      document.querySelectorAll('img').forEach(img => {
        if (img.currentSrc === from || img.src === from) img.src = to;
        if (img.srcset) img.removeAttribute('srcset');
      });
    }, { from: src, to: data });
  }

  // Inline background-image url() found in inline style attributes
  await page.evaluate(() => {
    document.querySelectorAll('[style*="url("]').forEach(el => {
      el.dataset._inlineStyle = el.getAttribute('style');
    });
  });
  const inlineStyleEls = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-_inline-style]').forEach((el, i) => {
      el.setAttribute('data-_idx', String(i));
      out.push(el.getAttribute('style'));
    });
    return out;
  });
  for (let i = 0; i < inlineStyleEls.length; i++) {
    const newStyle = await inlineCssUrls(inlineStyleEls[i], URL);
    await page.evaluate(({ idx, s }) => {
      const el = document.querySelector(`[data-_idx="${idx}"]`);
      if (el) { el.setAttribute('style', s); el.removeAttribute('data-_idx'); el.removeAttribute('data-_inline-style'); }
    }, { idx: i, s: newStyle });
  }

  const html = await page.evaluate(() => {
    // strip <link rel=stylesheet> and <script> and existing <style>
    document.querySelectorAll('link[rel="stylesheet"],script,style').forEach(n => n.remove());
    return document.documentElement.outerHTML;
  });
  return { id, html, cssBlocks };
}

async function newPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 460, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('nav button', { timeout: 15000 });
  return page;
}

const states = [];

async function runState(id, fn) {
  const p = await newPage();
  if (fn) await fn(p);
  states.push(await snap(p, id));
  await p.close();
  console.log('captured', id);
}

await runState('home');
await runState('awareness', async p => {
  const btns = await p.$$('nav.border-t button');
  await btns[1].click();
});
await runState('events', async p => {
  const btns = await p.$$('nav.border-t button');
  await btns[2].click();
});
await runState('menu', async p => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.querySelector('svg.lucide-menu'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

async function gotoDoctor(p) {
  await p.evaluate(() => {
    const cards = [...document.querySelectorAll('button, [role="button"], div')]
      .filter(el => el.querySelector('img') && el.textContent.includes('KWD'));
    if (cards[0]) cards[0].click();
  });
  await p.waitForFunction(() =>
    document.body.innerText.includes('Available slots') ||
    document.body.innerText.includes('المواعيد المتاحة'), { timeout: 5000 }).catch(() => {});
}

await runState('doctor', gotoDoctor);
await runState('booking', async p => {
  await gotoDoctor(p);
  await p.evaluate(() => {
    const slot = [...document.querySelectorAll('button')].find(b => /(AM|PM|ص|م)$/.test(b.textContent.trim()));
    if (slot) slot.click();
  });
  await new Promise(r => setTimeout(r, 200));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /^(Book|احجز)/.test(b.textContent.trim()));
    if (btn) btn.click();
  });
  await p.waitForFunction(() =>
    document.body.innerText.includes('Confirm booking') ||
    document.body.innerText.includes('تأكيد الحجز'), { timeout: 5000 }).catch(() => {});
});

await runState('allDoctors', async p => {
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /See all|عرض الكل/.test(b.textContent.trim()));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('register', async p => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.querySelector('svg.lucide-menu'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('otp', async p => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.querySelector('svg.lucide-menu'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const set = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    if (inputs[0]) set(inputs[0], 'Anas Al-Ali');
    if (inputs[1]) set(inputs[1], '+96512345678');
  });
  await new Promise(r => setTimeout(r, 200));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Send code|إرسال الرمز/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
});

await runState('bookings', async p => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.querySelector('svg.lucide-menu'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /My bookings|حجوزاتي/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await browser.close();

// Combine. Use the first state's CSS blocks (they're identical for SPA).
const allCss = states[0].cssBlocks;
let inlinedCss = '';
for (const { css, base } of allCss) {
  inlinedCss += await inlineCssUrls(css, base) + '\n';
}

// Extract <body> contents for each state
function extractBody(htmlDoc) {
  const m = htmlDoc.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : htmlDoc;
}

const screens = states.map(s => ({
  id: s.id,
  body: extractBody(s.html),
}));

const NAV_JS = `
(function(){
  const order = ['home','awareness','events','menu','doctor','booking','allDoctors','register','otp','bookings'];
  function show(id){
    document.querySelectorAll('[data-screen]').forEach(el=>{
      el.style.display = el.dataset.screen === id ? '' : 'none';
    });
    document.querySelectorAll('[data-nav-btn]').forEach(b=>{
      b.classList.toggle('active', b.dataset.navBtn === id);
    });
    history.replaceState(null,'','#'+id);
    window.scrollTo(0,0);
  }
  function resolveTarget(el){
    while(el && el !== document.body){
      const t = el.dataset && el.dataset.goto;
      if (t) return t;
      const txt = (el.textContent||'').trim();
      // Header menu icon -> menu screen
      if (el.tagName==='BUTTON' && el.querySelector && el.querySelector('svg.lucide-menu')) return 'menu';
      if (el.tagName==='BUTTON' && el.querySelector && el.querySelector('svg.lucide-arrow-left')) return 'home';
      if (el.tagName==='BUTTON'){
        if (/^(Book|احجز)/.test(txt) && document.querySelector('[data-screen="booking"]')) return 'booking';
        if (/Confirm booking|تأكيد الحجز/.test(txt)) return 'bookings';
        if (/Send code|إرسال الرمز/.test(txt)) return 'otp';
        if (/Verify|تحقق/.test(txt)) return 'home';
        if (/Sign up|تسجيل الدخول/.test(txt)) return 'register';
        if (/My bookings|حجوزاتي/.test(txt)) return 'bookings';
        if (/See all|عرض الكل/.test(txt)) return 'allDoctors';
      }
      // doctor card detection
      if (el.tagName === 'BUTTON' || el.getAttribute && el.getAttribute('role')==='button'){
        if (el.querySelector && el.querySelector('img') && /KWD|د\\.ك/.test(el.textContent||'')) return 'doctor';
      }
      el = el.parentElement;
    }
    return null;
  }
  document.addEventListener('click', e=>{
    const t = resolveTarget(e.target);
    if (t){
      e.preventDefault();
      e.stopPropagation();
      show(t);
    }
  }, true);
  // Make inputs read-only to preserve snapshots
  document.querySelectorAll('input,textarea').forEach(i=>{ try{ i.setAttribute('readonly','readonly'); }catch(_){} });
  // initial
  const init = (location.hash||'#home').slice(1);
  show(order.includes(init)?init:'home');
  window.__show = show;
})();
`;

const TOOLBAR = `
<div id="proto-toolbar" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;background:#111;color:#fff;border-radius:999px;padding:6px 10px;display:flex;gap:4px;flex-wrap:wrap;font-family:system-ui,sans-serif;font-size:11px;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:95vw">
  ${['home','awareness','events','menu','doctor','booking','allDoctors','register','otp','bookings'].map(id=>
    `<button data-nav-btn="${id}" onclick="window.__show('${id}')" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 10px;cursor:pointer;font:inherit">${id}</button>`
  ).join('')}
</div>
<style>#proto-toolbar button.active{background:#fff;color:#111;border-color:#fff}</style>
`;

const screensHtml = screens.map(s =>
  `<div data-screen="${s.id}" style="display:none">${s.body}</div>`
).join('\n');

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Zwara Tabeya — Interactive Prototype</title>
<style>
${inlinedCss}
html,body{margin:0;background:#f3f4f6}
[data-screen]{min-height:100vh}
</style>
</head>
<body>
${TOOLBAR}
${screensHtml}
<script>${NAV_JS}<\/script>
</body>
</html>`;

fs.writeFileSync(OUT, finalHtml);
const sizeMb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log('WROTE', OUT, sizeMb + ' MB');
console.log('assets cached:', assetCache.size);
