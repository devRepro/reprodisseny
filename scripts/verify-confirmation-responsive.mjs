// Run against the local production preview. No packages or real lead submissions.
// BASE_URL=http://127.0.0.1:3100 CHROME_PATH=... node scripts/verify-confirmation-responsive.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3100');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Local preview only');
const reportDir = path.resolve(process.env.REPORT_DIR || 'reports/confirmation-responsive');
await mkdir(reportDir, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), 'rd-confirmation-test-'));
const executable = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'],
{ windowsHide: true, stdio: 'ignore' });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let ws;
const checks = [], measurements = [], mockedRequests = [], browserErrors = [];
const check = (name, condition, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) console.error(`FAIL ${name}: ${detail}`);
};

try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await pause(100); }
  }
  assert.ok(port, 'Chrome must start');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(Error(`Timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve: (value) => { clearTimeout(timeout); resolve(value); },
      reject: (error) => { clearTimeout(timeout); reject(error); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.onmessage = async ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id); pending.delete(message.id);
      if (message.error) request?.reject(message.error); else request?.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    try {
      const url = new URL(request.url);
      // Intercept all writes before they can reach even the local API/server.
      if (!['GET', 'HEAD'].includes(request.method)) {
        if (url.origin === base.origin && ['/api/price-requests', '/api/cms/contact'].includes(url.pathname)) {
          mockedRequests.push({ path: url.pathname, method: request.method });
          const response = url.pathname.endsWith('/contact')
            ? { ok: true, duplicated: false, item: { id: 'local-42', requestKey: 'local-confirmation' } }
            : { ok: true, duplicated: false, itemId: 'local-42', requestKey: 'local-confirmation' };
          await pause(150);
          await send('Fetch.fulfillRequest', { requestId, responseCode: 201,
            responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
            body: Buffer.from(JSON.stringify(response)).toString('base64') });
        } else await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      } else if (url.origin !== base.origin && !['media.reprodisseny.com', 'webcms.blob.core.windows.net'].includes(url.hostname)) {
        await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      } else await send('Fetch.continueRequest', { requestId });
    } catch (error) { browserErrors.push(`Interception: ${error.message}`); }
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async (expression) => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(150); }
    throw Error(`Timed out waiting for ${expression}`);
  };
  const resize = async (width, zoom = 1) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height: Math.round(844 / zoom),
      deviceScaleFactor: zoom, mobile: zoom === 1 && width < 768 });
    await pause(100);
  };
  const navigate = async (route) => {
    await send('Page.navigate', { url: new URL(route, base).href });

    await waitFor(
      "document.readyState !== 'loading' && !!document.body"
    );

    await waitFor("!!document.querySelector('#__nuxt')?.__vue_app__");
    await evaluate('document.fonts.ready.then(() => true)');
    await pause(800);
  };
  const screenshot = async (name) => {
    const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(path.join(reportDir, `${name}.png`), Buffer.from(result.data, 'base64'));
  };
  const measure = async () => evaluate(`(() => {
    const root = document.documentElement;
    const surface = document.querySelector('.confirmation-surface');
    const rect = e => {const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const internal = [...surface.querySelectorAll('*')].filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
      .map(e => ({tag:e.tagName, class:e.getAttribute('class'), scroll:e.scrollWidth, client:e.clientWidth}));
    const actions = [...surface.querySelectorAll('.confirmation-action')].map(e => {
      const parent=e.parentElement, r=e.getBoundingClientRect(), p=parent.getBoundingClientRect(), s=getComputedStyle(parent);
      return {text:e.innerText, height:r.height, fits:r.left>=p.left+parseFloat(s.paddingLeft)-1 && r.right<=p.right-parseFloat(s.paddingRight)+1};
    });
    const blend=(fg,bg)=>{const a=fg[3]??1;return fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a))};
    const rgb=s=>(s.match(/[\\d.]+/g)||[]).map(Number);
    const background=e=>{let chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p);return chain.reduce((bg,p)=>blend(rgb(getComputedStyle(p).backgroundColor),bg),[255,255,255])};
    const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const contrast=[...surface.querySelectorAll('p, a.btn, button.btn, .calendar-thank-you__contact a')].map(e=>{const bg=background(e),fg=blend(rgb(getComputedStyle(e).color),bg),a=lum(bg),b=lum(fg);return {text:e.innerText.slice(0,45),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
    return {client:root.clientWidth,scroll:root.scrollWidth,surface:rect(surface),internal,actions,contrast,
      focused:document.activeElement?.classList.contains('confirmation-heading'),
      heading:rect(surface.querySelector('.confirmation-heading')),
      header:document.querySelector('[data-site-header]')?rect(document.querySelector('[data-site-header]')):null,
      toaster:(() => {const e=document.querySelector('[data-sonner-toaster]');return e?rect(e):null})(),
      toast:[...document.querySelectorAll('[data-sonner-toast]')].some(e=>e.innerText.includes('Enviando solicitud'))};
  })()`);
  const fill = async () => {
    // Native events exercise the real Vue form handlers; the network response is mocked above.
    await evaluate(`(() => { const form=document.querySelector('.rd-form-frame form');
      for(const e of form.querySelectorAll('input,textarea,select')) {
        if(e.type==='checkbox'){if(!e.checked)e.click();continue}
        if(!e.name||e.name==='website'||['file','hidden','submit','button','radio'].includes(e.type)||e.disabled||e.readOnly)continue;
        let value=/email/i.test(e.name)?'audit@example.test':/phone|telefono/i.test(e.name)?'600000000':/postal/i.test(e.name)?'08001':e.type==='number'?'100':/message|consulta|comentario/i.test(e.name)?'Prueba visual local sin envio real.':'Prueba visual local';
        if(e.tagName==='SELECT'){value=[...e.options].find(o=>o.value&&!o.disabled)?.value||''}
        const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);
        e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
      }
    })()`);
    // Calendar sizes are populated after choosing a model.
    await pause(150);
    await evaluate(`(() => {const e=document.querySelector('select[name=sizeId]');if(e&&!e.value){e.value=[...e.options].find(o=>o.value)?.value||'';e.dispatchEvent(new Event('change',{bubbles:true}))}})()`);
    await pause(150);
    await evaluate(`(() => {const b=document.querySelector('.rd-form-frame button[type=submit]');b.focus();b.click()})()`);
  };
  const cases = [
    ['quote', '/pedir-presupuesto'], ['contact', '/contacto'],
    ['product', '/productos/abanicos-personalizados'], ['solar', '/lp/laminas-solares'],
    ['education', '/lp/centres-educatius/material-escolar-inici-curs'],
    ['calendar', '/calendarios/calendarios-corporativos-2027'],
  ];
  for (const [name, route] of cases) {
    console.log(`Testing ${name}`);
    await resize(390); await navigate(route);
    await waitFor("!!document.querySelector('.rd-form-frame form')");
    const count = mockedRequests.length;
    await fill();
    await waitFor("!!document.querySelector('.confirmation-heading')");
    await pause(500);
    check(`${name}: one intercepted POST`, mockedRequests.length === count + 1);
    check(`${name}: one generate_lead`, await evaluate("(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length") === 1);
    const initial = await measure();
    check(`${name}: focus`, initial.focused);
    check(`${name}: loading notice removed`, !initial.toast);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
    check(`${name}: keyboard reaches action`, await evaluate("['A','BUTTON'].includes(document.activeElement?.tagName) && !!document.activeElement.closest('.confirmation-surface')"));
    for (const width of [320, 360, 375, 390, 428, 768, 1440]) {
      await resize(width);
      await evaluate("document.querySelector('.confirmation-heading').scrollIntoView({block:'start',behavior:'instant'})");
      await pause(100);
      const result = await measure(); measurements.push({ name, width, zoom: 1, ...result });
      check(`${name} ${width}: viewport`, result.scroll <= result.client, `${result.scroll}/${result.client}`);
      check(`${name} ${width}: internal`, !result.internal.length, JSON.stringify(result.internal));
      check(`${name} ${width}: actions`, result.actions.every(a=>a.fits&&a.height>=44), JSON.stringify(result.actions));
      check(`${name} ${width}: contrast`, result.contrast.every(c=>c.ratio>=4.5), JSON.stringify(result.contrast));
      check(`${name} ${width}: heading below header`, !result.header || result.heading.y >= result.header.bottom - 1,
        `${result.heading.y}/${result.header?.bottom}`);
      check(`${name} ${width}: sonner fits`, !result.toaster
        || (result.toaster.x >= -1 && result.toaster.right <= result.client + 1),
        JSON.stringify(result.toaster));
      await screenshot(`${name}-${width}`);
    }
    // Desktop browser zoom 200%: 1440 physical pixels / 2 = 720 CSS pixels.
    await resize(720, 2);
    await evaluate("document.querySelector('.confirmation-heading').scrollIntoView({block:'start',behavior:'instant'})");
    const zoom = await measure(); measurements.push({ name, width: 720, zoom: 2, ...zoom });
    check(`${name}: zoom 200%`, zoom.scroll<=zoom.client&&!zoom.internal.length&&zoom.actions.every(a=>a.fits)
      && (!zoom.header || zoom.heading.y >= zoom.header.bottom - 1), JSON.stringify(zoom.internal));
    await screenshot(`${name}-zoom200`);
    // Exercise unbroken dynamic strings without touching the form/submission logic.
    await resize(320);
    await evaluate(`(() => { const surface=document.querySelector('.confirmation-surface');
      const target=surface.querySelector('p .font-semibold') || [...surface.querySelectorAll('p')].find(e=>e.textContent.includes('Referència:')) || surface.querySelector('p');
      target.textContent='Referencia-'+'ABC123'.repeat(40);
    })()`);
    const long = await measure();
    check(`${name}: long reference/name`, long.scroll<=long.client&&!long.internal.length, JSON.stringify(long.internal));
    await screenshot(`${name}-long-text-320`);
    if (name === 'solar') check('solar: catalogue destination', await evaluate("document.querySelector('.confirmation-action[href]').getAttribute('href')") === '/productos');
  }

  // Header controls stay visible and functional at the narrowest viewport.
  await resize(320); await navigate('/gracias?kind=contacto');
  await evaluate('window.scrollTo(0,500)'); await pause(100);
  check('header: sticky', await evaluate("Math.abs(document.querySelector('[data-site-header]').getBoundingClientRect().top)<1"));
  for (const label of ['Alternar barra de búsqueda', 'Abrir menú de navegación']) {
    check(`header: ${label} visible`, await evaluate(`(() => {const r=document.querySelector('[aria-label="${label}"]').getBoundingClientRect();return r.width>=44&&r.left>=0&&r.right<=document.documentElement.clientWidth})()`));
    await evaluate(`document.querySelector('[aria-label="${label}"]').click()`); await pause(350);
    check(`header: ${label} no overflow`, await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'));
    if (label.includes('búsqueda')) {
      check('header: search opens', await evaluate("!![...document.querySelectorAll('header input')].find(e=>e.getBoundingClientRect().width>0)"));
      await screenshot('navigation-search-320');
      await evaluate(`document.querySelector('[aria-label="${label}"]').click()`);
    } else {
      check('header: menu opens', await evaluate("!!document.querySelector('[role=dialog][data-state=open]')"));
      await screenshot('navigation-menu-320');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
    }
  }
  check('header: quote accessible', await evaluate("document.querySelector('header .site-header__cta').getAttribute('href')==='/pedir-presupuesto'"));
  check('header: quote fits', await evaluate("(() => {const r=document.querySelector('header .site-header__cta').getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=document.documentElement.clientWidth})()"));
  for (const route of ['/gracias', '/lp/calendarios/gracias']) {
    await navigate(route);
    check(`${route}: noindex`, await evaluate("document.querySelector('meta[name=robots]').content.includes('noindex')"));
    check(`${route}: direct visit no conversion`, await evaluate("!(window.dataLayer||[]).some(e=>e.event==='generate_lead')"));
  }
  const robots = await (await fetch(new URL('/robots.txt', base))).text();
  check('robots: thanks routes crawlable', !/^Disallow:\s*\/(?:gracias|lp\/calendarios\/gracias)\s*$/im.test(robots));
  const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
  check('sitemap: thanks excluded', sitemap.includes('<urlset') && !/<loc>[^<]*\/(?:gracias|lp\/calendarios\/gracias)<\/loc>/i.test(sitemap));
  check('browser: no runtime errors', !browserErrors.length, JSON.stringify(browserErrors));
  await send('Browser.close'); ws.close();
} catch (error) {
  check('runner completed', false, String(error.stack || error));
} finally {
  ws?.close(); chrome.kill();
  await writeFile(path.join(reportDir, 'results.json'), JSON.stringify({ checks, measurements, mockedRequests, browserErrors }, null, 2));
  const failures = checks.filter(c=>!c.pass);
  console.log(JSON.stringify({ reportDir, checks: checks.length, passed: checks.length-failures.length, failures }));
  if (failures.length) process.exitCode = 1;
}
