import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const out=resolve('qa/screenshots');await mkdir(out,{recursive:true});
const label=process.argv[2]||'portrait-v1';
const dist=resolve('dist'), prefix='/works/gpt-6-astra/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return}const file=resolve(dist,decodeURIComponent(url.pathname.slice(prefix.length)||'index.html'));if(!file.startsWith(dist+sep)){res.writeHead(403);res.end();return}const body=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(5187,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
const snap=async name=>page.screenshot({path:resolve(out,label+'-'+name+'.png')});
const section=async id=>{await page.locator('#'+id).scrollIntoViewIfNeeded();await page.evaluate(id=>scrollTo(0,document.querySelector('#'+id).offsetTop),id);await page.waitForTimeout(500)};
const measure=async()=>page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('h1,h2,h3,button,input,#score-big,.chart-value,.context-detail')].filter(e=>{if(e.closest('[aria-hidden="true"]'))return false;const r=e.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>innerWidth+.5)}).map(e=>({text:e.textContent?.trim().slice(0,70),class:e.className})),fonts:[document.fonts.check('16px "Space Grotesk Variable"'),document.fonts.check('16px "IBM Plex Mono"')]}));
try{
 await page.goto('http://127.0.0.1:5187'+prefix,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
 await snap('desktop');const metrics=[await measure()];
 for(const id of ['context','work','scores','limits']){await section(id);await snap(id);await page.locator('#'+id).screenshot({path:resolve(out,label+'-'+id+'-section.png')})}
 await page.locator('#context-zoom').fill('100');await page.locator('[data-context-clue="acceptance"]').click();assert.equal(await page.locator('[data-context-primary]').innerText(),'390');await page.waitForTimeout(650);await section('context');await snap('context-detail');
 await section('home');await page.locator('[data-mode="1"]').click();await page.waitForTimeout(900);await snap('image-input');assert.match(await page.locator('#material-copy').innerText(),/截圖/);
 await page.locator('[data-mode="2"]').click();await page.waitForTimeout(900);await snap('code-input');
 await page.locator('[data-collab-stage="2"]').click();await page.waitForTimeout(700);assert.equal(await page.locator('[data-session="afternoon"]').isDisabled(),true);
 await page.locator('.collab-submit').click();assert.equal(await page.locator('#collab-email').getAttribute('aria-invalid'),'true');
 await page.locator('#collab-email').fill('test@example.com');await page.locator('.collab-submit').click();assert.match(await page.locator('#collab-email-status').innerText(),/檢查通過/);await section('work');await snap('work-verified');
 await page.locator('[data-metric="cost"]').click();assert.equal(await page.locator('#score-big').innerText(),'$6.24');await section('scores');await page.waitForTimeout(1000);await snap('cost');
 await page.locator('[data-metric="time"]').click();assert.equal(await page.locator('#score-big').innerText(),'18.2');
 await page.locator('[data-metric="score"]').click();
 await page.locator('[data-input-kind="audio"]').click();await page.waitForTimeout(1100);assert.equal(await page.locator('#limits-outcome').innerText(),'原生不支援');await section('limits');await snap('audio-limit');
 await page.locator('[data-input-kind="image"]').click();await page.waitForTimeout(1500);assert.equal(await page.locator('#limits-outcome').innerText(),'可讀');
 for(const size of [{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(size);await section('home');await page.locator('[data-mode="0"]').click();await page.waitForTimeout(900);await snap(size.width===390?'mobile':'tablet');metrics.push(await measure());
  if(size.width===390){for(const mode of ['1','2']){await page.locator('[data-mode="'+mode+'"]').click();await page.waitForTimeout(1000);await snap('mobile-input-'+mode)}for(const id of ['context','work','scores','limits','evidence']){await section(id);await snap('mobile-'+id);metrics.push(await measure())}for(const key of ['cost','time','score']){await page.locator('[data-metric="'+key+'"]').click();await page.waitForTimeout(1200);metrics.push(await measure());await section('scores');await snap('mobile-'+key)}}
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await section('home');await page.locator('[data-mode="1"]').click();await page.waitForTimeout(100);
 const still1=await page.locator('#portrait canvas').screenshot();await page.waitForTimeout(200);const still2=await page.locator('#portrait canvas').screenshot();assert.equal(still1.toString('base64'),still2.toString('base64'));
 const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>!document.getElementById(h.slice(1))));assert.deepEqual(broken,[]);
 await page.locator('#context-zoom').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#context-zoom').inputValue(),'0');await page.keyboard.press('End');assert.equal(await page.locator('#context-zoom').inputValue(),'100');
 await page.locator('[data-input-kind="video"]').click();assert.equal(await page.locator('#limits-outcome').innerText(),'原生不支援');
 const fallback=await browser.newPage({viewport:{width:390,height:844}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2')return null;return original.call(this,type,...args)}});await fallback.goto('http://127.0.0.1:5187'+prefix,{waitUntil:'networkidle'});assert.equal(await fallback.locator('#portrait canvas').count(),0);await fallback.locator('[data-mode="2"]').click();assert.match(await fallback.locator('#material-copy').innerText(),/修改互動/);await fallback.screenshot({path:resolve(out,label+'-fallback.png')});await fallback.close();
 await writeFile(resolve(out,label+'-results.json'),JSON.stringify({date:'2026-11-07',deploymentPrefix:prefix,metrics,errors},null,2));
 console.info(JSON.stringify({metrics,errors},null,2));assert.deepEqual(errors,[]);for(const m of metrics){assert.equal(m.width,m.scrollWidth);assert.deepEqual(m.outside,[])}
}finally{await browser.close();await new Promise(r=>server.close(r))}
