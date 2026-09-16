import { store, statistics, normalizeState, resumeLesson } from './store.js';
import { $, icon, escapeHTML as e, paths, lessonUrl, empty, openDialog, closeDialog, toast, progressMarkup, debounceSave } from './ui.js';
import { saveProject } from './projects-pipeline.js';
import { getUser, syncMessage, syncNow } from './auth.js';

const statusLabels = { idea: 'Ideia', building: 'Em construção', done: 'Concluído' };

export function projectDialog(project, afterSave) {
  const isEdit = Boolean(project?.id);
  const p = project || { title: '', description: '', status: 'idea', demoUrl: '', repoUrl: '' };
  const dialog = openDialog(isEdit ? 'Seu projeto, seu processo.' : 'Uma nova ideia.', `<form class="form-stack" id="project-form"><div><label for="project-title">Nome do projeto</label><input id="project-title" name="title" value="${e(p.title)}" minlength="3" maxlength="80" required placeholder="O nome do seu próximo começo"></div><div><label for="project-description">O que você quer criar e como vai testar?</label><textarea id="project-description" name="description" rows="6" maxlength="2000" placeholder="Problema, critérios e aprendizados…">${e(p.description)}</textarea></div><div><label for="project-status">Em que etapa está?</label><select id="project-status" name="status">${Object.entries(statusLabels).map(([key, value]) => `<option value="${key}" ${p.status === key ? 'selected' : ''}>${value}</option>`).join('')}</select></div><div><label for="project-demo">Link da demonstração <span class="muted">(opcional)</span></label><input id="project-demo" type="url" name="demoUrl" value="${e(p.demoUrl)}" maxlength="1000" placeholder="https://seu-projeto.com"></div><div><label for="project-repo">Link do repositório <span class="muted">(opcional)</span></label><input id="project-repo" type="url" name="repoUrl" value="${e(p.repoUrl)}" maxlength="1000" placeholder="https://github.com/voce/projeto"></div><p class="helper">Seu projeto fica no seu espaço de estudo. Cada projeto concluído conta 150 XP no progresso atual.</p><p class="form-feedback" role="alert"></p><div class="button-row"><button class="button" type="submit">Salvar projeto ${icon('check')}</button>${isEdit ? '<button class="text-button" type="button" id="delete-project">Excluir projeto</button>' : ''}${p.demoUrl ? `<a class="text-link" href="${e(p.demoUrl)}" target="_blank" rel="noopener noreferrer">Abrir demo ${icon('external')}</a>` : ''}</div></form>`);
  $('#project-form', dialog).addEventListener('submit', event => {
    event.preventDefault();
    try { saveProject(Object.fromEntries(new FormData(event.currentTarget)), p.id); closeDialog(); afterSave(); toast('Projeto salvo. Continue criando.'); }
    catch (error) { $('.form-feedback', dialog).textContent = error.message; }
  });
  $('#delete-project', dialog)?.addEventListener('click', event => {
    if (event.currentTarget.dataset.confirm !== 'true') {
      event.currentTarget.dataset.confirm = 'true';
      event.currentTarget.textContent = 'Confirmar exclusão deste projeto';
      return;
    }
    try { store.update(s => { s.projects = s.projects.filter(item => item.id !== p.id); }); closeDialog(); afterSave(); toast('Projeto removido.'); }
    catch (error) { $('.form-feedback', dialog).textContent = error.message; }
  });
}

export function initDashboard(root, signal) {
  const state = store.read();
  const user = getUser();
  const stats = statistics(state);
  const next = resumeLesson(state);
  $('#dashboard-content', root).innerHTML = `<header class="dashboard-top"><div><p class="eyebrow">SEU ESPAÇO PARA EVOLUIR</p><h1>Vamos criar${state.name || user?.displayName ? `, <span>${e((state.name || user.displayName).split(' ')[0])}</span>` : ' algo novo'}?</h1><p>Uma descoberta, uma ideia e um próximo passo. Tudo no seu ritmo.</p></div><span class="level-pill">${icon('spark')} Nível ${stats.level} · ${stats.xp} XP</span></header><div class="notice"><span data-sync-status>${e(syncMessage())}</span>${user ? ' <button class="text-button" id="retry-sync">Sincronizar agora</button>' : ` <a href="${paths.login}">Entrar em uma conta</a>`}</div><div class="stats-grid"><div class="stat-box"><strong data-stat-lessons>${stats.completed}<small class="small muted"> / 12</small></strong><span>Aulas concluídas</span></div><div class="stat-box"><strong data-stat-projects>${state.projects.length}</strong><span>Projetos no seu espaço</span></div><div class="stat-box"><strong>${state.copied.length}</strong><span>Prompts experimentados</span></div><div class="stat-box"><strong>${state.saved.length}</strong><span>Ideias salvas</span></div></div><div class="workspace-grid"><div class="workspace-left"><section class="panel continue-card"><p class="eyebrow">${stats.completed === 12 ? 'VOCÊ COMPLETOU A FORMAÇÃO INICIAL' : 'CONTINUE DE ONDE PAROU'}</p><h2>${e(next.title)}</h2><div class="progress-caption"><span>Progresso da formação</span><span>${stats.percent}%</span></div>${progressMarkup(stats.percent, 'Progresso da formação')}<a class="button" href="${lessonUrl(next.id)}">${stats.completed === 12 ? 'Revisitar as aulas' : 'Continuar aprendendo'} ${icon('arrow')}</a></section><section class="panel"><div class="panel-title"><h2>Seu caderno de ideias</h2>${icon('book')}</div><p style="margin-top:10px">Um lugar para rascunhar, conectar referências e pensar no próximo projeto.</p><label class="sr-only" for="scratchpad">Seu caderno de ideias</label><textarea class="scratchpad" id="scratchpad" maxlength="20000" placeholder="E se eu criasse…">${e(state.scratchpad)}</textarea><div class="panel-title"><span class="helper" id="draft-status" role="status">Salvamento automático neste navegador.</span><button class="text-button" id="save-draft">Salvar agora</button></div></section></div><div class="workspace-right"><section class="panel"><div class="panel-title"><h2>Meus projetos</h2><button class="icon-button" id="new-project" aria-label="Criar novo projeto">${icon('plus')}</button></div><div class="project-list" id="project-list"></div></section><section class="panel"><h2>Uma dose de inspiração</h2><a class="resource-link" href="${paths.inspirations}">${icon('spark')} Ideias para colocar em prática ${icon('external')}</a><a class="resource-link" href="${paths.prompts}">${icon('code')} Um prompt para destravar ${icon('external')}</a><a class="resource-link" href="${paths.community}">${icon('people')} Espaço para as suas dúvidas ${icon('external')}</a></section><section class="panel"><h2>Seu progresso vai com você.</h2><p>Exporte uma cópia para guardar ou importar neste navegador. A importação substitui o progresso do espaço atual.</p><div class="backup-actions"><button class="text-button" id="export-progress">${icon('download')} Exportar progresso</button><button class="text-button" id="import-progress">Importar cópia</button><input type="file" id="backup-file" accept="application/json,.json" hidden></div></section></div></div>`;
  function renderProjects() {
    const updated = store.read();
    $('#project-list', root).innerHTML = updated.projects.length ? updated.projects.map(p => `<button class="project-item" data-project="${e(p.id)}"><span><strong>${e(p.title)}</strong><small>${statusLabels[p.status]}</small></span>${icon(p.status === 'done' ? 'check' : 'external')}</button>`).join('') : empty('Sua próxima ideia pode começar aqui.', '<button class="button button-ghost button-small" data-first-project>Criar meu primeiro projeto</button>');
    $('[data-stat-projects]', root).textContent = updated.projects.length;
    const s = statistics(updated);
    $('.level-pill', root).innerHTML = `${icon('spark')} Nível ${s.level} · ${s.xp} XP`;
  }
  renderProjects();
  const saveDraft = value => { store.update(s => { s.scratchpad = value; }); $('#draft-status', root).textContent = 'Rascunho salvo neste navegador.'; };
  debounceSave($('#scratchpad', root), saveDraft, signal);
  $('#save-draft', root).addEventListener('click', () => { try { saveDraft($('#scratchpad', root).value); } catch (error) { toast(error.message, true); } }, { signal });
  root.addEventListener('click', event => {
    if (event.target.closest('#new-project, [data-first-project]')) projectDialog(null, renderProjects);
    const button = event.target.closest('[data-project]');
    if (button) projectDialog(store.read().projects.find(p => p.id === button.dataset.project), renderProjects);
  }, { signal });
  $('#export-progress', root).addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'noetica', exportedAt: new Date().toISOString(), study: store.read() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `noetica-progresso-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Cópia do seu progresso preparada.');
  }, { signal });
  $('#import-progress', root).addEventListener('click', () => $('#backup-file', root).click(), { signal });
  $('#backup-file', root).addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 1500000) throw new Error('A cópia deve ter até 1,5 MB.');
      const data = JSON.parse(await file.text());
      if (signal.aborted) return;
      if (data.app !== 'noetica' || data.study?.version !== 2 || !Array.isArray(data.study.completed) || !Array.isArray(data.study.projects)) throw new Error('Esse arquivo não é uma cópia de progresso da Noética.');
      const imported = normalizeState(data.study);
      const dialog = openDialog('Importar seu progresso?', `<p>Esta cópia contém ${imported.completed.length} aulas concluídas e ${imported.projects.length} projetos. Ela substituirá as notas e o progresso do espaço atual. Exporte uma cópia atual antes se quiser preservá-la.</p><div class="button-row"><button class="button" id="confirm-import">Substituir pelo conteúdo da cópia</button></div>`);
      $('#confirm-import', dialog).addEventListener('click', () => {
        try { store.write(imported); closeDialog(); window.dispatchEvent(new Event('noetica:refresh')); toast('Progresso importado.'); }
        catch (error) { toast(error.message, true); }
      });
    } catch (error) { toast(error instanceof SyntaxError ? 'O arquivo não contém JSON válido.' : error.message, true); }
    event.target.value = '';
  }, { signal });
  $('#retry-sync', root)?.addEventListener('click', () => syncNow(), { signal });
}
