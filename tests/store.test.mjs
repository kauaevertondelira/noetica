import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, normalizeState, completeLesson, statistics, safeUrl, createStore, STORAGE_PREFIX, resumeLesson } from '../public/assets/js/store.js';
import { courses, lessons, inspirations } from '../public/assets/js/content.js';
import { validateProject } from '../public/assets/js/projects-pipeline.js';
import { buildPreview } from '../public/assets/js/classroom.js';

test('every course leads to existing, unique lessons and valid exercises', () => {
  const ids = courses.flatMap(c => c.lessons);
  assert.equal(new Set(ids).size, lessons.length);
  assert.deepEqual(new Set(ids), new Set(lessons.map(l => l.id)));
  for (const lesson of lessons) {
    assert.ok(lesson.sections.length >= 3);
    assert.ok(lesson.quiz.options[lesson.quiz.answer]);
    assert.equal(new URL(lesson.resource[1]).protocol, 'https:');
  }
  for (const idea of inspirations) assert.ok(ids.includes(idea.lesson));
});

test('completion requires understanding and cannot award XP twice', () => {
  const s = emptyState();
  assert.throws(() => completeLesson(s, 'mentalidade'));
  s.answers.mentalidade = lessons[0].quiz.answer;
  completeLesson(s, 'mentalidade'); completeLesson(s, 'mentalidade');
  assert.deepEqual(s.completed, ['mentalidade']);
  assert.equal(statistics(s).xp, 50);
  assert.equal(statistics(s).percent, 8);
});

test('XP derives from current project and lesson state, without farmable increments', () => {
  const s = emptyState();
  s.projects = [{ id: 'one', status: 'done' }];
  assert.equal(statistics(s).xp, 150);
  s.projects[0].status = 'building'; assert.equal(statistics(s).xp, 0);
  s.projects[0].status = 'done'; assert.equal(statistics(s).xp, 150);
});

test('resume advances past completed lessons and keeps an unfinished lesson', () => {
  const s = emptyState();
  assert.equal(resumeLesson(s).id, 'mentalidade');
  s.completed = ['mentalidade']; assert.equal(resumeLesson(s).id, 'html');
  s.lastLesson = 'dados'; assert.equal(resumeLesson(s).id, 'dados');
  s.completed = lessons.map(l => l.id); assert.equal(resumeLesson(s).id, 'dados');
});

test('removing browser storage removes stale in-memory study state', () => {
  const storage = memoryStorage(); const s = createStore(storage);
  s.update(value => { value.scratchpad = 'private'; });
  storage.data.delete(STORAGE_PREFIX + 'guest');
  assert.equal(s.read().scratchpad, '');
});

test('untrusted imports are bounded, deduplicated and reject dangerous links', () => {
  const s = normalizeState({ completed: ['mentalidade', 'mentalidade', 'missing'], notes: { mentalidade: 'a'.repeat(21000), injected: 'ignored' }, answers: { html: 999, css: 0 }, projects: [{ id: 'ok', title: 'Safe', status: 'admin', demoUrl: 'javascript:alert(1)' }, { id: 'ok', title: 'duplicate' }, { id: '<img>', title: 'invalid' }], saved: ['orbit', 'unknown'] });
  assert.deepEqual(s.completed, ['mentalidade']); assert.equal(s.notes.mentalidade.length, 20000);
  assert.equal(s.notes.injected, undefined); assert.equal(s.answers.html, undefined);
  assert.equal(s.projects.length, 1); assert.equal(s.projects[0].demoUrl, ''); assert.equal(s.projects[0].status, 'idea');
  assert.deepEqual(s.saved, ['orbit']);
});

test('project validation rejects whitespace, oversized input and unsafe URLs', () => {
  assert.throws(() => validateProject({ title: '   ', status: 'idea' }));
  assert.throws(() => validateProject({ title: 'Project', status: 'idea', demoUrl: 'javascript:alert(1)' }));
  assert.throws(() => validateProject({ title: 'Project', status: 'invalid' }));
  assert.equal(validateProject({ title: ' Project ', status: 'done', demoUrl: 'https://example.com' }).demoUrl, 'https://example.com/');
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.test', 'file:///etc/passwd', 'https://user:password@example.com']) assert.equal(safeUrl(url), '');
});

function memoryStorage() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), data }; }

test('guest and accounts never share private study state', () => {
  const storage = memoryStorage(); const store = createStore(storage);
  store.update(s => { s.scratchpad = 'guest notes'; });
  store.useScope('alice'); assert.equal(store.read().scratchpad, '');
  store.update(s => { s.scratchpad = 'alice private'; });
  store.useScope('bob'); assert.equal(store.read().scratchpad, '');
  store.useScope('guest'); assert.equal(store.read().scratchpad, 'guest notes');
  store.useScope('alice'); assert.equal(store.read().scratchpad, 'alice private');
});

test('failed saves are not reported as successful', () => {
  let notified = false;
  const store = createStore({ getItem: () => null, setItem() { throw new Error('QuotaExceededError'); } }, () => { notified = true; });
  assert.throws(() => store.update(s => { s.scratchpad = 'unsaved'; }), /Não foi possível salvar/);
  assert.equal(notified, false); assert.equal(store.storageProblem, true);
});

test('malformed storage recovers without crashing and preserves its original payload', () => {
  const storage = memoryStorage(); storage.setItem(STORAGE_PREFIX + 'guest', '{broken');
  const store = createStore(storage);
  assert.deepEqual(store.read(), emptyState()); assert.equal(store.storageProblem, true);
  assert.equal(storage.getItem(STORAGE_PREFIX + 'guest'), '{broken');
});

test('updates read latest state to preserve another tab’s changes', () => {
  const storage = memoryStorage(); const a = createStore(storage), b = createStore(storage);
  a.update(s => { s.notes.html = 'first tab'; });
  b.update(s => { s.scratchpad = 'second tab'; });
  assert.equal(a.read().scratchpad, 'second tab'); assert.equal(b.read().notes.html, 'first tab');
});

test('lab preview blocks network, forms and base rewriting', () => {
  const html = buildPreview('<h1>Test</h1>');
  assert.match(html, /default-src 'none'/); assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/); assert.match(html, /base-uri 'none'/);
  assert.match(html, /<h1>Test<\/h1>/);
});
