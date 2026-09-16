import { test, expect } from '@playwright/test';
import { lessons } from '../../public/assets/js/content.js';

const p = name => `/public/pages/${name}.html`;
const study = page => page.evaluate(() => JSON.parse(localStorage.getItem('noetica:v2:guest') || '{}'));

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('all pages work through Swup and direct loads without runtime errors', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Você tem a ideia');
  await page.evaluate(() => { window.navigationMarker = 'same-document'; });
  for (const [label, title] of [['Trilhas', 'Todo começo'], ['Inspirações', 'Ideias que acendem'], ['Prompts', 'Boas perguntas'], ['Comunidade', 'Toda pergunta']]) {
    await page.locator('#main-nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
    expect(await page.evaluate(() => window.navigationMarker)).toBe('same-document');
  }
  for (const name of ['dashboard', 'classroom', 'login', 'admin-seed', 'cursos', 'prompts', 'inspiracoes', 'comunidade']) {
    await page.goto(p(name));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#swup')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('lesson quiz, completion, notes and URL survive navigation and reload', async ({ page }) => {
  await page.goto(p('classroom') + '?aula=mentalidade');
  await expect(page.locator('#complete-lesson')).toBeDisabled();
  await page.locator('input[name=answer][value="0"]').check();
  await page.getByRole('button', { name: 'Verificar resposta' }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('Tente novamente');
  await page.locator('input[name=answer][value="1"]').check();
  await page.getByRole('button', { name: 'Verificar resposta' }).click();
  await page.locator('#complete-lesson').click();
  await expect(page.locator('#complete-lesson')).toHaveText('Aula concluída');
  await page.getByRole('tab', { name: 'Minhas notas' }).click();
  await page.locator('#lesson-notes').fill('Entendi entrada, processo e saída.');
  await page.getByRole('link', { name: 'Próxima aula' }).click();
  await expect(page).toHaveURL(/aula=html/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('HTML');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Você pensa');
  await page.getByRole('tab', { name: 'Minhas notas' }).click();
  await expect(page.locator('#lesson-notes')).toHaveValue('Entendi entrada, processo e saída.');
  await page.reload();
  await expect(page.locator('#complete-lesson')).toBeDisabled();
  expect((await study(page)).completed).toEqual(['mentalidade']);
});

test('the full curriculum can be completed and XP is idempotent', async ({ page }) => {
  for (const lesson of lessons) {
    await page.goto(p('classroom') + '?aula=' + lesson.id);
    await page.locator(`input[name=answer][value="${lesson.quiz.answer}"]`).check();
    await page.getByRole('button', { name: 'Verificar resposta' }).click();
    await page.locator('#complete-lesson').click();
  }
  await page.goto(p('dashboard'));
  await expect(page.locator('.level-pill')).toContainText('600 XP');
  await expect(page.locator('[data-stat-lessons]')).toHaveText('12 / 12');
  await page.goto(p('classroom') + '?aula=html');
  await expect(page.locator('.completion-banner')).toBeVisible();
  await expect(page.locator('#complete-lesson')).toBeDisabled();
});

test('lab executes JavaScript in an isolated frame and keeps code drafts', async ({ page }) => {
  await page.goto(p('classroom') + '?aula=javascript');
  await page.getByRole('tab', { name: 'Laboratório' }).click();
  await page.getByRole('button', { name: 'Executar código' }).click();
  const frame = page.frameLocator('#lab-preview');
  await frame.getByRole('button', { name: 'Mais uma ideia' }).click();
  await expect(frame.locator('#total')).toHaveText('1');
  expect(await page.locator('#lab-preview').getAttribute('sandbox')).toBe('allow-scripts');
  await page.locator('#lab-code').fill('<h1>Meu experimento</h1>');
  await page.getByRole('button', { name: 'Executar código' }).click();
  await expect(frame.getByRole('heading')).toHaveText('Meu experimento');
  await page.getByRole('link', { name: 'Meu espaço' }).click();
  await page.goto(p('classroom') + '?aula=javascript');
  await page.getByRole('tab', { name: 'Laboratório' }).click();
  await expect(page.locator('#lab-code')).toHaveValue('<h1>Meu experimento</h1>');
});

test('inspiration search, bookmarks and project creation lead to editable workspace', async ({ page }) => {
  await page.goto(p('inspiracoes'));
  await page.getByRole('button', { name: 'Salvar Orbit', exact: true }).click();
  await page.getByRole('button', { name: 'Salvos', exact: true }).click();
  await expect(page.locator('.inspiration-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Explorar briefing de Orbit' }).click();
  await page.getByRole('button', { name: 'Criar no meu workspace' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.locator('[data-project]').click();
  await page.locator('#project-title').fill('<img src=x onerror=alert(1)>');
  await page.locator('#project-status').selectOption('done');
  await page.getByRole('button', { name: 'Salvar projeto' }).click();
  await expect(page.locator('#project-list')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#project-list img')).toHaveCount(0);
  await expect(page.locator('.level-pill')).toContainText('150 XP');
  await page.reload();
  await expect(page.locator('[data-stat-projects]')).toHaveText('1');
  await page.locator('[data-project]').click();
  await page.locator('#project-demo').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Salvar projeto' }).click();
  await expect(page.locator('#project-form .form-feedback')).toContainText('endereço completo');
  await page.getByRole('button', { name: 'Excluir projeto', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão deste projeto' }).click();
  await expect(page.locator('[data-stat-projects]')).toHaveText('0');
});

test('prompt filters, search and clipboard feedback work after Swup navigation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('#main-nav').getByRole('link', { name: 'Prompts' }).click();
  await page.getByRole('button', { name: 'Revisão', exact: true }).click();
  await expect(page.locator('.prompt-card')).toHaveCount(2);
  await page.locator('#catalog-search').fill('investigue');
  await expect(page.locator('.prompt-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Copiar prompt', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('investigar este erro');
  await page.locator('#catalog-search').fill('zzzzzz');
  await expect(page.locator('.empty-state')).toBeVisible();
});

test('workspace autosave and progress export/import preserve actual data', async ({ page }) => {
  await page.goto(p('dashboard'));
  await page.locator('#scratchpad').fill('Minha ideia de estudo');
  await page.getByRole('button', { name: 'Salvar agora' }).click();
  await page.reload();
  await expect(page.locator('#scratchpad')).toHaveValue('Minha ideia de estudo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar progresso' }).click();
  const download = await downloadPromise;
  const file = await download.path();
  await page.locator('#scratchpad').fill('Alteração posterior');
  await page.getByRole('button', { name: 'Salvar agora' }).click();
  await page.locator('#backup-file').setInputFiles(file);
  await page.getByRole('button', { name: 'Substituir pelo conteúdo da cópia' }).click();
  await expect(page.locator('#scratchpad')).toHaveValue('Minha ideia de estudo');
  await page.locator('#backup-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.locator('#toast')).toContainText('não é uma cópia');
});

test('community guidance is searchable and account forms toggle without network dependency', async ({ page }) => {
  await page.goto(p('comunidade'));
  await page.getByRole('button', { name: 'Projetos', exact: true }).click();
  await expect(page.locator('.faq-item')).toHaveCount(1);
  await page.locator('summary').click();
  await expect(page.locator('.faq-item p')).toBeVisible();
  await page.getByRole('link', { name: 'Entrar para participar' }).click();
  await page.getByRole('button', { name: 'Ainda não tem conta? Criar conta' }).click();
  await expect(page.locator('#auth-name')).toBeVisible();
  await expect(page.locator('#auth-password')).toHaveAttribute('minlength', '8');
  await page.getByRole('button', { name: 'Mostrar', exact: true }).click();
  await expect(page.locator('#auth-password')).toHaveAttribute('type', 'text');
  await page.getByRole('link', { name: 'Continuar sem cadastro' }).click();
  await expect(page).toHaveURL(/dashboard/);
});

test('small screens have no horizontal overflow and menu supports keyboard dismissal', async ({ page }) => {
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', p('cursos'), p('inspiracoes'), p('classroom') + '?aula=javascript', p('dashboard'), p('prompts'), p('comunidade'), p('login')]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.locator('#main-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#main-nav')).toBeHidden();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.locator('#main-nav').getByRole('link', { name: 'Trilhas' }).click();
  await expect(page).toHaveURL(/cursos/);
  await expect(page.locator('#main-nav')).toBeHidden();
});

test('reduced motion, broken deep links and blocked storage degrade usefully', async ({ page }) => {
  await page.goto(p('classroom') + '?aula=missing');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Você pensa');
  await expect(page.locator('html')).toHaveClass(/reduce-motion/);
  await page.goto('/');
  await expect(page.locator('.gsap-hero').first()).toBeVisible();
  await page.evaluate(() => localStorage.setItem('noetica:v2:guest', '{broken'));
  await page.goto(p('dashboard'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#toast')).toContainText('dados inválidos');
});

test('visual review captures desktop and mobile with actual animations enabled', async ({ page }) => {
  async function revealOnScroll() {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(170);
    }
    await page.waitForTimeout(750);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.gsap-scroll').last()).toHaveCSS('opacity', '1');
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await revealOnScroll();
  await page.screenshot({ path: '.local/screenshots/home-desktop.png', fullPage: true });
  await page.goto(p('inspiracoes'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: '.local/screenshots/inspirations-desktop.png', fullPage: true });
  await page.goto(p('classroom') + '?aula=html');
  await page.screenshot({ path: '.local/screenshots/classroom-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(1300);
  await revealOnScroll();
  await page.screenshot({ path: '.local/screenshots/home-mobile.png', fullPage: true });
});
