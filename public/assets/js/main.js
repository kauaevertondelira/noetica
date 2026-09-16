import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swup from 'swup';
import { store } from './store.js';
import { initCourses, initPrompts, initInspirations } from './catalog.js';
import { initClassroom } from './classroom.js';
import { initDashboard } from './dashboard.js';
import { initCommunity } from './community.js';
import { initLogin, restoreAuth } from './auth.js';
import { $, paths, icon, bindDialog, closeDialog, openDialog, toast } from './ui.js';

gsap.registerPlugin(ScrollTrigger);
let controller;
let animationContext;
let motionPaused = false;
try { motionPaused = localStorage.getItem('noetica:motion') === 'paused'; } catch { /* user preference is optional */ }
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const shouldReduce = () => motionPaused || reducedMotion.matches;
const swup = new Swup({ containers: ['#swup'], animateHistoryBrowsing: true, cache: true });

function animations() {
  animationContext?.revert();
  const root = $('#swup');
  document.documentElement.classList.toggle('reduce-motion', shouldReduce());
  const button = $('[data-motion]');
  button.setAttribute('aria-pressed', String(shouldReduce()));
  button.textContent = shouldReduce() ? 'Movimento reduzido' : 'Pausar animações';
  const video = $('#bg-video');
  if (video) {
    if (shouldReduce() || document.hidden) video.pause();
    else video.play().catch(() => {});
  }
  if (shouldReduce()) return;
  animationContext = gsap.context(() => {
    const hero = root.querySelectorAll('.gsap-hero');
    if (hero.length) gsap.fromTo(hero, { y: 23, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .65, ease: 'power3.out', clearProps: 'transform,opacity' });
    const art = $('.gsap-hero-img', root);
    if (art) {
      gsap.fromTo(art, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out', clearProps: 'opacity,transform' });
      gsap.to('.hero-symbol', { y: -10, rotation: 3, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.floating-code', { y: 9, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    root.querySelectorAll('.gsap-scroll').forEach(el => gsap.fromTo(el, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: .65, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 94%', once: true } }));
  }, root);
}

function closeMenu() {
  $('#main-nav').classList.remove('is-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Abrir menu');
}
function cleanup() {
  controller?.abort();
  animationContext?.revert();
  animationContext = null;
  $('#bg-video')?.pause();
  closeDialog();
  closeMenu();
}

function initPage({ focus = false } = {}) {
  cleanup();
  controller = new AbortController();
  const root = $('#swup');
  const page = root.dataset.page;
  document.body.dataset.page = page;
  const activePath = page === 'classroom' ? new URL(paths.courses, document.baseURI).pathname : location.pathname;
  // A fragment alone would target the site base, not the current lesson.
  $('.skip-link').href = `${location.pathname}${location.search}#swup`;
  document.querySelectorAll('#main-nav a').forEach(link => {
    if (link.pathname === activePath) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  try {
    const initializers = { courses: initCourses, classroom: initClassroom, dashboard: initDashboard, inspirations: initInspirations, prompts: initPrompts, community: initCommunity, login: initLogin };
    initializers[page]?.(root, controller.signal);
    if (page === 'home') {
      const art = $('.hero-art', root);
      const bg = document.createElement('div');
      bg.className = 'video-background';
      bg.setAttribute('aria-hidden', 'true');
      bg.innerHTML = '<video id="bg-video" loop muted playsinline preload="none" tabindex="-1"><source src="IMG/background.mp4" type="video/mp4"></video>';
      art.append(bg);
      $('#bg-video', root).muted = true;
    }
    if (store.storageProblem) toast('O armazenamento do navegador está indisponível ou contém dados inválidos. Exporte uma cópia quando possível; novas alterações podem não ser salvas.', true);
    animations();
    if (focus) root.focus({ preventScroll: true });
  } catch (error) {
    console.error('Noética: falha ao iniciar a página', error);
    toast('Não foi possível abrir esta tela. Recarregue a página para tentar novamente.', true);
  }
}

swup.hooks.before('content:replace', cleanup);
swup.hooks.on('page:view', () => initPage({ focus: true }));
window.addEventListener('noetica:navigate', event => { closeDialog(); swup.navigate(event.detail); });
window.addEventListener('noetica:refresh', () => initPage());
window.addEventListener('noetica:before-scope', cleanup);
window.addEventListener('storage', event => {
  if (event.key === `noetica:v2:${store.scope}`) {
    // Do not overwrite a focused draft with another tab's render.
    if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) initPage();
    else toast('Seu progresso mudou em outra aba. Termine esta edição antes de continuar.');
  }
});
$('.menu-toggle').addEventListener('click', event => {
  const open = $('#main-nav').classList.toggle('is-open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
  event.currentTarget.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (!event.target.closest('.navbar')) closeMenu();
  if (event.target.closest('#main-nav a')) closeMenu();
});
$('[data-motion]').addEventListener('click', () => {
  if (reducedMotion.matches) { toast('A preferência do seu sistema por movimento reduzido está sendo respeitada.'); return; }
  motionPaused = !motionPaused;
  try { localStorage.setItem('noetica:motion', motionPaused ? 'paused' : 'playing'); } catch { /* optional preference */ }
  animations();
});
reducedMotion.addEventListener('change', animations);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { animationContext?.getTweens().forEach(t => t.pause()); $('#bg-video')?.pause(); }
  else animations();
});
$('[data-privacy]').addEventListener('click', () => openDialog('Seus dados na Noética', `<p>No acesso livre, aulas concluídas, respostas, notas, código de prática e projetos ficam no armazenamento deste navegador. A Noética não pede senha para esse modo.</p><h3>Ao entrar em uma conta</h3><p>O Firebase recebe seus dados de autenticação e o progresso da sua conta para sincronização. Perguntas e respostas da comunidade ficam visíveis a outros membros. Não publique informações sensíveis.</p><h3>Você controla sua cópia</h3><p>No workspace, use Exportar progresso para guardar uma cópia. Para apagar dados locais, use as configurações de dados do site no navegador. Isso não apaga uma cópia já sincronizada na conta. O progresso do acesso livre e o da conta ficam separados.</p><h3>Ferramentas de IA</h3><p>O laboratório não envia seu código para uma IA. Você escolhe se quer copiar um prompt e usá-lo em um serviço externo, que tem suas próprias condições e política de dados.</p>`));
bindDialog();
initPage();
restoreAuth();
