import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = process.argv.includes('--baseline');
const output = path.join(root, 'verification', baseline ? 'initial' : 'final');
await mkdir(output, { recursive: true });
const mount = '/works/gpt-6-1-sol-r2/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (!url.pathname.startsWith(mount)) { response.writeHead(404).end(); return; }
    const relative = decodeURIComponent(url.pathname.slice(mount.length)) || 'index.html';
    const file = path.resolve(root, 'dist', relative);
    if (!file.startsWith(path.join(root, 'dist') + path.sep)) { response.writeHead(403).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(5201, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const errors = [];
const externalRequests = [];
const results = { deploymentPath: mount, viewports: [], consoleErrors: errors, externalRequests };
try {
  const page = await browser.newPage({ viewport: { width:1440, height:900 }, deviceScaleFactor:1 });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if(!request.url().startsWith('http://127.0.0.1:5201')) externalRequests.push(request.url()); });
  await page.goto(`http://127.0.0.1:5201${mount}`, { waitUntil:'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await page.waitForTimeout(1700);
  const inspect = async (label) => {
    const measured = await page.evaluate(() => ({
      width:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      horizontalOverflow:document.documentElement.scrollWidth > innerWidth,
      fontLoaded:document.fonts.check('500 20px "Space Grotesk Variable"'),
      canvasCount:document.querySelectorAll('canvas').length,
      brokenImages:[...document.images].filter(image => !image.complete || !image.naturalWidth).length,
      outside:[...document.querySelectorAll('h1,h2,h3,.hero-copy p,.context-head p,.benchmark-head p,.together-copy>p,.limits-copy>p')].filter(element => {
        const rect=element.getBoundingClientRect();return rect.left<-.5 || rect.right>innerWidth+.5;
      }).map(element=>element.textContent),
    }));
    results.viewports.push({ label, ...measured });
    assert.equal(measured.horizontalOverflow,false,`${label}: horizontal overflow`);
    assert.equal(measured.fontLoaded,true,`${label}: local font`);
    assert.equal(measured.canvasCount,3,`${label}: all sculptures rendered`);
    assert.equal(measured.brokenImages,0,`${label}: broken images`);
    assert.deepEqual(measured.outside,[],`${label}: text outside viewport`);
  };
  await inspect('1440×900');
  await page.screenshot({path:path.join(output,'01-desktop-hero.png')});
  await page.locator('#benchmark').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,'02-desktop-climax.png')});
  await page.locator('#benchmark').screenshot({path:path.join(output,'02-full-climax.png')});
  await page.locator('#together').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'02 拆解與實作'}).click();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#spread-output').textContent(),'100%');
  assert.equal(await page.locator('[data-step="1"]').getAttribute('aria-pressed'),'true');
  await page.locator('#together').screenshot({path:path.join(output,'03-interactive-expanded.png')});
  await page.locator('#reset-scene').click();
  assert.equal(await page.locator('#spread-output').textContent(),'0%');
  await page.locator('#spread').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#spread-output').textContent(),'1%');
  await page.emulateMedia({reducedMotion:'reduce'});
  const scene = page.locator('#work-scene');
  await scene.scrollIntoViewIfNeeded();
  await page.locator('#spread').blur();
  await page.waitForTimeout(300);
  const hash = buffer => createHash('sha256').update(buffer).digest('hex');
  const beforeDrag = hash(await scene.screenshot());
  const box = await scene.boundingBox();
  await page.mouse.move(box.x+box.width*.35,box.y+box.height*.5);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:12});
  await page.mouse.up();
  await page.waitForTimeout(700);
  assert.notEqual(hash(await scene.screenshot()),beforeDrag,'Dragging must change the rendered sculpture');
  await page.locator('#reset-scene').click();
  await page.waitForTimeout(1000);
  await page.emulateMedia({reducedMotion:'no-preference'});
  results.interaction = { phaseButton:true, reset:true, keyboardSlider:true, dragChangesRendering:true };
  assert.equal(await page.locator('.raw-scores').getAttribute('open'),'');
  await page.locator('.raw-scores summary').click();
  assert.equal(await page.locator('.raw-scores').getAttribute('open'),null);
  await page.locator('.raw-scores summary').click();
  assert.equal(await page.locator('.raw-scores').getAttribute('open'),'');
  await page.locator('#capability').screenshot({path:path.join(output,'04-desktop-context.png')});
  await page.locator('#limits').screenshot({path:path.join(output,'05-desktop-limits.png')});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForTimeout(1200);
  await inspect('390×844');
  await page.screenshot({path:path.join(output,'06-mobile-hero.png')});
  await page.locator('#capability').screenshot({path:path.join(output,'07-mobile-context.png')});
  await page.locator('#benchmark').screenshot({path:path.join(output,'08-mobile-climax.png')});
  await page.locator('#together').screenshot({path:path.join(output,'09-mobile-interaction.png')});
  await page.getByRole('button',{name:'02 拆解與實作'}).click();
  await page.waitForTimeout(1000);
  await page.locator('#together').screenshot({path:path.join(output,'09b-mobile-expanded.png')});
  await page.locator('#limits').screenshot({path:path.join(output,'10-mobile-limits.png')});
  await page.locator('#evidence').screenshot({path:path.join(output,'11-mobile-evidence.png')});
  await page.locator('.evidence-block').nth(0).screenshot({path:path.join(output,'11a-mobile-specifications.png')});
  await page.locator('.evidence-block').nth(2).screenshot({path:path.join(output,'11b-mobile-comparison.png')});
  const comparison = page.locator('.comparison-table').locator('..');
  const scrolled = await comparison.evaluate(element => { element.scrollLeft=element.scrollWidth; return element.scrollLeft>0; });
  assert.equal(scrolled,true,'Mobile comparison must allow native horizontal scrolling');
  results.mobileTableScroll = true;
  await comparison.evaluate(element=>element.scrollLeft=0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await page.getByRole('button',{name:'03 驗證與修正'}).click();
  assert.equal(await page.locator('#spread-output').textContent(),'42%');
  assert.equal(await page.locator('main section').count(),6);
  results.reducedMotion = { matches:await page.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches), allSections:6, interaction:true };
  await page.screenshot({path:path.join(output,'12-reduced-motion.png')});
  assert.deepEqual(errors,[],'Console must have no errors');
  assert.deepEqual(externalRequests,[],'All fonts and rendering assets must be self-hosted');
  results.passed=true;
} finally {
  await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
process.stdout.write(JSON.stringify(results,null,2)+'\n');
