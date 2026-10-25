const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {build,catalogue} = require('../build-seo');
const site = build();
const strip = s => s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

test('Every catalogue tool has pre-rendered instructions, example and limits', () => {
  assert.equal(site.app.TOOLS.length,36);
  assert.equal(new Set(site.app.TOOLS.map(t=>t.id)).size,36);
  for(const t of site.app.TOOLS) {
    const html=fs.readFileSync(path.join(site.out,'tools',t.id+'.html'),'utf8');
    const main=html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    assert(main.includes('How to use this tool'),t.id);
    assert(main.includes('Worked example'),t.id);
    assert(main.includes('Limitations and checks'),t.id);
    assert(main.includes('id="workbench"'),t.id);
    assert(strip(main).length>500,t.id);
    assert.equal((main.match(/<h1\b/g)||[]).length,1,t.id);
    assert(!main.includes('adsbygoogle'),t.id);
    assert(!main.includes('id="guide-ad"'),t.id);
  }
});
test('All static routes have distinct metadata and links to real routes', () => {
  const titles=new Set();
  for(const route of site.routes) {
    const file=route==='/'?'index.html':route.slice(1)+'.html';
    const html=fs.readFileSync(path.join(site.out,file),'utf8');
    const title=html.match(/<title>(.*?)<\/title>/)[1];
    assert(!titles.has(title),title); titles.add(title);
    assert(html.includes('rel="canonical" href="https://toolnez.vercel.app'+route+'"'),route);
    assert(!html.includes('href="#/'),route);
    assert(!html.includes('pagead2.googlesyndication.com'),route);
    assert(!html.includes('challenge-platform'),route);
    for(const [,href] of html.matchAll(/href="(\/[^"#]*)"/g)) assert(site.routes.includes(href)||fs.existsSync(path.join(site.out,href.slice(1))),route+' -> '+href);
    for(const [,src] of html.matchAll(/<script\b[^>]*src="(\/[^"#]*)"/g)) assert(fs.existsSync(path.join(site.out,src.slice(1))),src);
  }
  const sitemap=fs.readFileSync(path.join(site.out,'sitemap.xml'),'utf8');
  assert(!sitemap.includes('#'));
  assert.equal((sitemap.match(/<loc>/g)||[]).length,site.routes.length);
});
test('Reading guides are original content, with no editor or empty ad boxes', () => {
  const {guides}=catalogue();
  for(const [id,g] of Object.entries(guides)) {
    assert(strip(g.body).split(' ').length>350,id);
    const page=site.app.renderPage('/guides/'+id);
    assert(page.exists);
    assert(!page.html.includes('workbench'));
    assert(!page.html.includes('Ad space'));
    assert(!page.html.includes('adsbygoogle'));
  }
  for(const route of ['/p/contact','/p/privacy','/p/terms','/p/cookies','/guides','/c/image','/missing']) {
    const page=site.app.renderPage(route);
    assert(!page.html.includes('guide-ad'),route);
  }
});
test('404 is an error page with noindex, and verification matches ads.txt', () => {
  const html=fs.readFileSync(path.join(site.out,'404.html'),'utf8');
  assert(html.includes('name="robots" content="noindex"'));
  assert(!site.app.renderPage('/tools/absent').exists);
  assert(!site.app.renderPage('/c/image/extra').exists);
  assert(html.includes('name="google-adsense-account" content="ca-pub-2170099684772121"'));
  assert(fs.readFileSync(path.join(site.out,'ads.txt'),'utf8').includes('google.com, pub-2170099684772121, DIRECT'));
});
test('Legacy links keep their destination and cannot redirect to external hosts', () => {
  for(const t of site.app.TOOLS) assert.equal(site.app.legacyPath('#/t/'+t.id),'/tools/'+t.id);
  assert.equal(site.app.legacyPath('#/p/privacy'),'/p/privacy');
  assert.equal(site.app.legacyPath('#/c/image'),'/c/image');
  assert.equal(site.app.legacyPath('#/'),'/');
  for(const hash of ['#//example.com','#//tools/percentage','#/https://example.com','#/t/absent','#/\\example.com']) assert.equal(site.app.legacyPath(hash),'/404');
});

// Exercise the ad gate without contacting an advertising network.
function adsEnvironment(route,articleId='image-formats') {
  const scripts=[], units=[];
  const root={querySelector:()=>units.find(x=>x.tag==='ins'),append:(...xs)=>units.push(...xs),replaceChildren:()=>units.splice(0)};
  const doc={querySelector:sel=>sel==='[data-editorial-guide]'?{dataset:{editorialGuide:articleId}}:sel==='#guide-ad'?root:null,
    createElement:tag=>({tag,style:{},dataset:{},remove(){}}),head:{appendChild:s=>scripts.push(s)}};
  const ctx=vm.createContext({document:doc,location:{pathname:route}});ctx.window=ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../adsense.js'),'utf8'),ctx);
  return {ctx,scripts,units};
}
test('Ad code stays unloaded during review and without CMP permission', () => {
  const e=adsEnvironment('/guides/image-formats');
  e.ctx.ADSENSE.guideSlot='1234567890';e.ctx.ToolNezAds.allowAfterConsent();
  assert.equal(e.scripts.length,0);
  e.ctx.ADSENSE.enabled=true;e.ctx.ToolNezAds.revokeConsent();e.ctx.ToolNezAds.render();
  assert.equal(e.scripts.length,0);
});
test('Even enabled ads cannot request ads on editors, results, legal or navigation screens', () => {
  for(const route of ['/',...site.app.TOOLS.map(t=>'/tools/'+t.id),...Object.keys(site.app.CATS).map(c=>'/c/'+c),...Object.keys(site.app.PAGES).map(p=>'/p/'+p),'/404','/guides','/guides/absent']) {
    const e=adsEnvironment(route);e.ctx.ADSENSE.enabled=true;e.ctx.ADSENSE.guideSlot='1234567890';
    e.ctx.ToolNezAds.allowAfterConsent();e.ctx.ToolNezAds.render();assert.equal(e.scripts.length,0,route);
  }
});
test('A permitted guide requests one labeled manual ad, and rechecks consent on load', () => {
  const e=adsEnvironment('/guides/image-formats');e.ctx.ADSENSE.enabled=true;e.ctx.ADSENSE.guideSlot='1234567890';
  e.ctx.ToolNezAds.allowAfterConsent();e.ctx.ToolNezAds.render();assert.equal(e.scripts.length,1);
  e.scripts[0].onload();e.ctx.ToolNezAds.render();assert.equal(e.ctx.adsbygoogle.length,1);
  assert.equal(e.units[0].textContent,'Advertisement');
  const f=adsEnvironment('/guides/image-formats');f.ctx.ADSENSE.enabled=true;f.ctx.ADSENSE.guideSlot='1234567890';
  f.ctx.ToolNezAds.allowAfterConsent();f.ctx.ToolNezAds.revokeConsent();f.scripts[0].onload();assert.equal(f.units.length,0);
});

// Small DOM surfaces let us test numerical/text behavior independently of a browser.
function toolRoot(id,values) {
  const {app,context}=catalogue();const nodes={};nodes.__context=context;
  for(const [key,value] of Object.entries(values)) nodes['#'+key]={value:String(value),innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(event,fn){this[event]=fn;}};
  const root={querySelector:s=>nodes[s],querySelectorAll:()=>[]};
  app.TOOLS.find(t=>t.id===id).init(root);
  return nodes;
}
test('Worked numerical examples agree with calculator outputs', () => {
  const n=toolRoot('percentage',{a1:15,b1:80,r1:'',a2:12,b2:80,r2:'',a3:80,b3:100,r3:'',a4:80,b4:15,r4:''});
  assert(n['#r1'].innerHTML.startsWith('12.00'));assert(n['#r3'].innerHTML.startsWith('+25.00%'));assert(n['#r4'].innerHTML.startsWith('68.00'));
  const c=toolRoot('compound-interest',{p:100,m:0,r:12,y:1,out:'',detail:'',tbl:''});assert(c['#out'].innerHTML.startsWith('$112.68'));
  const l=toolRoot('loan-payment',{c:10000,i:6,y:2,out:'',detail:'',tblwrap:'',tbl:'',csv:''});assert(l['#out'].innerHTML.startsWith('$443.21'));
});
test('JSON scalar roots, including null, are accepted', () => {
  for(const value of ['null','true','42','"hello"']) {
    const n=toolRoot('json-formatter',{src:value,out:'',fmt:'',min:'',sort:'',cp:''});
    n['#fmt'].onclick();assert(n['#out'].textContent.startsWith('Valid JSON'),value);
    assert.equal(JSON.stringify(JSON.parse(n['#src'].value)),value);
  }
});
test('Loan CSV keeps exactly four columns even when balances exceed 1,000', async () => {
  const n=toolRoot('loan-payment',{c:150000,i:3.2,y:25,out:'',detail:'',tblwrap:'',tbl:'',csv:''});
  let blob;
  const ctx=n.__context;
  ctx.URL={createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL(){}};
  ctx.setTimeout=()=>0;ctx.clearTimeout=()=>{};
  const toast={textContent:'',classList:{add(){},remove(){},toggle(){}}};
  ctx.document.querySelector=()=>toast;ctx.document.createElement=()=>({click(){}});
  n['#csv'].onclick();
  const lines=(await blob.text()).trim().split('\n');assert.equal(lines.length,301);
  for(const line of lines) assert.equal(line.split(',').length,4,line);
});
test('Dropping on a dropzone processes the file once instead of bubbling twice', () => {
  const {app}=catalogue();const handlers={dz:{},box:{},input:{}};let count=0;
  const input={addEventListener:(k,f)=>handlers.input[k]=f,click(){}};
  const box={addEventListener:(k,f)=>handlers.box[k]=f};
  const dz={querySelector:()=>input,closest:()=>box,classList:{add(){},remove(){}},addEventListener:(k,f)=>{handlers.dz[k]=f;}};
  app.onFiles({querySelector:()=>dz},fs=>{count+=fs.length;});
  let stopped=false;const event={preventDefault(){},stopPropagation(){stopped=true;},dataTransfer:{files:[{name:'photo.png'}]}};
  handlers.dz.drop(event);if(!stopped) handlers.box.drop(event);
  assert.equal(count,1);
});
