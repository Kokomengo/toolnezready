/* Build complete static pages with the same rendering code as the browser. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const BASE = (process.argv[2] || 'https://toolnez.vercel.app').replace(/\/$/, '');
const dir = __dirname, out = path.join(dir, 'public');
const assets = ['adsense.js','lib.js','editorial.js','guides.js','site-pages.js','core.js','tools-media.js','tools-docs.js','tools-calc.js','tools-retouch.js','styles.css','ads.txt','robots.txt','og.jpg'];
function catalogue() {
  const context = vm.createContext({console, document:{}, TextEncoder, TextDecoder, Blob, URL});
  context.window = context;
  for (const file of assets.filter(x=>x.endsWith('.js') && x!=='adsense.js')) {
    vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
  }
  return {app:context.ToolNez, guides:context.ToolNezGuides, context};
}
function build() {
  const {app,guides} = catalogue();
  const routes = ['/',...Object.keys(app.CATS).map(x=>'/c/'+x),...app.TOOLS.map(x=>'/tools/'+x.id),
    '/guides',...Object.keys(guides).map(x=>'/guides/'+x),...Object.keys(app.PAGES).map(x=>'/p/'+x)];
  const shell = fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const esc = app.esc;
  fs.mkdirSync(out,{recursive:true});
  for (const file of assets) {
    if (fs.existsSync(path.join(dir,file))) fs.copyFileSync(path.join(dir,file),path.join(out,file));
    else if(file!=='og.jpg') throw new Error('Missing asset '+file);
  }
  const write = (route,is404=false) => {
    const page = app.renderPage(route);
    if (!page.exists && !is404) throw new Error('Unrenderable route '+route);
    const canonical = BASE+(route==='/'?'/':route);
    let html = shell.replace(/<main id="main">[\s\S]*?<\/main>/, '<main id="main">'+page.html.replace(/class="tcard rise"/g,'class="tcard rise seen"')+'</main>')
      .replace(/<title>.*?<\/title>/,'<title>'+esc(page.title)+'</title>')
      .replace(/(<meta name="description" content=")[^"]*/,'$1'+esc(page.description))
      .replace(/(<link rel="canonical" href=")[^"]*/,'$1'+canonical)
      .replace(/(<meta property="og:url" content=")[^"]*/,'$1'+canonical)
      .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g,'$1'+esc(page.title))
      .replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g,'$1'+esc(page.description))
      .replace('<b id="ntools">–</b>','<b id="ntools">'+app.TOOLS.length+'</b>')
      .replace('<span id="yr"></span>','<span id="yr">2026</span>');
    if(is404) html=html.replace('</head>','<meta name="robots" content="noindex"></head>');
    const filename=route==='/'?'index.html':is404?'404.html':route.slice(1)+'.html';
    fs.mkdirSync(path.dirname(path.join(out,filename)),{recursive:true});
    fs.writeFileSync(path.join(out,filename),html);
  };
  routes.forEach(x=>write(x)); write('/404',true);
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.map(x=>'  <url><loc>'+esc(BASE+(x==='/'?'/':x))+'</loc></url>').join('\n')+'\n</urlset>\n';
  const llms='# ToolNez\n\n36 free browser tools with instructions, examples and limitations. Content is in English.\n\n'+app.TOOLS.map(t=>'- ['+t.name+']('+BASE+'/tools/'+t.id+'): '+t.tagline).join('\n')+'\n\nGuides: '+BASE+'/guides\nAbout: '+BASE+'/p/about\nPrivacy: '+BASE+'/p/privacy\nContact: '+BASE+'/p/contact\n\nLocal file processing; PDF reading downloads pdf.js on demand. Markdown drafts use browser storage. Advertising is disabled during review.\n';
  for(const [file,content] of [['sitemap.xml',sitemap],['llms.txt',llms]]) {
    fs.writeFileSync(path.join(out,file),content); fs.writeFileSync(path.join(dir,file),content);
  }
  console.log('Built '+routes.length+' content pages and a noindex 404. '+app.TOOLS.length+' tools. Output: public/');
  return {app,routes,out};
}
if(require.main===module) build();
module.exports={build,catalogue};

