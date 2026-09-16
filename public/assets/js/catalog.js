import { courses, lessons, prompts, inspirations, courseMinutes, lessonById } from './content.js';
import { store } from './store.js';
import { $, paths, lessonUrl, icon, escapeHTML as e, empty, openDialog, closeDialog, toast, copyText, progressMarkup } from './ui.js';
import { saveProject } from './projects-pipeline.js';

const filterButtons = values => `<div class="filters" role="group" aria-label="Filtrar por categoria">${values.map((v, i) => `<button class="filter-button" data-filter="${e(v)}" aria-pressed="${i === 0}">${e(v)}</button>`).join('')}</div>`;
const searchInput = label => `<div class="search-field">${icon('search')}<label class="sr-only" for="catalog-search">${label}</label><input id="catalog-search" type="search" placeholder="${label}" maxlength="100"></div>`;
const searchMatch = (value, query) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());

export function initCourses(root) {
  const state = store.read();
  $('#courses-content', root).innerHTML = `<div class="course-grid">${courses.map(course => {
    const done = course.lessons.filter(id => state.completed.includes(id)).length;
    const next = course.lessons.find(id => !state.completed.includes(id)) || course.lessons[0];
    return `<article class="panel course-card gsap-scroll"><span class="course-number" aria-hidden="true">${course.number}</span><div><span class="tag tag-gold">${course.category}</span></div>${icon(course.icon)}<h2>${course.title}</h2><p>${course.description}</p><div class="course-meta"><span>${icon('book')} 4 aulas</span><span>${icon('clock')} ~${courseMinutes(course)} min</span></div><details><summary>O que você vai aprender</summary><ol>${course.lessons.map(id => `<li><a href="${lessonUrl(id)}">${e(lessonById(id).title)}</a></li>`).join('')}</ol></details>${done ? `<div class="progress-caption"><span>${done}/4 aulas concluídas</span><span>${done * 25}%</span></div>${progressMarkup(done * 25, course.short)}<br>` : ''}<a class="button ${course.number === '01' ? '' : 'button-ghost'}" href="${lessonUrl(next)}">${done === 4 ? 'Revisitar a trilha' : done ? 'Continuar a trilha' : 'Começar a trilha'} ${icon('arrow')}</a><p class="course-output">Você cria: ${course.output.toLowerCase()}.</p></article>`;
  }).join('')}</div><div class="notice"><strong>Aprender fazendo, desde o primeiro acesso.</strong> ${lessons.length} aulas escritas, exemplos e exercícios. Você não precisa de cadastro nem de uma assinatura de IA para estudar aqui. As durações são estimativas de leitura e prática.</div>`;
}

function connectFilters(root, source, render, extra = () => true) {
  let category = 'Todos';
  let query = '';
  const update = () => {
    const result = source.filter(item => (category === 'Todos' || category === 'Salvos' || item.category === category) && extra(item, category) && searchMatch(`${item.title} ${item.description} ${item.category}`, query));
    render(result);
    $('.result-count', root).textContent = `${result.length} ${result.length === 1 ? 'resultado' : 'resultados'}`;
  };
  root.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    update();
  }));
  $('#catalog-search', root).addEventListener('input', event => { query = event.target.value.trim(); update(); });
  update();
  return update;
}

export function initPrompts(root) {
  const container = $('#prompts-content', root);
  container.innerHTML = `<div class="toolbar">${filterButtons(['Todos', 'Planejamento', 'Construção', 'Revisão', 'Aprendizado'])}${searchInput('Buscar um prompt')}</div><p class="result-count" role="status"></p><div class="prompt-grid"></div><div class="notice">Substitua os trechos entre colchetes pelo contexto do seu projeto. Revise o código gerado e remova credenciais ou dados pessoais antes de compartilhar.</div>`;
  connectFilters(container, prompts, items => {
    $('.prompt-grid', container).innerHTML = items.length ? items.map(p => `<article class="panel prompt-card"><div><span class="tag tag-gold">${p.category}</span></div><h2>${p.title}</h2><p>${p.description}</p><div class="prompt-text">${e(p.text)}</div><button class="button button-ghost button-small" data-copy-prompt="${p.id}">${icon('copy')} Copiar prompt</button></article>`).join('') : empty('Nenhum prompt encontrado. Experimente outra palavra ou categoria.');
  });
  container.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-prompt]');
    if (!button) return;
    const prompt = prompts.find(p => p.id === button.dataset.copyPrompt);
    if (await copyText(prompt.text, button)) {
      try { store.update(s => { if (!s.copied.includes(prompt.id)) s.copied.push(prompt.id); }); } catch (error) { toast(error.message, true); }
    }
  });
}

const miniArt = {
  orbit: '<div class="mini-tasks"><span>✓ Ler uma aula</span><span>○ Experimentar uma ideia</span><span>○ Compartilhar o processo</span></div>',
  folio: '<div class="mini-poster">✳</div>', focus: '<div class="mini-clock">25:00<span class="sr-only"> minutos</span></div>',
  notes: '<div class="mini-notes">E se…<br><br>uma ideia pequena<br>virasse algo real?<br><br>↗ criar um começo</div>',
  link: '<div class="mini-links"><span>↗</span><span>⌘</span><span>✳</span></div>', landing: '<div class="mini-root">✳</div>',
};

export function initInspirations(root) {
  const container = $('#inspirations-content', root);
  container.innerHTML = `<div class="toolbar">${filterButtons(['Todos', 'Produtividade', 'Portfólio', 'Ferramentas', 'Salvos'])}${searchInput('Buscar uma ideia')}</div><p class="result-count" role="status"></p><div class="inspiration-grid"></div><div class="notice">Conceitos autorais para praticar. As prévias são direções visuais; cada briefing propõe uma aplicação para você construir.</div>`;
  const update = connectFilters(container, inspirations, items => {
    const saved = store.read().saved;
    $('.inspiration-grid', container).innerHTML = items.length ? items.map(p => `<article class="inspiration-card"><button class="preview-button" data-brief="${p.id}" aria-label="Explorar briefing de ${p.title}"><span class="preview-art preview-${p.style}" aria-hidden="true"><small>${p.category.toUpperCase()} / CONCEITO ${String(inspirations.indexOf(p) + 1).padStart(2, '0')}</small><strong>${p.title}${'.'}</strong><span>${p.subtitle}</span>${miniArt[p.style]}</span></button><div class="inspiration-meta"><div><h3>${p.title}</h3><p>${p.category} · ${p.level}</p></div><button class="icon-button save-button" data-save="${p.id}" aria-label="Salvar ${p.title}" aria-pressed="${saved.includes(p.id)}">${icon('bookmark')}</button></div><button class="brief-link" data-brief="${p.id}">Explorar o briefing ${icon('external')}</button></article>`).join('') : empty('Nenhuma ideia por aqui ainda. Salve uma inspiração ou ajuste os filtros.');
  }, (p, category) => category !== 'Salvos' || store.read().saved.includes(p.id));
  container.addEventListener('click', event => {
    const save = event.target.closest('[data-save]');
    const brief = event.target.closest('[data-brief]');
    if (save) {
      try { store.update(s => { s.saved = s.saved.includes(save.dataset.save) ? s.saved.filter(id => id !== save.dataset.save) : [...s.saved, save.dataset.save]; }); update(); } catch (error) { toast(error.message, true); }
    }
    if (brief) {
      const p = inspirations.find(item => item.id === brief.dataset.brief);
      const dialog = openDialog(`${p.title}: seu próximo projeto`, `<span class="tag tag-gold">${p.level}</span><p class="lead">${p.description}</p><h3>A primeira versão precisa…</h3><ul>${p.requirements.map(r => `<li>${r}</li>`).join('')}</ul><h3>Você vai praticar</h3><p>${p.learning}.</p><div class="button-row"><button class="button" id="create-from-idea">Criar no meu workspace ${icon('plus')}</button><a class="text-link" href="${lessonUrl(p.lesson)}">Estudar a base ${icon('arrow')}</a></div>`);
      $('#create-from-idea', dialog).addEventListener('click', () => {
        try {
          saveProject({ title: p.title, description: `${p.description}\n\nCritérios da primeira versão:\n${p.requirements.map(r => `- ${r}`).join('\n')}\n\nO que aprendi e como testei:\n`, status: 'idea', demoUrl: '', repoUrl: '' });
          closeDialog();
          toast('Projeto criado no seu espaço. É hora de dar o primeiro passo.');
          window.dispatchEvent(new CustomEvent('noetica:navigate', { detail: paths.dashboard }));
        } catch (error) { toast(error.message, true); }
      });
    }
  });
}
