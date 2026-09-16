import { faqs } from './content.js';
import { getUser } from './auth.js';
import { getServices } from './firebase-config.js';
import { isOwner } from './access-control.js';
import { $, paths, icon, escapeHTML as e, openDialog, closeDialog, empty, toast } from './ui.js';

const categories = ['Primeiros passos', 'Código e bugs', 'Ferramentas', 'Projetos'];
const timeout = async promise => {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 12000); })]); }
  finally { clearTimeout(timer); }
};
const displayDate = timestamp => timestamp?.toDate ? timestamp.toDate().toLocaleDateString('pt-BR') : 'Agora';
const shortError = error => error.code === 'permission-denied' ? 'O serviço de comunidade ainda não autorizou esta operação. Tente novamente após a configuração das permissões.' : 'Não foi possível acessar a comunidade. Verifique sua conexão e tente novamente.';

export function initCommunity(root, signal) {
  const user = getUser();
  const container = $('#community-content', root);
  container.innerHTML = `<div class="toolbar"><div class="filters" role="group" aria-label="Filtrar dúvidas">${['Todos', ...categories].map((c, i) => `<button class="filter-button" data-topic="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div><div class="search-field">${icon('search')}<label class="sr-only" for="faq-search">Buscar uma dúvida</label><input id="faq-search" type="search" placeholder="Buscar uma dúvida" maxlength="100"></div></div><div class="community-layout"><section><div class="section-label"><h2>Um bom lugar para começar</h2></div><div class="faq-list" id="faq-list"></div></section><aside class="panel community-side"><p class="eyebrow">CONSTRUA A SUA PERGUNTA</p><h2 style="margin-top:20px">Uma boa dúvida<br>também ensina.</h2><ol><li>Conte o que você está tentando fazer.</li><li>Explique o esperado e o que aconteceu.</li><li>Compartilhe um trecho pequeno, sem senhas ou dados pessoais.</li><li>Diga o que você já tentou.</li></ol><a class="text-link" href="${paths.prompts}">Encontrar um prompt ${icon('arrow')}</a></aside></div><section class="forum-section"><div class="section-label"><div><p class="eyebrow" style="margin-bottom:12px">CONVERSAS DA COMUNIDADE</p><h2>Aprendemos melhor juntos.</h2></div>${user ? `<button class="button button-small" id="new-post">Nova pergunta ${icon('plus')}</button>` : `<a class="button button-ghost button-small" href="${paths.login}">Entrar para participar ${icon('arrow')}</a>`}</div><div id="forum-feed">${user ? '<p class="loading-message">Buscando conversas…</p>' : empty('Entre em uma conta para ler e publicar conversas da comunidade. As respostas do guia acima estão abertas a todos.')}</div><p class="forum-notice">Compartilhe com respeito. Dê contexto, reconheça a ajuda recebida e evite publicar informações pessoais.</p></section>`;
  let topic = 'Todos';
  function renderFAQs() {
    const query = $('#faq-search', root).value.trim().toLocaleLowerCase('pt-BR');
    const items = faqs.filter(faq => (topic === 'Todos' || faq.category === topic) && `${faq.title} ${faq.content}`.toLocaleLowerCase('pt-BR').includes(query));
    $('#faq-list', root).innerHTML = items.length ? items.map(faq => `<details class="faq-item"><summary>${e(faq.title)}</summary><p>${e(faq.content)}</p></details>`).join('') : empty('Nenhuma resposta encontrada. Tente outra palavra ou categoria.');
  }
  root.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.topic;
    root.querySelectorAll('[data-topic]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    renderFAQs();
  }, { signal }));
  $('#faq-search', root).addEventListener('input', renderFAQs, { signal }); renderFAQs();
  if (!user) return;
  let posts = [];
  async function loadPosts() {
    try {
      const { db, firestore: f } = await getServices();
      const snapshot = await timeout(f.getDocs(f.query(f.collection(db, 'posts'), f.orderBy('createdAt', 'desc'), f.limit(30))));
      if (signal.aborted) return;
      posts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      $('#forum-feed', root).innerHTML = posts.length ? posts.map(p => `<button class="post-card" data-post="${e(p.id)}"><span class="tag">${e(p.topic)}</span><h3>${e(p.title)}</h3><p>${e(String(p.content || '').slice(0, 150))}</p><span class="post-author">${e(p.authorName || 'Estudante')} · ${e(displayDate(p.createdAt))}</span></button>`).join('') : empty('Ainda não há conversas. Compartilhe a primeira dúvida da jornada.');
    } catch (error) {
      if (signal.aborted) return;
      $('#forum-feed', root).innerHTML = empty(shortError(error), '<button class="button button-ghost button-small" id="retry-posts">Tentar novamente</button>');
      $('#retry-posts', root).addEventListener('click', loadPosts, { signal });
    }
  }
  loadPosts();
  $('#new-post', root).addEventListener('click', () => {
    const dialog = openDialog('Sua dúvida pode ajudar alguém.', `<form class="form-stack" id="post-form"><div><label for="post-title">Título da pergunta</label><input id="post-title" name="title" required minlength="8" maxlength="140" placeholder="Ex.: Como salvar uma tarefa ao recarregar?"></div><div><label for="post-topic">Assunto</label><select id="post-topic" name="topic">${categories.map(c => `<option>${c}</option>`).join('')}</select></div><div><label for="post-content">Contexto e o que você já tentou</label><textarea id="post-content" name="content" required minlength="20" maxlength="5000" rows="7"></textarea></div><p class="helper">Sua pergunta será visível aos membros da comunidade.</p><p class="form-feedback" role="alert"></p><button class="button" type="submit">Publicar pergunta ${icon('arrow')}</button></form>`);
    $('#post-form', dialog).addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget; const data = new FormData(form); const submit = $('button[type=submit]', form);
      const title = String(data.get('title')).trim(), content = String(data.get('content')).trim();
      if (title.length < 8 || content.length < 20) { $('.form-feedback', form).textContent = 'Dê um título com pelo menos 8 caracteres e um contexto com pelo menos 20.'; return; }
      submit.disabled = true;
      try {
        const { db, firestore: f } = await getServices();
        await timeout(f.addDoc(f.collection(db, 'posts'), { title, content, topic: data.get('topic'), userId: user.uid, authorName: user.displayName || 'Estudante', createdAt: f.serverTimestamp() }));
        if (signal.aborted) return;
        closeDialog(); toast('Pergunta publicada.'); loadPosts();
      } catch (error) { $('.form-feedback', form).textContent = shortError(error); } finally { submit.disabled = false; }
    });
  }, { signal });
  $('#forum-feed', root).addEventListener('click', async event => {
    const button = event.target.closest('[data-post]'); if (!button) return;
    const post = posts.find(p => p.id === button.dataset.post); if (!post) return;
    const dialog = openDialog(post.title, `<p class="post-body">${e(post.content)}</p><p class="helper">${e(post.authorName || 'Estudante')} · ${e(post.topic)}</p><h3>Respostas</h3><div id="replies-list"><p>Buscando respostas…</p></div><form class="form-stack" id="reply-form" style="margin-top:20px"><div><label for="reply-content">Contribua com a conversa</label><textarea id="reply-content" name="content" required minlength="3" maxlength="3000" rows="4"></textarea></div><p class="form-feedback" role="alert"></p><button class="button button-small" type="submit">Enviar resposta</button></form>${isOwner(user, post) ? '<button class="text-button" id="remove-post" style="margin-top:20px">Excluir minha pergunta</button>' : ''}`);
    async function loadReplies() {
      const list = $('#replies-list', dialog);
      try {
        const { db, firestore: f } = await getServices();
        const snapshot = await timeout(f.getDocs(f.query(f.collection(db, 'posts', post.id, 'replies'), f.orderBy('createdAt', 'asc'), f.limit(100))));
        if (signal.aborted || !list.isConnected) return;
        list.innerHTML = snapshot.empty ? '<p class="helper">Nenhuma resposta ainda. Você pode começar a conversa.</p>' : snapshot.docs.map(doc => `<article class="reply"><small>${e(doc.data().authorName || 'Estudante')}</small><p>${e(doc.data().content)}</p></article>`).join('');
      } catch (error) { if (list.isConnected) list.textContent = shortError(error); }
    }
    loadReplies();
    $('#reply-form', dialog).addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const submit = $('button[type=submit]', form);
      const content = String(new FormData(form).get('content')).trim();
      if (content.length < 3) { $('.form-feedback', form).textContent = 'Escreva pelo menos 3 caracteres.'; return; }
      submit.disabled = true;
      try {
        const { db, firestore: f } = await getServices();
        await timeout(f.addDoc(f.collection(db, 'posts', post.id, 'replies'), { content, userId: user.uid, authorName: user.displayName || 'Estudante', createdAt: f.serverTimestamp() }));
        form.reset(); await loadReplies(); toast('Resposta enviada.');
      } catch (error) { $('.form-feedback', form).textContent = shortError(error); } finally { submit.disabled = false; }
    });
    $('#remove-post', dialog)?.addEventListener('click', async event => {
      const button = event.currentTarget;
      if (!button.dataset.confirm) { button.dataset.confirm = 'true'; button.textContent = 'Confirmar exclusão da pergunta e ocultar suas respostas'; return; }
      button.disabled = true;
      try { const { db, firestore: f } = await getServices(); await timeout(f.deleteDoc(f.doc(db, 'posts', post.id))); closeDialog(); loadPosts(); toast('Pergunta removida.'); }
      catch (error) { toast(shortError(error), true); button.disabled = false; }
    });
  }, { signal });
}
