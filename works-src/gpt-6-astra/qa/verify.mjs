import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const out=fileURLToPath(new URL('./screenshots/',import.meta.url));
const label=process.argv[2]||'final';
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'};
const prefix='/works/gpt-6-astra/';
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
    const target=resolve(root,decodeURIComponent(pathname.slice(prefix.length)||'index.html'));
    if(!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(target);
    res.writeHead(200,{'content-type':mime[extname(target)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(5187,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[],failedRequests=[],metrics=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
page.on('response',r=>{if(r.status()>=400)failedRequests.push({url:r.url(),status:r.status()})});
const snapshot=async name=>page.screenshot({path:resolve(out,`${label}-${name}.png`)});
const gotoSection=async id=>{await page.evaluate(id=>window.scrollTo({top:document.querySelector(id).offsetTop,behavior:'instant'}),id);await page.waitForTimeout(350);};
const measure=async()=>page.evaluate(()=>({viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,fonts:[document.fonts.check('16px "Space Grotesk Variable"'),document.fonts.check('16px "IBM Plex Mono"')],headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>{const r=e.getBoundingClientRect();return r.left<0||r.right>innerWidth+1}).map(e=>e.textContent),canvases:document.querySelectorAll('canvas').length}));
try{
  await page.goto(`http://127.0.0.1:5187${prefix}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(450);
  metrics.push(await measure());
  const brokenAnchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));
  assert.deepEqual(brokenAnchors,[]);
  await snapshot('desktop');
  const initial=await page.locator('#sculpture canvas').screenshot();
  await page.locator('#unfold').fill('100');
  await page.waitForTimeout(850);
  assert.equal(await page.locator('#unfold-value').textContent(),'100%');
  const unfolded=await page.locator('#sculpture canvas').screenshot();
  assert.notEqual(initial.toString('base64'),unfolded.toString('base64'));
  await snapshot('interaction');
  await page.locator('#unfold').fill('0');
  await gotoSection('#context');await snapshot('context');
  await gotoSection('#work');
  await page.locator('[data-step="1"]').click();
  assert.equal(await page.locator('[data-step="1"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-step="2"]').click();
  await page.waitForTimeout(600);
  assert.match(await page.locator('#step-description').textContent(),/沒有跑過/);
  await snapshot('work');
  await gotoSection('#scores');
  await page.waitForFunction(()=>document.querySelector('#score-scene').dataset.settled==='true');
  await snapshot('climax');
  await page.locator('#scores').screenshot({path:resolve(out,`${label}-climax-section.png`)});
  const scoreBefore=await page.locator('#score-scene canvas').screenshot();
  await page.locator('#score-spread').click();
  assert.equal(await page.locator('#score-spread').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelector('#score-scene').dataset.settled==='true');
  const scoreAfter=await page.locator('#score-scene canvas').screenshot();
  assert.notEqual(scoreBefore.toString('base64'),scoreAfter.toString('base64'));
  await page.locator('#scores').screenshot({path:resolve(out,`${label}-score-expanded.png`)});
  await page.locator('#score-spread').click();
  await page.waitForFunction(()=>document.querySelector('#score-scene').dataset.settled==='true');
  await gotoSection('#limits');await snapshot('limits');
  await gotoSection('#evidence');await snapshot('evidence');
  for(const size of [{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]){
    await page.setViewportSize(size);await gotoSection('#home');
    const m=await measure();metrics.push(m);
    assert.equal(m.scrollWidth,size.width);assert.deepEqual(m.headings,[]);assert.ok(m.fonts.every(Boolean));
    if(size.width===768)await snapshot('tablet');
    if(size.width===390){
      await snapshot('mobile');
      await page.locator('#unfold').focus();await page.keyboard.press('End');
      assert.equal(await page.locator('#unfold-value').textContent(),'100%');
      await page.waitForTimeout(700);await snapshot('mobile-unfolded');
      await page.locator('#unfold').fill('0');
      for(const section of ['context','work','scores','limits','evidence']){
        await gotoSection('#'+section);await snapshot('mobile-'+section);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
      }
      await page.locator('details').last().locator('summary').click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});await gotoSection('#home');
  await page.locator('#unfold').fill('100');
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#unfold-value').textContent(),'100%');
  const still1=await page.locator('#sculpture canvas').screenshot();
  await page.waitForTimeout(250);
  const still2=await page.locator('#sculpture canvas').screenshot();
  assert.equal(still1.toString('base64'),still2.toString('base64'),'Reduced-motion sculpture stays still');
  await gotoSection('#work');await page.locator('[data-step="0"]').click();
  assert.equal(await page.locator('[data-step="0"]').getAttribute('aria-pressed'),'true');
  await gotoSection('#scores');
  await page.locator('#score-spread').click();
  await page.waitForFunction(()=>document.querySelector('#score-scene').dataset.settled==='true');
  const stillScore1=await page.locator('#score-scene canvas').screenshot();
  await page.waitForTimeout(150);
  const stillScore2=await page.locator('#score-scene canvas').screenshot();
  assert.equal(stillScore1.toString('base64'),stillScore2.toString('base64'));
  await page.locator('#score-spread').click();
  await gotoSection('#limits');
  const stillLimits1=await page.locator('#limits-scene canvas').screenshot();
  await page.waitForTimeout(150);
  const stillLimits2=await page.locator('#limits-scene canvas').screenshot();
  assert.equal(stillLimits1.toString('base64'),stillLimits2.toString('base64'));
  await gotoSection('#home');await page.locator('#unfold').fill('0');
  await page.screenshot({path:resolve(out,`${label}-full-desktop.png`),fullPage:true});
  const thumbnail=await context.newPage();
  await thumbnail.setViewportSize({width:480,height:300});
  const heroImage=await readFile(resolve(out,`${label}-desktop.png`));
  await thumbnail.setContent(`<style>body{margin:0}img{display:block;width:480px;height:300px}</style><img alt="Poster thumbnail" src="data:image/png;base64,${heroImage.toString('base64')}">`);
  await thumbnail.screenshot({path:resolve(out,`${label}-thumbnail.png`)});
  await thumbnail.close();
  const fallbackPage=await context.newPage();
  const fallbackErrors=[];
  fallbackPage.on('pageerror',e=>fallbackErrors.push(e.message));
  fallbackPage.on('console',m=>{if(m.type()==='error')fallbackErrors.push(m.text())});
  await fallbackPage.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args)};
  });
  await fallbackPage.goto(`http://127.0.0.1:5187${prefix}`,{waitUntil:'networkidle'});
  assert.equal(await fallbackPage.locator('.fallback').count(),1);
  const heights=await fallbackPage.locator('.score-fallback>span').evaluateAll(bars=>bars.map(bar=>bar.getBoundingClientRect().height));
  assert.equal(heights.length,4);assert.equal(heights[0],heights[1]);assert.equal(heights[2],heights[3]);
  assert.ok(Math.abs(heights[2]/heights[0]-55/57)<.001);
  await fallbackPage.locator('#unfold').fill('100');
  assert.equal(await fallbackPage.locator('#unfold-value').textContent(),'100%');
  assert.deepEqual(fallbackErrors,[]);
  await fallbackPage.close();
  assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
  const result={result:'PASS',date:'2026-11-05',factsChecked:'2026-11-04',mount:prefix,metrics,consoleErrors:errors,failedRequests,fallback:{errors:fallbackErrors,heights},checks:['production subpath','local fonts','desktop / mobile / tablet overflow','all internal anchors','slider and canvas change','keyboard slider','all work steps','score sculpture expansion and reset','source details','reduced-motion static rendering for all three WebGL scenes','WebGL fallback with proportional chart']};
  await writeFile(resolve(out,`${label}-results.json`),JSON.stringify(result,null,2));
  console.info(JSON.stringify(result,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
