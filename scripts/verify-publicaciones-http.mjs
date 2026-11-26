import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3100');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname), 'Local preview only');
const output = process.env.REPORT_DIR || 'reports/publicaciones-seo';
await mkdir(output,{recursive:true});
const checks=[];
const check=(name, pass, detail='')=>{checks.push({name,pass:Boolean(pass),detail});if(!pass) console.error(name,detail);};
const timeout=()=>AbortSignal.timeout(45000);
const pages = ['/categorias/libros-revistas-catalogos','/productos/impresion-catalogos-barcelona','/productos/impresion-revistas-barcelona','/categorias/eventos'];
const htmlByPage=new Map();
const titles=new Set(), descriptions=new Set();
for(const page of pages){
  const response=await fetch(new URL(page,base),{signal:timeout()});
  const html=await response.text(); htmlByPage.set(page,html);
  await writeFile(`${output}/${page.split('/').at(-1)}.html`,html);
  check(`${page}: HTTP 200`,response.status===200,response.status);
  check(`${page}: único H1`,(html.match(/<h1\b/g)||[]).length===1);
  if(page!==pages[3]) {
    check(`${page}: sin meta keywords`,!/<meta[^>]*name="keywords"/i.test(html));
    check(`${page}: sin enlaces al blog excluido`,!/<a\b[^>]*href="[^"]*blog\.reprodisseny\.com/i.test(html));
  }
  const canonicals=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]).filter(tag=>/\brel="canonical"/.test(tag));
  check(`${page}: canonical único y autorreferente`,canonicals.length===1 && canonicals[0].includes(`href="https://reprodisseny.com${page}"`),canonicals);
  check(`${page}: metadescripción`,/<meta[^>]*name="description"[^>]*content="[^"]+"/.test(html));
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/)?.[1];
  check(`${page}: title y descripción propios`,Boolean(title&&description) && !titles.has(title) && !descriptions.has(description),{title,description});
  titles.add(title); descriptions.add(description);
  check(`${page}: idioma español`,/<html[^>]*lang="es(?:-ES)?"/.test(html));
  check(`${page}: indexable en configuración de producción`,!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
  check(`${page}: cabecera HTTP indexable`,!/noindex/i.test(response.headers.get('x-robots-tag')||''));
  check(`${page}: hero prioritario`,/<img[^>]*fetchpriority="high"/.test(html));
  const missingAlts=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(tag=>!(/\balt="[^"]*"/.test(tag)));
  check(`${page}: alt de imágenes`,missingAlts.length===0,missingAlts);
  const scripts=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  check(`${page}: datos estructurados válidos`,scripts.length>0 && scripts.every(m=>{try{JSON.parse(m[1]);return true}catch{return false}}));
  if(page.includes('impresion-')){
    const entities=scripts.flatMap(m=>{const data=JSON.parse(m[1]);return data['@graph']||[data]});
    for(const type of ['WebPage','Service','BreadcrumbList','FAQPage']) check(`${page}: schema ${type}`,entities.some(item=>item['@type']===type));
    const faq=entities.find(item=>item['@type']==='FAQPage');
    check(`${page}: preguntas schema presentes en HTML`,faq?.mainEntity?.every(item=>html.includes(item.name) && html.includes(item.acceptedAnswer.text)));
    const publication=page.includes('catalogos')?'catalogos':'revistas';
    const quotePath=`/pedir-presupuesto?publicacion=${publication}`;
    check(`${page}: sin formulario incrustado`,!html.includes('rd-form-frame') && !/<form\b/.test(html.match(/<main\b[\s\S]*?<\/main>/)?.[0]||''));
    check(`${page}: hero y CTA inferior al presupuesto contextual`,(html.match(new RegExp(`href="${quotePath.replace('?', '\\?')}"`,'g'))||[]).length===2);
    check(`${page}: ancla inferior compatible`,html.includes('id="presupuesto-editorial"'));
    const quoteResponse=await fetch(new URL(quotePath,base),{signal:timeout()});
    const quoteHtml=await quoteResponse.text();
    check(`${page}: formulario dedicado accesible`,quoteResponse.status===200 && quoteHtml.includes('type="email"') && quoteHtml.includes('name="consent"'));
    check(`${page}: canonical del presupuesto sin query`,quoteHtml.includes('rel="canonical" href="https://reprodisseny.com/pedir-presupuesto"'));
    check(`${page}: sin ofertas o reseñas inventadas`,!scripts.some(m=>/@type":"(?:Offer|AggregateRating|Review)"/.test(m[1])));
    check(`${page}: FAQs en SSR`,html.includes('<details')&&html.includes('Preguntas frecuentes'));
  }
}
const home=await(await fetch(new URL('/',base),{signal:timeout()})).text();
for(const page of pages.slice(0,3)) check(`homepage enlaza ${page}`,home.includes(`href="${page}"`));
const categoryHTML=htmlByPage.get(pages[0]);
for(const term of ['Soft touch','Barniz selectivo','Stamping','gofrado','Solapas','Papeles interiores','Cubiertas'])check(`contenido técnico SSR: ${term}`, categoryHTML.includes(term));
check('Publicaciones: encabezados accesibles en pestañas SSR', categoryHTML.includes('<h3 class="sr-only">Tipos</h3>') && categoryHTML.includes('<h3 class="sr-only">Formatos</h3>'));
check('Catálogos: imagen editorial definitiva en SSR', htmlByPage.get(pages[1]).includes('Detalle de una cubierta impresa con acabado metalizado'));
check('Catálogos: hero muestra impresión interior', /<img[^>]*alt="Publicación abierta con impresión interior a color y encuadernación cosida"/.test(htmlByPage.get(pages[1])));
for(const [page,label] of [[pages[0],'Explorar publicaciones'],[pages[1],'Ver tipos de catálogos'],[pages[2],'Ver tipos de revistas']]) check(`${page}: CTA secundario personalizado`,htmlByPage.get(page).includes(label));
for(const [page,label] of [[pages[1],'Solicitar presupuesto de catálogos'],[pages[2],'Solicitar presupuesto de revistas']]) check(`${page}: CTA principal específico`,htmlByPage.get(page).includes(label));
for(const term of ['210 × 297 mm','148 × 210 mm','imprimir una revista personalizada']) check(`Revistas: intención visible ${term}`,htmlByPage.get(pages[2]).includes(term));
check('Catálogos enlaza Eventos',htmlByPage.get(pages[1]).includes('href="/categorias/eventos"'));
check('Eventos enlaza Catálogos de forma contextual',htmlByPage.get(pages[3]).includes('catálogos comerciales para ferias'));
const navigation=await(await fetch(new URL('/api/nav/categorias',base),{signal:timeout()})).json();
const publicationsNav=navigation.tree.find(item=>item.path===pages[0]);
for(const page of pages.slice(1,3)) check(`navegación comercial ${page}`,publicationsNav?.commercialLinks?.some(item=>item.path===page));
const catalog=JSON.parse(await readFile('cms/catalog.json','utf8'));
const products=catalog.products.filter(item=>item.categorySlug==='libros-revistas-catalogos'||item.categorySlugs?.includes('libros-revistas-catalogos'));
check('siete productos existentes',products.length===7);
for(const product of products){
  check(`enlace rastreable ${product.path}`,categoryHTML.includes(`href="${product.path}"`));
  const response=await fetch(new URL(product.path,base),{signal:timeout()});
  check(`producto existente ${product.path}`,response.status===200,response.status);
  const target=product.slug==='encuadernado-con-grapas'?pages[2]:product.slug==='encuadernacion-encolada-tapa-blanda'?pages[1]:['cosida-tapa-blanda','encuadernacion-wire-o'].includes(product.slug)?pages[0]:null;
  if(target) check(`enlace editorial contextual ${product.slug}`,(await response.text()).includes(`href="${target}"`));
}
for(const path of ['/product/imprimir-revista-presupuesto','/product/imprimir-revista-presupuesto/printestimate']){
  const response=await fetch(new URL(path,base),{redirect:'manual',signal:timeout()});
  const location=response.headers.get('location');
  check(`301 directo ${path}`,response.status===301 && new URL(location,base).pathname===pages[2],{status:response.status,location});
}
const source=await(await fetch(new URL('/api/__sitemap__/urls',base),{signal:timeout()})).json();
for(const page of pages.slice(0,3)) check(`sitemap source ${page}`,source.some(item=>item.loc===page));
const sitemapText=await(await fetch(new URL('/sitemap.xml',base),{signal:timeout()})).text();
const sitemap=new XMLParser().parse(sitemapText);
check('sitemap XML',!!sitemap.urlset);
for(const page of pages.slice(0,3))check(`sitemap público ${page}`,sitemapText.includes(`https://reprodisseny.com${page}`));
const robotsResponse=await fetch(new URL('/robots.txt',base),{signal:timeout()});
const robots=await robotsResponse.text();
await writeFile(`${output}/robots.txt`,robots);
check('robots.txt público y sin bloqueo global',robotsResponse.status===200 && !/^Disallow:\s*\/\s*$/im.test(robots));
check('robots.txt anuncia el sitemap canónico',/^Sitemap:\s*https:\/\/reprodisseny\.com\/sitemap\.xml\s*$/im.test(robots));
const links=new Set();
for(const [page,html] of htmlByPage){
  const body=html.split('<body')[1]?.split('<script')[0]||'';
  for(const match of body.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
    const path=match[1]; if(!path.startsWith('/_')&&!/\.[a-z]{2,5}$/i.test(path))links.add(path);
  }
  for(const match of body.matchAll(/href="#([^"]+)"/g)) check(`${page}: ancla #${match[1]}`,body.includes(`id="${match[1]}"`));
}
for(const path of links){
  const response=await fetch(new URL(path,base),{signal:timeout()});
  check(`enlace ${path}`,response.status===200,response.status);
}
await writeFile(`${output}/http-results.json`,JSON.stringify({checks,links:[...links]},null,2));
console.log(`${checks.filter(item=>item.pass).length}/${checks.length} comprobaciones HTTP correctas`);
if(checks.some(item=>!item.pass))process.exitCode=1;
