import { after, afterEach, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { chromium, expect } from '@playwright/test';

const prefix = '/noetica-pages-check/';
const output = resolve('.local/pages-check');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
let server, browser, context, page, origin, problems;
const route = name => `${origin}${prefix}public/pages/${name}.html`;

before(async () => {
  // Keep the normal dist build intact. No SPA fallback: wrong paths must 404.
  await import('../../scripts/pages.mjs');
  process.env.VITE_BASE_PATH = prefix;
  const { build } = await import('vite');
  await build({ build: { outDir: output, emptyOutDir: true }, logLevel: 'warn' });
  server = createServer(async (request, response) => {
    try {
      let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!path.startsWith(prefix)) { response.writeHead(404).end(); return; }
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(output, path.slice(prefix.length));
      if (!file.startsWith(output + sep)) { response.writeHead(404).end(); return; }
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
    }
  });
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
});

beforeEach(async () => {
  problems = [];
  context = await browser.newContext({ reducedMotion: 'reduce' });
  page = await context.newPage();
  page.on('pageerror', error => problems.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(origin) && response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', request => {
    if (request.url().startsWith(origin) && !new URL(request.url()).pathname.startsWith(prefix)) problems.push(`Outside site: ${request.url()}`);
  });
});

afterEach(async () => {
  await context?.close();
  assert.deepEqual(problems, [], 'No runtime errors or requests outside the repository path');
});
after(async () => {
  await browser?.close();
  if (server) {
    server.closeAllConnections();
    await new Promise(done => server.close(done));
  }
});

test('production assets and every direct page load stay inside the repository', async () => {
  assert.equal((await fetch(`${origin}/`)).status, 404);
  assert.equal((await fetch(`${origin}/public/pages/cursos.html`)).status, 404);
  await access(resolve(output, '.nojekyll'));
  const source = await readFile('index.html', 'utf8');
  assert.ok(source.includes('<base href="/">'), 'Building must not change the local development base');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${origin}${prefix}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(() => page.locator('#bg-video').evaluate(video => video.readyState)).toBeGreaterThan(0);
  assert.ok(await page.locator('#bg-video').evaluate(video => video.currentSrc.includes('/noetica-pages-check/IMG/')));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const name of ['cursos', 'classroom', 'dashboard', 'inspiracoes', 'prompts', 'comunidade', 'login', 'admin-seed']) {
    const response = await page.goto(route(name));
    assert.equal(response.status(), 200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    assert.equal(await page.evaluate(() => document.baseURI), `${origin}${prefix}`);
  }
});

test('Swup navigation, browser history and home links preserve the prefix', async () => {
  await page.goto(route('cursos'));
  await page.evaluate(() => { window.navigationMarker = 'same-document'; });
  for (const [label, title] of [['Inspirações', 'Ideias que acendem'], ['Prompts', 'Boas perguntas'], ['Comunidade', 'Toda pergunta']]) {
    await page.locator('#main-nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
    assert.equal(await page.evaluate(() => window.navigationMarker), 'same-document');
    assert.ok(new URL(page.url()).pathname.startsWith(prefix));
  }
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Boas perguntas');
  await page.getByRole('link', { name: 'Noética — início' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Você tem a ideia');
  await expect(page).toHaveURL(`${origin}${prefix}index.html`);
  assert.equal(await page.evaluate(() => window.navigationMarker), 'same-document');
});

test('lesson links, active navigation and skip link keep the current lesson', async () => {
  await page.goto(`${route('classroom')}?aula=mentalidade`);
  await expect(page.locator('#main-nav').getByRole('link', { name: 'Trilhas' })).toHaveAttribute('aria-current', 'page');
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${route('classroom')}?aula=mentalidade#swup`);
  await expect(page.locator('#swup')).toBeFocused();
  await page.getByRole('link', { name: 'Próxima aula' }).click();
  await expect(page).toHaveURL(`${route('classroom')}?aula=html`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('HTML');
});

test('creating a project navigates to its workspace without a full reload', async () => {
  await page.goto(route('inspiracoes'));
  await page.evaluate(() => { window.navigationMarker = 'same-document'; });
  await page.getByRole('button', { name: 'Explorar briefing de Orbit' }).click();
  await page.getByRole('button', { name: 'Criar no meu workspace' }).click();
  await expect(page).toHaveURL(route('dashboard'));
  await expect(page.locator('[data-stat-projects]')).toHaveText('1');
  assert.equal(await page.evaluate(() => window.navigationMarker), 'same-document');
  await page.reload();
  await expect(page.locator('#project-list')).toContainText('Orbit');
});
