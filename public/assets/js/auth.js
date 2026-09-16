import { cloudEnabled, getServices } from './firebase-config.js';
import { store, normalizeState } from './store.js';
import { $, escapeHTML as e, paths, icon, toast } from './ui.js';

let currentUser = null;
let authStarted;
let syncState = 'local';
let profileReady = false;
let syncTimer;
let generation = 0;
let writeQueue = Promise.resolve();
let pending = false;
let localRevision = 0;
export const getUser = () => currentUser;
export const syncMessage = () => !currentUser ? 'Acesso livre · Seu progresso fica salvo neste navegador.' : syncState === 'ok' ? 'Seu progresso está salvo neste navegador e sincronizado com sua conta.' : syncState === 'syncing' ? 'Seu progresso está salvo neste navegador. Sincronizando com sua conta…' : 'Seu progresso está salvo neste navegador. A sincronização com sua conta está indisponível; tente novamente.';
function updateStatus() {
  document.querySelectorAll('[data-sync-status]').forEach(el => { el.textContent = syncMessage(); });
  const account = $('[data-account-link]');
  if (account) account.textContent = currentUser ? 'Minha conta' : 'Entrar';
}
function authHint(value) { try { value ? localStorage.setItem('noetica:cloud-session', '1') : localStorage.removeItem('noetica:cloud-session'); } catch { /* Authentication works without this optional hint. */ } }
const timed = (promise, ms = 12000) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('O serviço demorou a responder. Seu progresso local continua disponível.')), ms); })]).finally(() => clearTimeout(timer));
};

async function loadProfile(user, version) {
  syncState = 'syncing'; updateStatus();
  try {
    const { db, firestore: f } = await getServices();
    const snapshot = await timed(f.getDoc(f.doc(db, 'users', user.uid)));
    if (generation !== version || currentUser?.uid !== user.uid) return;
    window.dispatchEvent(new Event('noetica:before-scope'));
    const remote = snapshot.exists() ? snapshot.data() : null;
    const local = store.read();
    // Preserve offline edits. The dirty marker survives a reload or a failed write.
    let dirty = false;
    try { dirty = localStorage.getItem(`noetica:pending:${user.uid}`) === '1'; } catch { /* handled by storage UI */ }
    if (remote?.study && !dirty) store.write(normalizeState(remote.study), { remote: true });
    else if (!remote?.study && !local.name) { local.name = user.displayName || ''; store.write(local, { remote: true }); }
    profileReady = true;
    pending = true;
    window.dispatchEvent(new Event('noetica:refresh'));
    await syncNow();
  } catch {
    if (generation !== version) return;
    syncState = 'error'; updateStatus();
  }
}

export async function startAuth() {
  if (!cloudEnabled) return;
  if (authStarted) return authStarted;
  authStarted = (async () => {
    const { auth, authSDK: a } = await getServices();
    a.onAuthStateChanged(auth, user => {
      const version = ++generation;
      clearTimeout(syncTimer);
      window.dispatchEvent(new Event('noetica:before-scope'));
      currentUser = user;
      profileReady = false;
      pending = false;
      store.useScope(user?.uid || 'guest');
      authHint(Boolean(user));
      syncState = user ? 'syncing' : 'local';
      updateStatus();
      window.dispatchEvent(new Event('noetica:refresh'));
      if (user) loadProfile(user, version);
    });
    await auth.authStateReady();
  })().catch(error => { authStarted = null; throw error; });
  return authStarted;
}

export function restoreAuth() {
  let known = false;
  try { known = localStorage.getItem('noetica:cloud-session') === '1'; } catch { /* local access still renders */ }
  if (known) startAuth().catch(() => toast('Não foi possível restaurar sua conta. Você pode continuar no acesso livre.', true));
}

export async function syncNow() {
  if (!currentUser) return;
  if (!profileReady) { await loadProfile(currentUser, generation); return; }
  const user = currentUser;
  const version = generation;
  const state = store.read();
  const revision = localRevision;
  pending = false;
  syncState = 'syncing'; updateStatus();
  const task = async () => {
    if (version !== generation) return;
    try {
      const { db, firestore: f } = await getServices();
      await timed(f.setDoc(f.doc(db, 'users', user.uid), { name: (user.displayName || state.name || 'Estudante').slice(0, 100), study: state, updatedAt: f.serverTimestamp() }, { merge: true }));
      if (version !== generation) return;
      if (revision === localRevision) { try { localStorage.removeItem(`noetica:pending:${user.uid}`); } catch { /* optional marker */ } }
      syncState = revision !== localRevision ? 'syncing' : 'ok'; updateStatus();
    } catch {
      if (version !== generation) return;
      pending = true; syncState = 'error'; updateStatus();
    }
  };
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

window.addEventListener('noetica:change', event => {
  if (!currentUser || event.detail.remote || event.detail.scope !== currentUser.uid) return;
  pending = true;
  localRevision += 1;
  try { localStorage.setItem(`noetica:pending:${currentUser.uid}`, '1'); } catch { /* write errors are reported by store */ }
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { if (profileReady) syncNow(); }, 900);
});
window.addEventListener('online', () => { if (currentUser) syncNow(); });

export function authError(error) {
  const messages = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.', 'auth/email-already-in-use': 'Este e-mail já possui uma conta. Entre ou recupere a senha.',
    'auth/weak-password': 'Use uma senha com pelo menos 8 caracteres.', 'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/popup-closed-by-user': 'A janela de acesso foi fechada. Tente novamente quando quiser.',
    'auth/popup-blocked': 'Permita a janela de acesso ou use e-mail e senha.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
    'auth/network-request-failed': 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
    'auth/unauthorized-domain': 'O acesso por conta ainda não está habilitado para este endereço. Você pode continuar sem cadastro.',
    'auth/operation-not-allowed': 'Este método de acesso ainda não está habilitado. Você pode continuar sem cadastro.',
    'auth/invalid-api-key': 'O serviço de contas precisa ser configurado. O acesso livre continua disponível.',
  };
  return messages[error.code] || 'Não foi possível acessar a conta agora. Tente novamente ou continue sem cadastro.';
}

export function initLogin(root, signal) {
  const container = $('#auth-content', root);
  if (currentUser) {
    container.innerHTML = `<section class="auth-account"><p class="eyebrow">SEU ESPAÇO, COM VOCÊ</p><h1 style="margin:20px 0">Sua conta.</h1><p>${e(currentUser.email || currentUser.displayName || 'Conta conectada')}</p><div class="notice" data-sync-status>${e(syncMessage())}</div><div class="button-row"><a class="button" href="${paths.dashboard}">Ir para meu espaço ${icon('arrow')}</a><button class="button button-ghost" id="logout">Sair da conta</button></div><p class="helper">O progresso do acesso livre e o da conta ficam em espaços separados. Para transferir, exporte uma cópia e importe no espaço desejado.</p></section>`;
    $('#logout', root).addEventListener('click', async event => {
      event.currentTarget.disabled = true;
      try { await syncNow(); const { auth, authSDK: a } = await getServices(); await a.signOut(auth); toast('Você saiu da conta. O acesso livre continua disponível.'); }
      catch (error) { event.currentTarget.disabled = false; toast(authError(error), true); }
    }, { signal });
    return;
  }
  container.innerHTML = `<section class="auth-intro"><p class="eyebrow">UM PRÓXIMO PASSO, JUNTOS</p><h1>Suas ideias.<br>Seu ritmo.<br><span>Seu espaço.</span></h1><p>Entre para sincronizar o progresso da sua conta e participar das conversas. Ou comece agora, sem cadastro.</p><img class="auth-symbol" src="IMG/LogoSemnome.png" width="150" height="150" alt=""></section><section class="panel auth-card"><h2 id="auth-title">Bom ter você por aqui.</h2><p id="auth-subtitle">Entre e continue a sua jornada.</p>${cloudEnabled ? `<form id="auth-form" class="form-stack"><div id="name-field" hidden><label for="auth-name">Como podemos chamar você?</label><input id="auth-name" name="name" autocomplete="name" maxlength="60" minlength="2"></div><div><label for="auth-email">E-mail</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="voce@exemplo.com"></div><div><label for="auth-password">Senha</label><div class="password-row"><input id="auth-password" name="password" type="password" autocomplete="current-password" required minlength="6" maxlength="128"><button type="button" class="text-button" id="show-password" aria-pressed="false">Mostrar</button></div></div><p class="form-feedback" id="auth-feedback" role="alert"></p><button class="button full-width" type="submit" id="auth-submit">Entrar na minha conta ${icon('arrow')}</button><button class="text-button" type="button" id="reset-password">Esqueci minha senha</button></form><div class="auth-divider">OU CONTINUE COM</div><button class="button button-ghost full-width" id="google-login">Google ${icon('external')}</button><div class="auth-switch"><button class="text-button" id="toggle-auth">Ainda não tem conta? Criar conta</button></div>` : '<div class="notice">As contas estão desativadas neste ambiente. As aulas, projetos e anotações estão disponíveis no acesso livre.</div>'}<div class="auth-guest"><a href="${paths.dashboard}">Continuar sem cadastro →</a></div><p class="helper" style="margin-top:20px">Contas e acesso livre usam espaços separados. Você pode transferir seu estudo pela exportação e importação do progresso.</p></section>`;
  if (!cloudEnabled) return;
  let registering = false;
  let busy = false;
  const feedback = $('#auth-feedback', root);
  const setBusy = value => { busy = value; root.querySelectorAll('#auth-form button, #toggle-auth, #google-login').forEach(b => { b.disabled = value; }); };
  $('#toggle-auth', root).addEventListener('click', () => {
    registering = !registering;
    $('#auth-title', root).textContent = registering ? 'Crie seu próximo começo.' : 'Bom ter você por aqui.';
    $('#auth-subtitle', root).textContent = registering ? 'Seu espaço para aprender e compartilhar.' : 'Entre e continue a sua jornada.';
    $('#name-field', root).hidden = !registering;
    $('#auth-name', root).required = registering;
    $('#auth-password', root).minLength = registering ? 8 : 6;
    $('#auth-password', root).autocomplete = registering ? 'new-password' : 'current-password';
    $('#auth-submit', root).textContent = registering ? 'Criar minha conta' : 'Entrar na minha conta';
    $('#toggle-auth', root).textContent = registering ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Criar conta';
    $('#reset-password', root).hidden = registering;
    feedback.textContent = '';
  }, { signal });
  $('#show-password', root).addEventListener('click', event => {
    const input = $('#auth-password', root); const show = input.type === 'password'; input.type = show ? 'text' : 'password';
    event.target.textContent = show ? 'Ocultar' : 'Mostrar'; event.target.setAttribute('aria-pressed', String(show));
  }, { signal });
  $('#auth-form', root).addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); feedback.textContent = 'Conectando…';
    try {
      const { auth, authSDK: a } = await getServices();
      const credential = registering ? await a.createUserWithEmailAndPassword(auth, String(data.get('email')).trim(), data.get('password')) : await a.signInWithEmailAndPassword(auth, String(data.get('email')).trim(), data.get('password'));
      if (registering) await a.updateProfile(credential.user, { displayName: String(data.get('name')).trim() });
      await startAuth();
      window.dispatchEvent(new CustomEvent('noetica:navigate', { detail: paths.dashboard }));
    } catch (error) { feedback.textContent = authError(error); }
    finally { setBusy(false); }
  }, { signal });
  $('#google-login', root).addEventListener('click', async () => {
    if (busy) return; setBusy(true); feedback.textContent = '';
    try { const { auth, authSDK: a } = await getServices(); await a.signInWithPopup(auth, new a.GoogleAuthProvider()); await startAuth(); window.dispatchEvent(new CustomEvent('noetica:navigate', { detail: paths.dashboard })); }
    catch (error) { feedback.textContent = authError(error); } finally { setBusy(false); }
  }, { signal });
  $('#reset-password', root).addEventListener('click', async () => {
    const email = $('#auth-email', root); if (!email.reportValidity()) return;
    setBusy(true);
    try { const { auth, authSDK: a } = await getServices(); await a.sendPasswordResetEmail(auth, email.value.trim()); feedback.textContent = 'Se houver uma conta para este e-mail, você receberá instruções para redefinir a senha.'; }
    catch (error) { feedback.textContent = authError(error); } finally { setBusy(false); }
  }, { signal });
}
