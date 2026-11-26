// Run against the local production preview. No packages or real lead submissions.
// BASE_URL=http://127.0.0.1:3100 CHROME_PATH=... node scripts/verify-publicaciones-responsive.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const reference = process.argv.includes('--reference');
const captureOnly = process.argv.includes('--capture-only');
const diagnoseLayout = process.argv.includes('--diagnose-layout');
// Diagnostic only: audit the proposed scoped palette on an existing preview before rebuilding.
const contrastAudit = process.argv.includes('--contrast-audit');
const proposedCss = contrastAudit ? (await import('sass')).compileString(await readFile('assets/styles/editorial.scss', 'utf8')).css : '';
const base = new URL(reference ? 'https://reprodisseny.com' : (process.env.BASE_URL || 'http://127.0.0.1:3100'));
assert.ok(reference || ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Local preview only');
const reportDir = path.resolve(process.env.REPORT_DIR || (contrastAudit ? 'reports/publicaciones-seo/contrast-diagnostic' : diagnoseLayout ? 'reports/publicaciones-seo/layout-diagnostic' : reference ? 'reports/publicaciones-seo/reference' : 'reports/publicaciones-seo/responsive'));
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
let mockNextFailure = false;
const checks = [], measurements = [], mockedRequests = [], browserErrors = [], designSignatures = [], laboratory = [];
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
          const fail = mockNextFailure;
          mockNextFailure = false;
          const response = url.pathname.endsWith('/contact')
            ? { ok: true, duplicated: false, item: { id: 'local-42', requestKey: 'local-confirmation' } }
            : { ok: true, duplicated: false, itemId: 'local-42', requestKey: 'local-confirmation' };
          await pause(150);
          await send('Fetch.fulfillRequest', { requestId, responseCode: fail ? 500 : 201,
            responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
            body: Buffer.from(JSON.stringify(fail ? {statusMessage:'Fallo simulado de prueba local',requestId:'local-failed-request'} : response)).toString('base64') });
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
  const loadPageImages = () => evaluate(`(async()=>{
    for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(300,innerHeight*.8)){
      window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));
      await Promise.all([...document.querySelectorAll('main img')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight}).map(e=>e.decode().catch(()=>null)));
    }
    window.scrollTo(0,0);
  })()`);
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `window.__editorialCls=0;window.__editorialLcp=null;window.__editorialMaxEventDuration=null;
    new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__editorialCls+=entry.value}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__editorialLcp=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true});
    if(PerformanceObserver.supportedEntryTypes.includes('event'))new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.interactionId)window.__editorialMaxEventDuration=Math.max(window.__editorialMaxEventDuration||0,entry.duration)}).observe({type:'event',buffered:true,durationThreshold:16});`});
  const cases = reference ? [['eventos-before', '/categorias/eventos']] : [
    ['publicaciones','/categorias/libros-revistas-catalogos'],
    ['catalogos','/productos/impresion-catalogos-barcelona'],
    ['revistas','/productos/impresion-revistas-barcelona'],
    ['eventos-after','/categorias/eventos'],
  ];
  for(const [name, route] of cases) {
    if(captureOnly && !['catalogos','revistas'].includes(name)) continue;
    console.log(`Reviewing ${name}`);
    await resize(1440); await navigate(route);
    if(captureOnly) {
      for(const width of [390,1440]) {
        await resize(width); await loadPageImages();
        await screenshot(`${name}-hero-${width}`);
        await evaluate("document.getElementById('presupuesto-editorial').scrollIntoView({block:'start',behavior:'instant'})");
        await screenshot(`${name}-cta-${width}`);
      }
      continue;
    }
    if(!reference && !contrastAudit && !diagnoseLayout) {
      await evaluate("document.querySelector('main .category-hero img')?.decode().catch(()=>null)");
      await pause(200);
      const initial=await evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0];return {lcpMs:window.__editorialLcp,clsBeforeResize:window.__editorialCls,ttfbMs:n?n.responseStart-n.requestStart:null}})()");
      laboratory.push({name,origin:base.origin,viewport:1440,throttling:'none',...initial});
    }
    if(contrastAudit && name !== 'eventos-after') {
      await evaluate(`(()=>{document.querySelector('main').classList.add('editorial-page');const style=document.createElement('style');style.textContent=${JSON.stringify(proposedCss)};document.head.append(style)})()`);
      await pause(350); // Let existing color transitions settle before measuring the proposed palette.
    }
    if(diagnoseLayout) {
      await resize(320);
      console.log(JSON.stringify(await evaluate(`(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,nodes:[...document.querySelectorAll('body *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX==='visible').map(e=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,60),width:e.clientWidth,scroll:e.scrollWidth})),sections:[...document.querySelectorAll('main section, main header')].map(e=>{const old=e.style.display;e.style.display='none';const width=document.documentElement.scrollWidth;e.style.display=old;return {class:e.className,width}})}))()`),null,2));
      break;
    }
    if(!reference) {
      const signature = await evaluate(`(() => {
        const title = getComputedStyle(document.querySelector('main h1'));
        const button = getComputedStyle(document.querySelector('main .category-hero__actions a'));
        const container = document.querySelector('main .category-hero .container-content').getBoundingClientRect();
        return {font:title.fontFamily,size:title.fontSize,lineHeight:title.lineHeight,color:title.color,
          buttonColor:button.backgroundColor,buttonRadius:button.borderRadius,containerWidth:container.width};
      })()`);
      designSignatures.push({name, signature});
      const contrast = await evaluate(`(() => {
        const rgb=s=>(s.match(/[\\d.]+/g)||[]).map(Number);
        const blend=(fg,bg)=>{const a=fg[3]??1;return fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a))};
        const background=e=>{const chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p);return chain.reduce((bg,p)=>blend(rgb(getComputedStyle(p).backgroundColor),bg),[255,255,255])};
        const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        const editorial = document.querySelector('main.editorial-page');
        const elements = editorial ? [...editorial.querySelectorAll('p,dt,dd,h1,h2,h3,h4,a,span,label,li,button')].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&!e.closest('.sr-only,[aria-hidden="true"]')&&getComputedStyle(e).visibility!=='hidden'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) : [...document.querySelectorAll('main h1, main .category-hero__description, main .category-hero__actions a, main .commercial-cluster-priority__description')];
        return elements.map(e=>{const style=getComputedStyle(e),bg=background(e),fg=blend(rgb(style.color),bg),a=lum(bg),b=lum(fg);return {text:e.textContent.trim().slice(0,65),class:e.className,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),required:parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.667&&parseInt(style.fontWeight)>=700)?3:4.5}});
      })()`);
      check(`${name}: visible text contrast (including secondary text)`,contrast.every(item=>item.ratio>=item.required),contrast.filter(item=>item.ratio<item.required));
    }
    if(contrastAudit) continue;
    if(!reference && name === 'publicaciones') {
      await evaluate("document.querySelector('button[aria-label=\"Abrir submenú de Publicaciones\"]')?.focus()");
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
      await waitFor("!!document.querySelector('[role=menu] a[href=\"/productos/impresion-catalogos-barcelona\"]')");
      for(const publication of ['catalogos','revistas']) {
        check(`desktop navigation: ${publication}`, await evaluate(`!![...document.querySelectorAll('[role=menu] a')].find(e=>e.getAttribute('href')==='/productos/impresion-${publication}-barcelona'&&e.getBoundingClientRect().height>0)`));
      }
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
    }
    // Read-only performance and layout checks; all external writes are blocked by interception.
    for(const width of reference ? [390,1440] : [320,360,390,768,1280,1440,1920]) {
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
        overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>document.documentElement.clientWidth+1||r.left< -1)}).slice(0,15).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,80),width:e.getBoundingClientRect().width})),
        overflowText:(()=>{const items=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!node.textContent.trim()||['SCRIPT','STYLE'].includes(node.parentElement.tagName))continue;const range=document.createRange();range.selectNodeContents(node);if([...range.getClientRects()].some(r=>r.width>0&&r.right>document.documentElement.clientWidth+1))items.push({text:node.textContent.trim().slice(0,80),parent:node.parentElement.className})}return items.slice(0,25)})(),
      }))()`);
      measurements.push({name,width,...result});
      check(`${name} ${width}: no overflow`,result.scroll<=result.client,JSON.stringify({scroll:result.scroll,client:result.client,overflow:result.overflow,overflowText:result.overflowText}));
      check(`${name} ${width}: one H1`,result.h1===1);
      check(`${name} ${width}: visible images load`,result.images.every(image=>image.loaded),result.images.filter(image=>!image.loaded));
      await screenshot(`${name}-${width}`);
      if(['catalogos','revistas'].includes(name) && [390,1440].includes(width)) {
        await evaluate("document.getElementById('presupuesto-editorial').scrollIntoView({block:'start',behavior:'instant'})");
        await screenshot(`${name}-cta-${width}`);
      }
    }
    if(!reference) {
      if(name === 'publicaciones') {
        await resize(320);
        await evaluate("window.scrollTo(0, document.querySelector('.commercial-cluster-project').getBoundingClientRect().top + scrollY - 140)");
        await screenshot('publicaciones-proyecto-320');
      }
      // A 1280 px desktop viewport at 200% zoom has a 640 CSS px layout viewport.
      await resize(640, 2);
      check(`${name}: 200% zoom reflows`, await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'));
      await screenshot(`${name}-zoom-200`);
      await resize(390);
      // Load lazy images throughout the page and check every section fits the viewport.
      await loadPageImages();
      await pause(500);
      const sectionOverflow=await evaluate("[...document.querySelectorAll('main section,main article,main form')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1||e.getBoundingClientRect().left< -1).map(e=>e.className)");
      check(`${name}: all sections fit mobile`,sectionOverflow.length===0,sectionOverflow);
      const media = await evaluate("[...document.querySelectorAll('main img')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(!e.complete||e.naturalWidth===0)}).map(e=>e.currentSrc)");
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
        await evaluate("document.querySelector('button[aria-label=\"Abrir menú de navegación\"]').click()");
        await waitFor("!!document.querySelector('[role=dialog]')");
        await evaluate("[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent.trim()==='Publicaciones').click()");
        await pause(250);
        for(const publication of ['catalogos','revistas']) {
          check(`mobile navigation: ${publication}`, await evaluate(`!![...document.querySelectorAll('[role=dialog] a')].find(e=>e.getAttribute('href')==='/productos/impresion-${publication}-barcelona'&&e.getBoundingClientRect().height>0)`));
        }
        await evaluate("document.querySelector('[role=dialog] > button.absolute').click()");
        await waitFor("!document.querySelector('[role=dialog]')");
      }
      if(['publicaciones','catalogos','revistas'].includes(name)) {
        await resize(1440); await evaluate('window.scrollTo(0,0)');
        await loadPageImages();
        const metrics=await send('Page.getLayoutMetrics');
        const full=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1440,height:metrics.cssContentSize.height,scale:1}});
        await writeFile(path.join(reportDir,`${name}-full-1440.png`),Buffer.from(full.data,'base64'));
      }
      const lab=laboratory.find(item=>item.name===name);
      if(lab) lab.maxObservedEventDurationMs=await evaluate('window.__editorialMaxEventDuration');
    }
  }
  if(!reference && !diagnoseLayout && !contrastAudit && !captureOnly) {
    const events = designSignatures.find(item => item.name === 'eventos-after')?.signature;
    for(const item of designSignatures.filter(item => item.name !== 'eventos-after')) {
      check(`${item.name}: typography, container and primary CTA match Eventos`,
        Boolean(events) && JSON.stringify(item.signature) === JSON.stringify(events), item.signature);
    }
    const campaign={utm_source:'google',utm_medium:'cpc',utm_campaign:'editorial-local-audit',utm_id:'cta-01-local',gclid:'local-audit-click'};
    const journeys=[];
    for(const publication of ['catalogos','revistas']) {
      for(const width of [390,1440]) for(const cta of ['hero','bottom']) {
        journeys.push({publication,route:`/productos/impresion-${publication}-barcelona`,width,cta,params:campaign});
      }
      for(const params of [{}, {gclid:'local-audit-click'}, {utm_source:'google',utm_medium:'cpc',utm_campaign:'editorial-local-audit'}, {gbraid:'local-braid'}, {wbraid:'local-braid'}]) {
        journeys.push({publication,route:`/productos/impresion-${publication}-barcelona`,width:390,cta:'bottom',params,reload:true});
      }
      journeys.push({publication,route:`/pedir-presupuesto?publicacion=${publication}`,width:390,params:{}});
    }
    journeys.push({publication:'editorial',route:'/pedir-presupuesto?publicacion=editorial',width:390,params:{}});
    for(const [journeyIndex,{publication,route,width,cta,params,reload}] of journeys.entries()) {
      const label=`${publication} ${width} ${cta||'direct'} ${Object.keys(params).join(',')||'organic'}${reload?' reload':''}`;
      const destination=new URL(route,base);
      for(const [key,value] of Object.entries(params)) destination.searchParams.set(key,value);
      // Every journey starts without attribution from an earlier test.
      await evaluate("localStorage.removeItem('rd_first_attribution');localStorage.removeItem('rd_last_attribution')");
      await resize(width);await navigate(destination.pathname+destination.search);
      const before=mockedRequests.length;
      const testFailure=journeyIndex===0;
      if(cta) {
        check(`${label}: no embedded form`,await evaluate("!document.querySelector('main form')"));
        const selector=cta==='hero'?'.category-hero__actions a': '#presupuesto-editorial a';
        const href=await evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('href')`);
        const target=new URL(href,base);
        check(`${label}: contextual destination`,target.pathname==='/pedir-presupuesto'&&target.searchParams.get('publicacion')===publication,href);
        check(`${label}: campaign on both link destinations`,await evaluate(`['.category-hero__actions a','#presupuesto-editorial a'].every(s=>document.querySelector(s).getAttribute('href')===${JSON.stringify(href)})`));
        for(const [key,value] of Object.entries(params)) check(`${label}: link preserves ${key}`,target.searchParams.get(key)===value);
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
        await waitFor("location.pathname==='/pedir-presupuesto' && !!document.querySelector('.rd-form-frame form')");
        if(reload) await navigate(target.pathname+target.search);
        check(`${label}: click creates no request or conversion`,mockedRequests.length===before && await evaluate("(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length")===0);
        if(params===campaign && cta==='hero') await screenshot(`${publication}-form-${width}`);
      }
      if(testFailure) {
        await evaluate("document.querySelector('.rd-form-frame button[type=submit]').click()");
        await waitFor("!!document.querySelector('.rd-form-alert')");
        check('invalid form: no request or conversion',mockedRequests.length===before && await evaluate("(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length")===0);
      }
      await evaluate(`(() => {const form=document.querySelector('.rd-form-frame form');
        for(const e of form.querySelectorAll('input,textarea')){
          if(e.type==='checkbox'){if(!e.checked)e.click();continue}
          if(!e.name||e.name==='website'||['file','hidden'].includes(e.type))continue;
          const value=/email/.test(e.name)?'audit@example.test':/phone/.test(e.name)?'600000000':/message/.test(e.name)?'Prueba local interceptada sin envío externo.':'Prueba local';
          const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
        }
      })()`);
      if(testFailure) {
        mockNextFailure=true;
        await evaluate("document.querySelector('.rd-form-frame button[type=submit]').click()");
        await waitFor("document.querySelector('.rd-form-alert')?.textContent.includes('local-failed-request') && !document.querySelector('.rd-form-frame button[type=submit]').disabled");
        check('failed response: no conversion or thank-you navigation',mockedRequests.length===before+1 && await evaluate("location.pathname==='/pedir-presupuesto'&&(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length===0"));
      }
      await evaluate("document.querySelector('.rd-form-frame button[type=submit]').click()");
      await waitFor("location.pathname==='/gracias'");
      check(`${label}: one successful mocked submission`,mockedRequests.length===before+(testFailure?2:1));
      const payload=mockedRequests.at(-1)?.payload;
      const expectedSlug = publication === 'editorial' ? 'publicaciones-editoriales' : `impresion-${publication}-barcelona`;
      check(`${label}: publication attribution`,payload?.product?.slug===expectedSlug&&payload?.categorySlug==='libros-revistas-catalogos' && payload?.product?.name===(publication==='editorial'?'Publicaciones editoriales':`Impresión de ${publication==='catalogos'?'catálogos':'revistas'}`),payload?.product);
      for(const [key,value] of Object.entries(params)) check(`${label}: payload preserves ${key}`,payload?.utm?.[key]===value,payload?.utm);
      if(Object.keys(params).length) {
        check(`${label}: advertising attribution`,payload?.tracking?.normalized?.trackingSource==='google'&&payload?.tracking?.normalized?.trackingMedium==='cpc',payload?.tracking?.normalized);
        if(params.utm_campaign) check(`${label}: CRM campaign`,payload?.tracking?.TrackingCampaign===params.utm_campaign,payload?.tracking?.TrackingCampaign);
        if(!reload) check(`${label}: initial editorial landing`,payload?.tracking?.attribution?.first?.landingPath===destination.pathname,payload?.tracking?.attribution);
      }
      check(`${label}: one conversion after success`,await evaluate("(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length")===1);
    }
  }
  check('browser: no runtime errors',browserErrors.length===0,browserErrors);
  await send('Browser.close');ws.close();
} catch(error) {check('runner completed',false,String(error.stack||error));}
finally {
  ws?.close();chrome.kill();
  await writeFile(path.join(reportDir,'results.json'),JSON.stringify({checks,measurements,designSignatures,laboratory,mockedRequests,browserErrors},null,2));
  console.log(`${checks.filter(item=>item.pass).length}/${checks.length} browser checks passed`);
  if(checks.some(item=>!item.pass))process.exitCode=1;
}

