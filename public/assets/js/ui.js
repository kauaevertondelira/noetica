// The generated <base> element resolves these paths for local hosting, custom
// domains, and GitHub Pages project URLs such as /<repository>/.
export const paths = {
  home: 'index.html', courses: 'public/pages/cursos.html', classroom: 'public/pages/classroom.html',
  dashboard: 'public/pages/dashboard.html', prompts: 'public/pages/prompts.html', inspirations: 'public/pages/inspiracoes.html',
  community: 'public/pages/comunidade.html', login: 'public/pages/login.html',
};

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const lessonUrl = id => `${paths.classroom}?aula=${encodeURIComponent(id)}`;
export const $ = (selector, root = document) => root.querySelector(selector);

const symbols = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', external: '<path d="M7 17 17 7M7 7h10v10"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  book: '<path d="M12 6v15M3 3c4 0 6 1 9 3 3-2 5-3 9-3v15c-4 0-6 1-9 3-3-2-5-3-9-3V3Z"/>',
  rocket: '<path d="M9 15 4 20m4-9-4 1-2 5 6-1m5-8 1-4 5-2-1 6M8 16l-2-2C8 7 14 3 21 3c0 7-4 13-11 15l-2-2Z"/><circle cx="15" cy="9" r="2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name] || symbols.spark}</svg>`; }

let toastTimer;
export function toast(message, error = false) {
  const el = $('#toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.classList.toggle('is-error', error);
  el.hidden = false;
  toastTimer = setTimeout(() => { el.hidden = true; }, error ? 10000 : 4500);
}

export async function copyText(value, button) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(value);
    toast('Copiado. Agora adapte o contexto à sua ideia.');
    if (button) { button.dataset.copied = 'true'; button.setAttribute('aria-label', 'Copiado'); }
    return true;
  } catch {
    openDialog('Copie o texto', `<p>O navegador não permitiu a cópia automática. Selecione o texto abaixo e copie.</p><textarea class="copy-fallback" readonly aria-label="Texto para copiar">${escapeHTML(value)}</textarea>`);
    $('.copy-fallback')?.select();
    return false;
  }
}

let dialogReturnFocus;
export function openDialog(title, content) {
  const dialog = $('#app-dialog');
  dialogReturnFocus = document.activeElement;
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${escapeHTML(title)}</h2><button class="icon-button" aria-label="Fechar janela" data-close-dialog>${icon('close')}</button></div>${content}`;
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('[data-close-dialog]').addEventListener('click', closeDialog);
  return dialog;
}
export function closeDialog() { $('#app-dialog')?.close(); dialogReturnFocus?.focus?.(); }
export function bindDialog() {
  const dialog = $('#app-dialog');
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
  });
  dialog.addEventListener('close', () => dialogReturnFocus?.focus?.());
}

export function empty(message, action = '') { return `<div class="empty-state">${icon('spark')}<p>${escapeHTML(message)}</p>${action}</div>`; }
export function progressMarkup(percent, label) { return `<div class="progress-track" role="progressbar" aria-label="${escapeHTML(label)}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent}%"></span></div>`; }

export function debounceSave(input, callback, signal) {
  let timer;
  let dirty = false;
  const flush = () => {
    clearTimeout(timer);
    if (!dirty) return;
    try { callback(input.value); dirty = false; } catch (error) { toast(error.message, true); }
  };
  input.addEventListener('input', () => { dirty = true; clearTimeout(timer); timer = setTimeout(flush, 500); }, { signal });
  input.addEventListener('blur', flush, { signal });
  window.addEventListener('pagehide', flush, { signal });
  signal.addEventListener('abort', flush, { once: true });
  return flush;
}
