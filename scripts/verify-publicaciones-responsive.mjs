// Run against the local production preview. No packages or real lead submissions.
// BASE_URL=http://127.0.0.1:3100 CHROME_PATH=... node scripts/verify-publicaciones-responsive.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const reference = process.argv.includes('--reference');
const base = new URL(reference ? 'https://reprodisseny.com' : (process.env.BASE_URL || 'http://127.0.0.1:3100'));
assert.ok(reference || ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Local preview only');
const reportDir = path.resolve(process.env.REPORT_DIR || (reference ? 'reports/publicaciones-seo/reference' : 'reports/publicaciones-seo/responsive'));
await mkdir(reportDir, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), 'rd-editorial-test-'));
const executable = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'],
{ windowsHide: true, stdio: ['ignore','ignore','pipe'] });
chrome.stderr.on('data',chunk=>console.error(String(chunk).trim()));
chrome.on('error',error=>console.error(error));
chrome.on('exit',(code,signal)=>console.log('Chrome exit',code,signal));
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let ws;
const checks = [], measurements = [], mockedRequests = [], browserErrors = [];
const check = (name, condition, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) console.error(`FAIL ${name}: ${detail}`);
};

try {
  let port;
  for (let i = 0; i < 300; i++) {
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
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = (message.params.args || []).map(arg => arg.value || arg.description || '').join(' ');
      if (/hydration.*mismatch|mismatch.*hydration/i.test(text)) browserErrors.push(text);
    }
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
        if (!reference && url.origin === base.origin && ['/api/price-requests', '/api/cms/contact'].includes(url.pathname)) {
          const body = request.postData?.match(/\r\n\r\n(\{[\s\S]*\})\r\n--/)?.[1];
          mockedRequests.push({ path: url.pathname, method: request.method, payload: body ? JSON.parse(body) : null });
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
    for (let i = 0; i < 300; i++) { if (await evaluate(expression)) return; await pause(150); }
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
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `window.__editorialCls = 0; new PerformanceObserver(list => {for(const entry of list.getEntries()) if(!entry.hadRecentInput) window.__editorialCls += entry.value}).observe({type:'layout-shift',buffered:true});`});
  const cases = reference ? [['eventos-before', '/categorias/eventos']] : [
    ['publicaciones','/categorias/libros-revistas-catalogos'],
    ['catalogos','/productos/impresion-catalogos-barcelona'],
    ['revistas','/productos/impresion-revistas-barcelona'],
    ['eventos-after','/categorias/eventos'],
  ];
  for(const [name, route] of cases) {
    console.log(`Reviewing ${name}`);
    await resize(1440); await navigate(route);
    if(!reference) {
      const contrast = await evaluate(`(() => {
        const rgb=s=>(s.match(/[\\d.]+/g)||[]).map(Number);
        const blend=(fg,bg)=>{const a=fg[3]??1;return fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a))};
        const background=e=>{const chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p);return chain.reduce((bg,p)=>blend(rgb(getComputedStyle(p).backgroundColor),bg),[255,255,255])};
        const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        return [...document.querySelectorAll('main h1, main .category-hero__description, main .category-hero__actions a, main .commercial-cluster-priority__description')].map(e=>{const bg=background(e),fg=blend(rgb(getComputedStyle(e).color),bg),a=lum(bg),b=lum(fg);return {text:e.textContent.trim().slice(0,50),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
      })()`);
      check(`${name}: main text and CTA contrast`,contrast.every(item=>item.ratio>=4.5),contrast);
    }
    // Read-only performance and layout checks; all external writes are blocked by interception.
    for(const width of reference ? [390,1440] : [390,768,1280,1440,1920]) {
      await resize(width);
      await evaluate('window.scrollTo(0,0)');
      await pause(300);
      await evaluate("Promise.all([...document.querySelectorAll('main img')].filter(e=>e.getBoundingClientRect().top<innerHeight).map(e=>e.decode().catch(()=>null)))");
      const result=await evaluate(`(() => ({
        client:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth,
        h1:document.querySelectorAll('h1').length,
        images:[...document.querySelectorAll('main img')].filter(e=>e.getBoundingClientRect().top<innerHeight).map(e=>({src:e.currentSrc,loaded:e.complete&&e.naturalWidth>0,alt:e.alt})),
        cls:window.__editorialCls||0,
        hero:document.querySelector('.category-hero')?.getBoundingClientRect().toJSON(),
      }))()`);
      measurements.push({name,width,...result});
      check(`${name} ${width}: no overflow`,result.scroll<=result.client,`${result.scroll}/${result.client}`);
      check(`${name} ${width}: one H1`,result.h1===1);
      check(`${name} ${width}: visible images load`,result.images.every(image=>image.loaded),result.images.filter(image=>!image.loaded));
      await screenshot(`${name}-${width}`);
    }
    if(!reference) {
      await resize(390);
      // Load lazy images throughout the page and check every section fits the viewport.
      await evaluate(`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}window.scrollTo(0,0)})()`);
      await pause(500);
      const sectionOverflow=await evaluate("[...document.querySelectorAll('main section,main article,main form')].filter(e=>e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left< -1).map(e=>e.className)");
      check(`${name}: all sections fit mobile`,sectionOverflow.length===0,sectionOverflow);
      const media = await evaluate("[...document.querySelectorAll('main img')].filter(e=>e.complete&&e.naturalWidth===0).map(e=>e.currentSrc)");
      check(`${name}: no broken image`,media.length===0,media);
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});
      await evaluate("document.querySelector('main .category-hero__actions a')?.focus()");
      check(`${name}: keyboard focus visible`,await evaluate("(()=>{const e=document.activeElement,s=getComputedStyle(e);return e?.tagName==='A' && (s.outlineStyle!=='none'||s.boxShadow!=='none')})()"));
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});
      check(`${name}: secondary CTA keyboard accessible`,await evaluate("document.activeElement?.getAttribute('href')?.startsWith('#')"));
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
      await waitFor("location.hash.length>1 && !!document.getElementById(location.hash.slice(1))");
      check(`${name}: secondary CTA target exists`,await evaluate("!!document.getElementById(location.hash.slice(1))"));
      if(name==='publicaciones') {
        const tabs=await evaluate("[...document.querySelectorAll('[role=tab]')].map(e=>({id:e.id,text:e.textContent}))");
        check('publicaciones: technical tabs available',tabs.length===4,tabs);
        await evaluate("[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('Acabados'))?.click()");
        check('publicaciones: finishes panel visible',await evaluate("[...document.querySelectorAll('[role=tabpanel]')].some(e=>e.getBoundingClientRect().height>0&&e.textContent.includes('Soft touch'))"));
      }
      if(['publicaciones','catalogos','revistas'].includes(name)) {
        await resize(1440); await evaluate('window.scrollTo(0,0)');
        const metrics=await send('Page.getLayoutMetrics');
        const full=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1440,height:metrics.cssContentSize.height,scale:1}});
        await writeFile(path.join(reportDir,`${name}-full-1440.png`),Buffer.from(full.data,'base64'));
      }
    }
  }
  if(!reference) {
    for(const [publication,route] of [
      ['catalogos','/productos/impresion-catalogos-barcelona'],
      ['revistas','/productos/impresion-revistas-barcelona'],
      ['catalogos','/pedir-presupuesto?publicacion=catalogos'],
      ['revistas','/pedir-presupuesto?publicacion=revistas'],
    ]) {
      await resize(390);await navigate(route);
      const before=mockedRequests.length;
      await evaluate(`(() => {const form=document.querySelector('.rd-form-frame form');
        for(const e of form.querySelectorAll('input,textarea')){
          if(e.type==='checkbox'){if(!e.checked)e.click();continue}
          if(!e.name||e.name==='website'||['file','hidden'].includes(e.type))continue;
          const value=/email/.test(e.name)?'audit@example.test':/phone/.test(e.name)?'600000000':/message/.test(e.name)?'Prueba local interceptada sin envío externo.':'Prueba local';
          const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
        }
      })()`);
      await evaluate("document.querySelector('.rd-form-frame button[type=submit]').click()");
      await waitFor("location.pathname==='/gracias'");
      check(`${route}: one mocked submission`,mockedRequests.length===before+1);
      const payload=mockedRequests.at(-1)?.payload;
      check(`${route}: publication attribution`,payload?.product?.slug===`impresion-${publication}-barcelona`&&payload?.categorySlug==='libros-revistas-catalogos',payload?.product);
      check(`${route}: one conversion`,await evaluate("(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length")===1);
    }
  }
  check('browser: no runtime errors',browserErrors.length===0,browserErrors);
  await send('Browser.close');ws.close();
} catch(error) {check('runner completed',false,String(error.stack||error));}
finally {
  ws?.close();chrome.kill();
  await writeFile(path.join(reportDir,'results.json'),JSON.stringify({checks,measurements,mockedRequests,browserErrors},null,2));
  console.log(`${checks.filter(item=>item.pass).length}/${checks.length} browser checks passed`);
  if(checks.some(item=>!item.pass))process.exitCode=1;
}

