import puppeteer from 'puppeteer-core';
import fs from 'fs';

const URL = 'http://localhost:8080/';
const OUT = '/tmp/snapshots.json';

const browser = await puppeteer.launch({
  executablePath: '/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  headless: 'new',
});

async function newPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 460, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('nav button', { timeout: 15000 });
  return page;
}

async function snap(page, id) {
  // wait for paint
  await new Promise(r => setTimeout(r, 350));
  const html = await page.evaluate(() => {
    // grab the mobile shell content (the rounded device frame)
    const root = document.querySelector('#app, body > div') || document.body;
    return root.outerHTML;
  });
  return { id, html };
}

const snapshots = [];

// HOME
{
  const p = await newPage();
  snapshots.push(await snap(p, 'home'));
  await p.close();
}

// AWARENESS
{
  const p = await newPage();
  // bottom nav: second button
  const btns = await p.$$('nav.border-t button');
  await btns[1].click();
  snapshots.push(await snap(p, 'awareness'));
  await p.close();
}

// EVENTS
{
  const p = await newPage();
  const btns = await p.$$('nav.border-t button');
  await btns[2].click();
  snapshots.push(await snap(p, 'events'));
  await p.close();
}

// MENU (open side menu via top-right menu button)
{
  const p = await newPage();
  // top header has Menu icon button - find by aria/svg
  await p.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    // find a header button containing svg.lucide-menu
    const menuBtn = buttons.find(b => b.querySelector('svg.lucide-menu'));
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 350));
  snapshots.push(await snap(p, 'menu'));
  await p.close();
}

// DOCTOR (click first doctor card)
async function gotoDoctor(p) {
  await p.evaluate(() => {
    // Top doctors section: find card buttons
    const cards = [...document.querySelectorAll('button, [role="button"], div')]
      .filter(el => el.querySelector('img') && el.textContent.includes('KWD'));
    const first = cards[0];
    if (first) first.click();
  });
  // fallback: find any element with onclick by class patterns
  await new Promise(r => setTimeout(r, 200));
  // doctor screen has "Available slots" text
  await p.waitForFunction(() => document.body.innerText.includes('Available slots') || document.body.innerText.includes('المواعيد المتاحة'), { timeout: 5000 }).catch(()=>{});
}

{
  const p = await newPage();
  await gotoDoctor(p);
  snapshots.push(await snap(p, 'doctor'));
  await p.close();
}

// BOOKING CONFIRM (click doctor, select slot, click Book)
{
  const p = await newPage();
  await gotoDoctor(p);
  // click first slot button then book
  await p.evaluate(() => {
    // slot pills
    const slotBtns = [...document.querySelectorAll('button')].filter(b => /(AM|PM|ص|م)$/.test(b.textContent.trim()));
    if (slotBtns[0]) slotBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 200));
  await p.evaluate(() => {
    const bookBtn = [...document.querySelectorAll('button')].find(b => /^(Book|احجز)/.test(b.textContent.trim()));
    if (bookBtn) bookBtn.click();
  });
  await p.waitForFunction(() => document.body.innerText.includes('Confirm booking') || document.body.innerText.includes('تأكيد الحجز'), { timeout: 5000 }).catch(()=>{});
  snapshots.push(await snap(p, 'booking'));
  await p.close();
}

// REGISTER
{
  const p = await newPage();
  await p.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const menuBtn = buttons.find(b => b.querySelector('svg.lucide-menu'));
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول/.test(b.textContent));
    if (btn) btn.click();
  });
  await p.waitForFunction(() => document.body.innerText.includes('Continue as patient') || document.body.innerText.includes('متابعة كمريض'), { timeout: 5000 }).catch(()=>{});
  snapshots.push(await snap(p, 'register'));
  await p.close();
}

// OTP
{
  const p = await newPage();
  await p.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const menuBtn = buttons.find(b => b.querySelector('svg.lucide-menu'));
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Sign up|تسجيل الدخول/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  // fill name + phone
  await p.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const set = (el, val) => {
      const proto = Object.getPrototypeOf(el);
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, val);
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
  await p.waitForFunction(() => document.body.innerText.includes('Verify your number') || document.body.innerText.includes('تحقق من رقمك'), { timeout: 5000 }).catch(()=>{});
  snapshots.push(await snap(p, 'otp'));
  await p.close();
}

// BOOKINGS
{
  const p = await newPage();
  await p.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const menuBtn = buttons.find(b => b.querySelector('svg.lucide-menu'));
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /My bookings|حجوزاتي/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  snapshots.push(await snap(p, 'bookings'));
  await p.close();
}

fs.writeFileSync(OUT, JSON.stringify(snapshots));
console.log('captured', snapshots.map(s => [s.id, s.html.length]));
await browser.close();
