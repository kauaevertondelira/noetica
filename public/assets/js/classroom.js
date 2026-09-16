import { courses, lessons, lessonById, courseForLesson } from './content.js';
import { store, statistics, completeLesson, resumeLesson } from './store.js';
import { $, paths, lessonUrl, escapeHTML as e, icon, toast, copyText, progressMarkup, debounceSave } from './ui.js';

export function buildPreview(code) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none';"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#101014;color:#f3f1e7;font:15px/1.6 system-ui;padding:24px;overflow-wrap:break-word}button,input{font:inherit;padding:9px 15px}a{color:#f6b205}h1{line-height:1.2}button{cursor:pointer}pre{white-space:pre-wrap}</style></head><body>${code}</body></html>`;
}

export function initClassroom(root, signal) {
  const query = new URLSearchParams(location.search);
  const requested = query.get('aula');
  let state = store.read();
  const lesson = requested ? lessonById(requested) || lessons[0] : resumeLesson(state);
  const course = courseForLesson(lesson.id);
  const index = lessons.indexOf(lesson);
  const stats = statistics(state);
  const container = $('#classroom-content', root);
  document.title = `${lesson.title} | Noética`;
  if (requested && !lessonById(requested)) toast('Essa aula não existe. Abrimos o início da trilha para você.');
  try { store.update(s => { s.lastLesson = lesson.id; }); } catch (error) { toast(error.message, true); }
  const done = state.completed.includes(lesson.id);
  container.innerHTML = `<div class="classroom-topbar"><a class="text-link" href="${paths.courses}">← Todas as trilhas</a><span>${e(course.short)} · Aula ${course.lessons.indexOf(lesson.id) + 1} de 4</span></div><div class="classroom-layout"><aside class="lesson-sidebar" aria-label="Aulas da formação"><div class="sidebar-title"><h2>Sua jornada</h2>${progressMarkup(stats.percent, 'Progresso da formação')}<p data-lesson-progress>${stats.completed} de 12 aulas concluídas · ${stats.percent}%</p><button class="text-button" data-toggle-lessons aria-expanded="false">Mostrar todas as aulas ↓</button></div>${courses.map(c => `<details class="module-group" ${c.id === course.id ? 'open' : ''}><summary>${c.number}. ${c.short}</summary><nav class="module-lessons" aria-label="${e(c.short)}">${c.lessons.map(id => `<a class="lesson-item ${state.completed.includes(id) ? 'completed' : ''}" href="${lessonUrl(id)}" ${id === lesson.id ? 'aria-current="page"' : ''}>${icon(state.completed.includes(id) ? 'check' : 'book')}<span>${e(lessonById(id).title)}</span></a>`).join('')}</nav></details>`).join('')}</aside><article class="lesson-content">${stats.completed === lessons.length ? '<div class="completion-banner"><h2>Você completou a formação inicial.</h2><p>Revisite o que precisar e leve o aprendizado para um projeto seu.</p></div>' : ''}<header class="lesson-header"><div class="eyebrow">${e(course.short).toUpperCase()} <span> / </span> ${lesson.minutes} MIN DE ESTUDO</div><h1>${e(lesson.title)}</h1><p>${e(lesson.intro)}</p></header><div class="lesson-tabs" role="tablist" aria-label="Conteúdo da aula"><button id="tab-read" class="tab-button" role="tab" aria-selected="true" aria-controls="panel-read" data-tab="read">Aula & desafio</button><button id="tab-lab" class="tab-button" role="tab" aria-selected="false" aria-controls="panel-lab" tabindex="-1" data-tab="lab">Laboratório</button><button id="tab-notes" class="tab-button" role="tab" aria-selected="false" aria-controls="panel-notes" tabindex="-1" data-tab="notes">Minhas notas</button></div><section id="panel-read" role="tabpanel" aria-labelledby="tab-read"><div class="article-body">${lesson.sections.map(([title, body]) => `<section><h2>${e(title)}</h2><p>${e(body)}</p></section>`).join('')}</div><div class="code-example"><header><span>EXEMPLO PARA ENTENDER</span><button class="text-button" data-copy-example>${icon('copy')} Copiar</button></header><pre><code>${e(lesson.code)}</code></pre></div><div class="challenge"><h2>Agora é com você.</h2><p>${e(lesson.challenge)}</p></div><div class="panel"><p class="eyebrow">LEVE PARA A SUA IA</p><p class="lead">${e(lesson.prompt)}</p><button class="button button-ghost button-small" data-copy-lesson-prompt>${icon('copy')} Copiar prompt de estudo</button></div><form class="panel quiz" id="lesson-quiz"><h2>Uma pausa para entender.</h2><fieldset style="border:0;padding:0;margin:0"><legend class="quiz-question">${e(lesson.quiz.question)}</legend><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<label class="quiz-option"><input type="radio" name="answer" value="${i}" required ${state.answers[lesson.id] === i ? 'checked' : ''}>${e(option)}</label>`).join('')}</div></fieldset><button class="button button-ghost button-small" type="submit">Verificar resposta</button><p class="quiz-feedback" role="status">${state.answers[lesson.id] === lesson.quiz.answer ? 'Resposta correta. Você já pode concluir esta aula.' : ''}</p></form><a class="lesson-resource" href="${e(lesson.resource[1])}" target="_blank" rel="noopener noreferrer">${icon('book')} Aprofundar: ${e(lesson.resource[0])} ${icon('external')}</a></section><section id="panel-lab" role="tabpanel" aria-labelledby="tab-lab" hidden><h2 style="font-size:24px">Experimente uma mudança.</h2><p class="helper">HTML, CSS e JavaScript, sem pacotes ou acesso à rede. Execute seu código para ver o resultado.</p><label for="lab-code" style="margin-top:20px">Seu código</label><textarea id="lab-code" class="lab-editor" spellcheck="false" maxlength="30000">${e(state.code[lesson.id] ?? (['html', 'css', 'javascript', 'acessibilidade'].includes(lesson.id) ? lesson.code : lessonById('javascript').code))}</textarea><div class="lab-toolbar"><button class="button button-small" id="run-code">Executar código ${icon('arrow')}</button><button class="text-button" id="reset-code">Restaurar exemplo</button><span class="helper" id="lab-status" role="status"></span></div><iframe class="lab-preview" id="lab-preview" title="Resultado do seu código, em ambiente isolado" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe><p class="helper">O resultado é isolado. Armazenamento, serviços externos e comandos de terminal devem ser testados no seu projeto.</p></section><section id="panel-notes" role="tabpanel" aria-labelledby="tab-notes" hidden><h2 style="font-size:24px;margin-bottom:18px">O que ficou dessa aula?</h2><label for="lesson-notes">Suas anotações</label><textarea id="lesson-notes" class="notes-text" maxlength="20000" placeholder="Uma descoberta, uma dúvida ou o próximo experimento…">${e(state.notes[lesson.id] || '')}</textarea><p class="notes-status" id="notes-status" role="status">Suas notas ficam neste espaço de estudo.</p></section><div class="lesson-bottom"><button class="button ${done ? 'lesson-complete' : ''}" id="complete-lesson" ${done || state.answers[lesson.id] !== lesson.quiz.answer ? 'disabled' : ''}>${done ? `${icon('check')} Aula concluída` : 'Concluir aula · +50 XP'}</button><a class="button button-ghost" href="${index < lessons.length - 1 ? lessonUrl(lessons[index + 1].id) : paths.dashboard}">${index < lessons.length - 1 ? 'Próxima aula' : 'Ir para meu espaço'} ${icon('arrow')}</a></div></article></div>`;
  const on = (selector, type, fn) => $(selector, root).addEventListener(type, fn, { signal });
  on('[data-toggle-lessons]', 'click', event => {
    const open = $('.lesson-sidebar', root).classList.toggle('show-lessons');
    event.target.setAttribute('aria-expanded', String(open));
    event.target.textContent = open ? 'Recolher aulas ↑' : 'Mostrar todas as aulas ↓';
  });
  const tabs = [...root.querySelectorAll('[data-tab]')];
  function activateTab(button) {
    tabs.forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      $(`#panel-${tab.dataset.tab}`, root).hidden = !active;
    });
  }
  tabs.forEach((button, i) => {
    button.addEventListener('click', () => activateTab(button), { signal });
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); activateTab(tabs[next]); tabs[next].focus();
    }, { signal });
  });
  on('[data-copy-example]', 'click', event => copyText(lesson.code, event.currentTarget));
  on('[data-copy-lesson-prompt]', 'click', event => copyText(lesson.prompt, event.currentTarget));
  on('#lesson-quiz', 'submit', event => {
    event.preventDefault();
    const answer = Number(new FormData(event.currentTarget).get('answer'));
    try {
      store.update(s => { s.answers[lesson.id] = answer; });
      const correct = answer === lesson.quiz.answer;
      const feedback = $('.quiz-feedback', root);
      feedback.classList.toggle('success', correct);
      feedback.textContent = (correct ? 'Isso mesmo. ' : 'Tente novamente. ') + lesson.quiz.explanation;
      $('#complete-lesson', root).disabled = !correct || store.read().completed.includes(lesson.id);
    } catch (error) { toast(error.message, true); }
  });
  on('#complete-lesson', 'click', () => {
    try {
      state = store.update(s => completeLesson(s, lesson.id));
      const button = $('#complete-lesson', root);
      button.disabled = true; button.classList.add('lesson-complete'); button.innerHTML = `${icon('check')} Aula concluída`;
      const current = $('.lesson-item[aria-current=page]', root);
      current.classList.add('completed'); $('.icon', current).outerHTML = icon('check');
      const updated = statistics(state);
      $('[data-lesson-progress]', root).textContent = `${updated.completed} de 12 aulas concluídas · ${updated.percent}%`;
      const progress = $('.sidebar-title [role=progressbar]', root);
      progress.setAttribute('aria-valuenow', String(updated.percent)); $('span', progress).style.width = `${updated.percent}%`;
      toast(updated.completed === lessons.length ? 'Formação inicial concluída. Seu próximo passo é criar!' : 'Aula concluída. +50 XP pelo seu próximo passo.');
    } catch (error) { toast(error.message, true); }
  });
  debounceSave($('#lesson-notes', root), value => {
    store.update(s => { s.notes[lesson.id] = value; });
    $('#notes-status', root).textContent = 'Anotações salvas neste navegador.';
  }, signal);
  debounceSave($('#lab-code', root), value => { store.update(s => { s.code[lesson.id] = value; }); }, signal);
  on('#run-code', 'click', () => {
    $('#lab-preview', root).srcdoc = buildPreview($('#lab-code', root).value);
    $('#lab-status', root).textContent = 'Código enviado à prévia. Confira o resultado abaixo.';
  });
  on('#reset-code', 'click', () => {
    const example = ['html', 'css', 'javascript', 'acessibilidade'].includes(lesson.id) ? lesson.code : lessonById('javascript').code;
    // Preserve the edited draft until the explicit reset action is invoked.
    try { store.update(s => { s.code[lesson.id] = example; }); $('#lab-code', root).value = example; $('#lab-preview', root).srcdoc = ''; toast('Exemplo restaurado.'); } catch (error) { toast(error.message, true); }
  });
}
