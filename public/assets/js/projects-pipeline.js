import { store, safeUrl } from './store.js';

export function validateProject(data) {
  const title = String(data.title || '').trim();
  const description = String(data.description || '').trim();
  if (title.length < 3 || title.length > 80) throw new Error('Use um título entre 3 e 80 caracteres.');
  if (description.length > 2000) throw new Error('Use até 2.000 caracteres na descrição.');
  const demoUrl = safeUrl(data.demoUrl);
  const repoUrl = safeUrl(data.repoUrl);
  if (data.demoUrl && !demoUrl || data.repoUrl && !repoUrl) throw new Error('Informe um endereço completo começando com https:// ou http://.');
  if (!['idea', 'building', 'done'].includes(data.status)) throw new Error('Escolha um estado válido para o projeto.');
  return { title, description, demoUrl, repoUrl, status: data.status };
}

export function saveProject(data, id) {
  const valid = validateProject(data);
  const projectId = id || crypto.randomUUID();
  store.update(state => {
    const current = state.projects.find(p => p.id === projectId);
    if (current) Object.assign(current, valid);
    else {
      if (state.projects.length >= 50) throw new Error('Você já tem 50 projetos. Exporte seu progresso e remova um para continuar.');
      state.projects.unshift({ ...valid, id: projectId, createdAt: Date.now() });
    }
  });
  return projectId;
}
