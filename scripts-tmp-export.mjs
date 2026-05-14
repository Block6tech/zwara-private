import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const URL = 'http://localhost:8080/';
const OUT = '/mnt/documents/zwara-tabeya-export.html';

const DOCTORS = [
  { id: 'd1', name: 'Dr. Anas Al-Aidan', ar: 'د. انس العيدان' },
  { id: 'd2', name: 'Dr. Ali Alajmi', ar: 'د. علي العجمي' },
  { id: 'd3', name: 'Dr. Sara Al-Otaibi', ar: 'د. سارة العتيبي' },
  { id: 'd4', name: 'Dr. Khalid Al-Mutairi', ar: 'د. خالد المطيري' },
  { id: 'd5', name: 'Dr. Fajer Al-Esa', ar: 'د. فجر العيسى' },
  { id: 'd6', name: 'Dr. Hassan Al-Maktoum', ar: 'د. حسن آل مكتوم' },
];

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
  })[ext] || 'application/octet-stream';
};

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
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const parts = []; let last = 0; let m; const tasks = [];
  while ((m = urlRe.exec(cssText)) !== null) {
    parts.push(cssText.slice(last, m.index));
    last = m.index + m[0].length;
    const ref = m[2];
    if (ref.startsWith('data:')) { parts.push(`url(${ref})`); continue; }
    const abs = new URL(ref, baseUrl).href;
    const idx = parts.length;
    parts.push('');
    tasks.push(fetchAsDataUri(abs).then(d => { parts[idx] = `url(${d})`; }));
  }
  parts.push(cssText.slice(last));
  await Promise.all(tasks);
  return parts.join('');
}

let sharedCss = null;

async function snap(page, id) {
  await new Promise(r => setTimeout(r, 700));

  // Inject data-goto attributes on known interactive elements
  await page.evaluate((doctorList) => {
    // Bottom nav buttons
    const navBtns = document.querySelectorAll('nav.border-t button');
    const navTargets = ['home', 'awareness', 'events'];
    navBtns.forEach((b, i) => { if (navTargets[i]) b.dataset.goto = navTargets[i]; });

    // Header menu icon
    document.querySelectorAll('button').forEach(b => {
      if (b.querySelector('svg.lucide-menu')) b.dataset.goto = 'menu';
      if (b.querySelector('svg.lucide-arrow-left') && !b.dataset.goto) b.dataset.goto = '__back__';
    });

    // Doctor cards: <button> elements containing a doctor's name + price (KWD/د.ك)
    const btns = [...document.querySelectorAll('button')];
    for (const d of doctorList) {
      for (const el of btns) {
        if (el.dataset.goto) continue;
        const txt = el.textContent || '';
        if ((txt.includes(d.name) || txt.includes(d.ar)) && /KWD|د\.ك/.test(txt)) {
          el.dataset.goto = 'doctor-' + d.id;
          
        }
      }
    }

    // Awareness sub-tabs (Videos / Q&A): two header chip buttons
    const awBtns = [...document.querySelectorAll('button')].filter(b => {
      const t = (b.textContent||'').trim();
      return /Video Library|Anonymous Q&A|مكتبة الفيديو|أسئلة وأجوبة/.test(t);
    });
    awBtns.forEach(b => {
      const t = (b.textContent||'').trim();
      b.dataset.goto = /Video|فيديو/.test(t) ? 'awareness' : 'awareness-qa';
    });

    // "See all" -> All doctors
    [...document.querySelectorAll('button')].forEach(b => {
      const t = (b.textContent||'').trim();
      if (/^(See all|عرض الكل)$/.test(t)) b.dataset.goto = 'allDoctors';
    });

    // Slot pills + Book + Confirm + auth flow
    [...document.querySelectorAll('button')].forEach(b => {
      const t = (b.textContent||'').trim();
      if (b.dataset.goto) return;
      if (/(AM|PM|ص|م)$/.test(t) && t.length < 12) {
        // slot pill - mark as selectable (no nav)
        b.dataset.gotoNoop = '1';
      }
      if (/^(Book|احجز)/.test(t)) b.dataset.goto = 'booking-current';
      if (/Confirm booking|تأكيد الحجز/.test(t)) b.dataset.goto = 'bookings';
      if (/Send code|إرسال الرمز/.test(t)) b.dataset.goto = 'otp';
      if (/^(Verify|تحقق)/.test(t)) b.dataset.goto = 'home';
      if (/Sign up|تسجيل الدخول|Sign in/.test(t)) b.dataset.goto = 'register';
      if (/My bookings|حجوزاتي/.test(t)) b.dataset.goto = 'bookings';
      if (/My profile|الملف الشخصي/.test(t)) b.dataset.goto = 'profile';
      if (/Help|المساعدة|مساعدة/.test(t)) b.dataset.goto = 'help';
    });
  }, DOCTORS);

  // Inline images
  const imgSrcs = await page.evaluate(() =>
    [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(Boolean)
  );
  for (const src of [...new Set(imgSrcs)]) {
    if (src.startsWith('data:')) continue;
    const data = await fetchAsDataUri(src);
    await page.evaluate(({ from, to }) => {
      document.querySelectorAll('img').forEach(img => {
        if (img.currentSrc === from || img.src === from) img.src = to;
        if (img.srcset) img.removeAttribute('srcset');
      });
    }, { from: src, to: data });
  }

  // Inline url() in inline style attrs
  const inlineEls = await page.$$('[style*="url("]');
  for (let i = 0; i < inlineEls.length; i++) {
    const styleStr = await inlineEls[i].evaluate(el => el.getAttribute('style'));
    const fixed = await inlineCssUrls(styleStr, URL);
    await inlineEls[i].evaluate((el, s) => el.setAttribute('style', s), fixed);
  }

  // Capture CSS once (live styleSheets)
  if (!sharedCss) {
    const liveCss = await page.evaluate(() => {
      const out = [];
      for (const ss of document.styleSheets) {
        try { out.push([...ss.cssRules].map(r => r.cssText).join('\n')); } catch {}
      }
      return out.join('\n');
    });
    sharedCss = await inlineCssUrls(liveCss, URL);
  }

  const html = await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"],script,style').forEach(n => n.remove());
    // disable inputs to keep form snapshot
    document.querySelectorAll('input,textarea').forEach(el => el.setAttribute('readonly', 'readonly'));
    return document.body.innerHTML;
  });

  return { id, html };
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

const clickMenu = async p => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.querySelector('svg.lucide-menu'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 350));
};

await runState('home');
await runState('awareness', async p => {
  const b = await p.$$('nav.border-t button'); await b[1].click();
});
await runState('awareness-qa', async p => {
  const b = await p.$$('nav.border-t button'); await b[1].click();
  await new Promise(r => setTimeout(r, 200));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /^(Q&A|الأسئلة|أسئلة)/.test((b.textContent||'').trim()));
    if (btn) btn.click();
  });
});
await runState('events', async p => {
  const b = await p.$$('nav.border-t button'); await b[2].click();
});
await runState('menu', clickMenu);

// Per doctor screen + booking confirm screen
async function gotoDoctor(p, doctorName) {
  await p.evaluate((name) => {
    const cards = [...document.querySelectorAll('button, [role="button"], div')]
      .filter(el => el.querySelector && el.querySelector('img') && (el.textContent||'').includes(name));
    if (cards[0]) cards[0].click();
  }, doctorName);
  await p.waitForFunction(() =>
    document.body.innerText.includes('Available slots') ||
    document.body.innerText.includes('المواعيد المتاحة'), { timeout: 5000 }).catch(() => {});
}

for (const d of DOCTORS) {
  await runState('doctor-' + d.id, async p => {
    await gotoDoctor(p, d.name);
  });
  await runState('booking-' + d.id, async p => {
    await gotoDoctor(p, d.name);
    await p.evaluate(() => {
      const slot = [...document.querySelectorAll('button')].find(b => /(AM|PM|ص|م)$/.test((b.textContent||'').trim()) && (b.textContent||'').length < 12);
      if (slot) slot.click();
    });
    await new Promise(r => setTimeout(r, 200));
    await p.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => /^(Book|احجز)/.test((b.textContent||'').trim()));
      if (btn) btn.click();
    });
    await p.waitForFunction(() =>
      document.body.innerText.includes('Confirm booking') ||
      document.body.innerText.includes('تأكيد الحجز'), { timeout: 5000 }).catch(() => {});
  });
}

await runState('allDoctors', async p => {
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /^(See all|عرض الكل)$/.test((b.textContent||'').trim()));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('register', async p => {
  await clickMenu(p);
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول|Sign in/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('otp', async p => {
  await clickMenu(p);
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول|Sign in/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const set = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;
      setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }));
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
  await clickMenu(p);
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /My bookings|حجوزاتي/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('profile', async p => {
  await clickMenu(p);
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /My profile|الملف الشخصي/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await runState('help', async p => {
  await clickMenu(p);
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /Help|المساعدة|مساعدة/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 350));
});

await browser.close();

// Build router: each doctor card on doctor-X / home / allDoctors should also set
// "current doctor" so a generic Book button maps to booking-{currentDoctor}.

const SCREEN_IDS = states.map(s => s.id);

const NAV_JS = `
(function(){
  const screens = ${JSON.stringify(SCREEN_IDS)};
  const history = ['home'];
  let currentDoctor = 'd1';

  function show(id){
    if (id === '__back__') { history.pop(); id = history[history.length-1] || 'home'; }
    else if (id === 'booking-current') { id = 'booking-' + currentDoctor; }
    if (id.startsWith('doctor-')) currentDoctor = id.slice(7);
    if (!screens.includes(id)) { console.warn('no screen', id); return; }
    if (history[history.length-1] !== id) history.push(id);
    if (history.length > 50) history.shift();
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.style.display = el.dataset.screen === id ? '' : 'none';
    });
    document.querySelectorAll('[data-nav-btn]').forEach(b => {
      b.classList.toggle('active', b.dataset.navBtn === id);
    });
    window.location.hash = id;
    document.scrollingElement && (document.scrollingElement.scrollTop = 0);
  }
  window.__show = show;

  function findGoto(el){
    while (el && el !== document.body) {
      if (el.dataset && el.dataset.goto) return el.dataset.goto;
      if (el.dataset && el.dataset.gotoNoop) return '__noop__';
      el = el.parentElement;
    }
    return null;
  }
  document.addEventListener('click', e => {
    const t = findGoto(e.target);
    if (t) {
      e.preventDefault(); e.stopPropagation();
      if (t === '__noop__') return; // slot pill: do nothing visible
      show(t);
    }
  }, true);

  // Hash entry
  const initial = (location.hash || '#home').slice(1);
  show(screens.includes(initial) ? initial : 'home');
})();
`;

const TOOLBAR_GROUPS = [
  ['home', 'awareness', 'awareness-qa', 'events', 'menu', 'allDoctors'],
  ['register', 'otp', 'profile', 'bookings', 'help'],
  DOCTORS.map(d => 'doctor-' + d.id),
];

const TOOLBAR = `
<div id="proto-toolbar" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;background:#111;color:#fff;border-radius:14px;padding:6px 8px;display:flex;flex-direction:column;gap:4px;font-family:system-ui,sans-serif;font-size:11px;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:96vw">
  ${TOOLBAR_GROUPS.map(grp => `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center">${grp.map(id =>
    `<button data-nav-btn="${id}" onclick="window.__show('${id}')" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:3px 8px;cursor:pointer;font:inherit;white-space:nowrap">${id}</button>`
  ).join('')}</div>`).join('')}
</div>
<style>#proto-toolbar button.active{background:#fff;color:#111;border-color:#fff}</style>
`;

const screensHtml = states.map(s =>
  `<div data-screen="${s.id}" style="display:none">${s.html}</div>`
).join('\n');

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Zwara Tabeya — Interactive Prototype</title>
<style>
${sharedCss}
html,body{margin:0;background:#f3f4f6}
[data-screen]{min-height:100vh}
[data-goto]{cursor:pointer}
</style>
</head>
<body>

${screensHtml}
<script>${NAV_JS}<\/script>
</body>
</html>`;

fs.writeFileSync(OUT, finalHtml);
console.log('WROTE', OUT, (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + ' MB');
console.log('screens:', SCREEN_IDS.length, 'assets:', assetCache.size);
