import { lessons, inspirations, prompts } from './content.js';

export const STORAGE_PREFIX = 'noetica:v2:';
const lessonIds = new Set(lessons.map(item => item.id));
const inspirationIds = new Set(inspirations.map(item => item.id));
const promptIds = new Set(prompts.map(item => item.id));
const text = (value, max = 20000) => typeof value === 'string' ? value.slice(0, max) : '';
const unique = (value, allowed) => [...new Set(Array.isArray(value) ? value.filter(id => allowed.has(id)) : [])];

export function safeUrl(value) {
  if (!value) return '';
  if (typeof value !== 'string' || value.length > 1000) return '';
  try {
    const url = new URL(String(value).trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function emptyState() {
  return { version: 2, name: '', completed: [], notes: {}, code: {}, answers: {}, lastLesson: 'mentalidade', scratchpad: '', projects: [], saved: [], copied: [] };
}

export function normalizeState(input) {
  const result = emptyState();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
  result.name = text(input.name, 60);
  result.completed = unique(input.completed, lessonIds);
  result.lastLesson = lessonIds.has(input.lastLesson) ? input.lastLesson : 'mentalidade';
  result.scratchpad = text(input.scratchpad);
  result.saved = unique(input.saved, inspirationIds);
  result.copied = unique(input.copied, promptIds);
  for (const lesson of lessons) {
    if (typeof input.notes?.[lesson.id] === 'string') result.notes[lesson.id] = text(input.notes[lesson.id]);
    if (typeof input.code?.[lesson.id] === 'string') result.code[lesson.id] = text(input.code[lesson.id], 30000);
    if (Number.isInteger(input.answers?.[lesson.id]) && input.answers[lesson.id] >= 0 && input.answers[lesson.id] < lesson.quiz.options.length) result.answers[lesson.id] = input.answers[lesson.id];
  }
  const ids = new Set();
  if (Array.isArray(input.projects)) {
    result.projects = input.projects.slice(0, 50).filter(p => {
      if (!p || typeof p.id !== 'string' || !/^[\w-]{1,80}$/.test(p.id) || ids.has(p.id) || !text(p.title, 80).trim()) return false;
      ids.add(p.id);
      return true;
    }).map(p => ({ id: p.id, title: text(p.title, 80), description: text(p.description, 2000), status: ['idea', 'building', 'done'].includes(p.status) ? p.status : 'idea', demoUrl: safeUrl(p.demoUrl), repoUrl: safeUrl(p.repoUrl), createdAt: Number.isFinite(p.createdAt) ? p.createdAt : 0 }));
  }
  return result;
}

export function statistics(state) {
  const completed = unique(state.completed, lessonIds);
  const finishedProjects = state.projects.filter(p => p.status === 'done').length;
  const xp = completed.length * 50 + finishedProjects * 150;
  return { completed: completed.length, percent: Math.round(completed.length / lessons.length * 100), xp, level: Math.floor(xp / 200) + 1, minutes: lessons.filter(l => completed.includes(l.id)).reduce((n, l) => n + l.minutes, 0), finishedProjects };
}

export function completeLesson(state, id) {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson || state.answers[id] !== lesson.quiz.answer) throw new Error('Responda à verificação da aula antes de concluir.');
  if (!state.completed.includes(id)) state.completed.push(id);
  return state;
}

export function resumeLesson(state) {
  const last = lessons.find(l => l.id === state.lastLesson) || lessons[0];
  if (!state.completed.includes(last.id)) return last;
  return lessons.slice(lessons.indexOf(last) + 1).find(l => !state.completed.includes(l.id))
    || lessons.find(l => !state.completed.includes(l.id)) || last;
}

export function createStore(storage, notify = () => {}) {
  let scope = 'guest';
  let memory = emptyState();
  let hasMemory = false;
  let storageProblem = false;
  function read() {
    try {
      const raw = storage.getItem(STORAGE_PREFIX + scope);
      if (raw !== null) { memory = normalizeState(JSON.parse(raw)); hasMemory = true; }
      else { memory = emptyState(); hasMemory = false; }
      storageProblem = false;
    } catch { storageProblem = true; }
    return structuredClone(hasMemory ? memory : emptyState());
  }
  function write(next, { remote = false } = {}) {
    const value = normalizeState(next);
    try { storage.setItem(STORAGE_PREFIX + scope, JSON.stringify(value)); }
    catch { storageProblem = true; throw new Error('Não foi possível salvar neste navegador. Libere espaço ou permita o armazenamento e tente novamente.'); }
    memory = value;
    hasMemory = true;
    storageProblem = false;
    notify({ state: read(), scope, remote });
    return read();
  }
  return {
    read, write,
    update(fn) { const next = read(); fn(next); return write(next); },
    useScope(next) { scope = next || 'guest'; memory = emptyState(); hasMemory = false; return read(); },
    get scope() { return scope; },
    get storageProblem() { return storageProblem; },
  };
}

const unavailable = { getItem() { throw new Error('storage unavailable'); }, setItem() { throw new Error('storage unavailable'); } };
let storage = unavailable;
try { storage = globalThis.localStorage || unavailable; } catch { /* Privacy mode can deny the getter. */ }
export const store = createStore(storage, detail => globalThis.dispatchEvent?.(new CustomEvent('noetica:change', { detail })));
