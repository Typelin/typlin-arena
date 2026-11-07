const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
let html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const cssPath = html.match(/href="(\.\/assets\/[^\"]+\.css)"/)[1];
const jsPath = html.match(/src="(\.\/assets\/[^\"]+\.js)"/)[1];
let css = fs.readFileSync(path.join(root, 'dist', cssPath), 'utf8');
css = css.replace(/url\((["']?)([^)"']+\.(?:woff2|png))\1\)/g, (_, quote, file) => {
  const asset = fs.readFileSync(path.join(root, 'dist/assets', path.basename(file)), 'base64');
  const mime = file.endsWith('.png') ? 'image/png' : 'font/woff2';
  return `url(data:${mime};base64,${asset})`;
});
const js = fs.readFileSync(path.join(root, 'dist', jsPath), 'utf8');
html = html.replace(/<script type="module"[^>]*><\/script>/, '').replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
html = html.replace('</body>', `<script>${js.replace(/<\/script/gi, '<\\/script')}</script></body>`);
fs.writeFileSync(path.join(root, 'preview.html'), html);
