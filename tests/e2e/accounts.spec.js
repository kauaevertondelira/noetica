import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const facade = await readFile(new URL('../fixtures/cloud-services.js', import.meta.url), 'utf8');
  await page.route('**/assets/firebase-services-*.js', route => route.fulfill({ contentType: 'application/javascript', body: facade }));
});

async function signIn(page) {
  await page.goto('/public/pages/login.html');
  await page.locator('#auth-email').fill('test@example.com');
  await page.locator('#auth-password').fill('test-password');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
}

test('accounts keep guest drafts separate and restore them after sign out', async ({ page }) => {
  await page.goto('/public/pages/dashboard.html');
  await page.locator('#scratchpad').fill('Nota privada do visitante');
  await page.getByRole('link', { name: 'Entrar', exact: true }).click();
  await page.locator('#auth-email').fill('test@example.com');
  await page.locator('#auth-password').fill('test-password');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('[data-sync-status]')).toContainText('sincronizado');
  await expect(page.locator('#scratchpad')).toHaveValue('');
  await page.locator('#scratchpad').fill('Nota privada da conta');
  await page.getByRole('button', { name: 'Salvar agora' }).click();
  await expect.poll(() => page.evaluate(() => window.__cloudWrites.at(-1)?.data.study.scratchpad)).toBe('Nota privada da conta');
  await page.getByRole('link', { name: 'Minha conta', exact: true }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await page.getByRole('link', { name: 'Continuar sem cadastro' }).click();
  await expect(page.locator('#scratchpad')).toHaveValue('Nota privada do visitante');
  expect(await page.evaluate(() => window.__cloudWrites.some(w => w.data.study.scratchpad === 'Nota privada do visitante'))).toBe(false);
});

test('a denied profile read preserves account edits and can be retried', async ({ page }) => {
  await page.addInitScript(() => { window.__profileError = true; });
  await signIn(page);
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('[data-sync-status]')).toContainText('indisponível');
  await page.locator('#scratchpad').fill('Continuo aprendendo sem rede');
  await page.getByRole('button', { name: 'Salvar agora' }).click();
  await page.evaluate(() => { window.__profileError = false; });
  await page.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.locator('[data-sync-status]')).toContainText('sincronizado');
  await expect(page.locator('#scratchpad')).toHaveValue('Continuo aprendendo sem rede');
  expect(await page.evaluate(() => window.__cloudWrites.at(-1).data.study.scratchpad)).toBe('Continuo aprendendo sem rede');
});

test('sync failures keep local data and a retry clears the pending marker', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('[data-sync-status]')).toContainText('sincronizado');
  await page.evaluate(() => { window.__writeError = true; });
  await page.locator('#scratchpad').fill('Ainda salvo localmente');
  await page.getByRole('button', { name: 'Salvar agora' }).click();
  await expect(page.locator('[data-sync-status]')).toContainText('indisponível');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('noetica:v2:test-account')).scratchpad)).toBe('Ainda salvo localmente');
  expect(await page.evaluate(() => localStorage.getItem('noetica:pending:test-account'))).toBe('1');
  await page.evaluate(() => { window.__writeError = false; });
  await page.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.locator('[data-sync-status]')).toContainText('sincronizado');
  expect(await page.evaluate(() => localStorage.getItem('noetica:pending:test-account'))).toBeNull();
});

test('authentication failures show actionable feedback and release the form', async ({ page }) => {
  await page.addInitScript(() => { window.__authError = 'auth/unauthorized-domain'; });
  await signIn(page);
  await expect(page.locator('#auth-feedback')).toContainText('não está habilitado para este endereço');
  await expect(page.locator('#auth-submit')).toBeEnabled();
  await page.getByRole('link', { name: 'Continuar sem cadastro' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
