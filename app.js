const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const marketing = $('#marketing');
const authView = $('#auth-view');
const workspace = $('#workspace');
const toast = $('#toast');
const projectDialog = $('#project-dialog');

const state = {
  theme: localStorage.getItem('velora-theme') || 'dark',
  currentView: 'overview',
  signedIn: false,
};

document.body.dataset.theme = state.theme;

const words = ['noise.', 'chasing.', 'tab-hopping.', 'guesswork.'];
let wordIndex = 0;
setInterval(() => {
  const el = $('#rotating-word');
  if (!el || document.hidden) return;
  el.animate([{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(-12px)'}], {duration:240, easing:'ease', fill:'forwards'}).onfinish = () => {
    wordIndex = (wordIndex + 1) % words.length;
    el.textContent = words[wordIndex];
    el.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:360, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'});
  };
}, 2300);

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function openAuth(mode='signin'){
  marketing.classList.add('hidden');
  workspace.classList.add('hidden');
  authView.classList.remove('hidden');
  document.body.classList.add('modal-open');
  switchAuth(mode);
  history.replaceState(null,'',`#${mode}`);
}

function closeAuth(){
  authView.classList.add('hidden');
  marketing.classList.remove('hidden');
  document.body.classList.remove('modal-open');
  history.replaceState(null,'',location.pathname + location.search);
}

function switchAuth(mode){
  const signIn = $('#signin-form');
  const signUp = $('#signup-form');
  signIn.classList.toggle('hidden', mode !== 'signin');
  signUp.classList.toggle('hidden', mode !== 'signup');
  $('#auth-side-title').textContent = mode === 'signin' ? 'Keep every client moment attached to the work.' : 'Build a workspace your clients actually enjoy entering.';
  $('#auth-side-copy').textContent = mode === 'signin' ? 'Your demo workspace is preloaded with projects, clients, conversations, and finance signals.' : 'A polished client experience starts with a delivery system that feels considered from the first click.';
}

function enterWorkspace(view='overview'){
  state.signedIn = true;
  marketing.classList.add('hidden');
  authView.classList.add('hidden');
  workspace.classList.remove('hidden');
  document.body.classList.remove('modal-open');
  setView(view);
  history.replaceState(null,'',`#workspace-${view}`);
}

function exitWorkspace(){
  state.signedIn = false;
  workspace.classList.add('hidden');
  marketing.classList.remove('hidden');
  history.replaceState(null,'',location.pathname + location.search);
  window.scrollTo({top:0, behavior:'smooth'});
}

const viewMeta = {
  overview: ['MONDAY · CLIENT DELIVERY', 'Good morning, Favour.'],
  projects: ['DELIVERY · 6 ACTIVE', 'Projects in motion.'],
  clients: ['RELATIONSHIPS · 4 ACTIVE', 'Clients, with context.'],
  inbox: ['CONVERSATIONS · 3 UNREAD', 'Inbox that leads somewhere.'],
  finance: ['COMMERCIAL FLOW · AUGUST', 'Money attached to the work.'],
  insights: ['OPERATING SIGNALS · 30 DAYS', 'Read the shape of delivery.'],
};

function setView(view){
  if (!viewMeta[view]) return;
  state.currentView = view;
  $$('.workspace-nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  $$('.dashboard-view').forEach(panel => panel.classList.toggle('active', panel.id === `view-${view}`));
  $('#view-eyebrow').textContent = viewMeta[view][0];
  $('#view-title').textContent = viewMeta[view][1];
  if (state.signedIn) history.replaceState(null,'',`#workspace-${view}`);
}

$$('[data-auth]').forEach(btn => btn.addEventListener('click', () => openAuth(btn.dataset.auth)));
$$('[data-switch-auth]').forEach(btn => btn.addEventListener('click', () => switchAuth(btn.dataset.switchAuth)));
$('#auth-close').addEventListener('click', closeAuth);

$$('.show-password').forEach(btn => btn.addEventListener('click', () => {
  const input = btn.parentElement.querySelector('input');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Hide' : 'Show';
}));

$('#signin-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#signin-email').value.trim();
  const password = $('#signin-password').value;
  if (!email.includes('@') || password.length < 6){
    $('#signin-error').textContent = 'Enter a valid email and a password with at least 6 characters.';
    return;
  }
  $('#signin-error').textContent = '';
  enterWorkspace('overview');
  showToast('Demo workspace ready.');
});

$('#signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const inputs = $$('input', e.currentTarget);
  if (inputs.some(i => !i.value.trim())){
    $('#signup-error').textContent = 'Complete the fields to create the demo workspace.';
    return;
  }
  $('#signup-error').textContent = '';
  enterWorkspace('overview');
  showToast('Demo account created locally.');
});

$$('.workspace-nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
$$('[data-jump]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.jump)));
$('#logout').addEventListener('click', exitWorkspace);

$('#theme-toggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = state.theme;
  localStorage.setItem('velora-theme', state.theme);
  showToast(`${state.theme === 'dark' ? 'Dark' : 'Light'} theme enabled.`);
});

$('#new-action').addEventListener('click', () => showToast('New-action menu is mocked for this concept.'));
$('#notification-button').addEventListener('click', () => showToast('3 recent workspace signals.'));
$('#tour-button').addEventListener('click', () => {
  document.querySelector('#workflow').scrollIntoView({behavior:'smooth'});
  showToast('Follow the six-view workflow below.');
});

const projectData = {
  'Helio Foods': {logo:'HF', progress:'74%', subtitle:'Brand launch · On track', cls:'coral'},
  'Arcline Labs': {logo:'AL', progress:'58%', subtitle:'Website system · Review', cls:'lilac'},
  'Casa North': {logo:'CN', progress:'86%', subtitle:'Launch campaign · On track', cls:'blue'},
};

function openProject(name){
  const data = projectData[name] || projectData['Helio Foods'];
  $('#dialog-title').textContent = name;
  $('#dialog-logo').textContent = data.logo;
  $('#dialog-logo').className = `client-logo ${data.cls}`;
  $('#dialog-progress').textContent = data.progress;
  $('#dialog-subtitle').textContent = data.subtitle;
  projectDialog.showModal();
}

$$('[data-project]').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.project)));
$('#dialog-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', (e) => {
  if (e.target === projectDialog) projectDialog.close();
});

$('#composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const textarea = $('textarea', e.currentTarget);
  const text = textarea.value.trim();
  if (!text){ showToast('Write a message first.'); return; }
  const msg = document.createElement('div');
  msg.className = 'message sent';
  msg.innerHTML = `<small>YOU · NOW</small><p></p>`;
  $('p', msg).textContent = text;
  $('.conversation-body').appendChild(msg);
  textarea.value = '';
  showToast('Message sent in the mock thread.');
});

// Useful deterministic preview routes for portfolio screenshots.
const params = new URLSearchParams(location.search);
const preview = params.get('preview');
if (preview === 'dashboard') enterWorkspace('overview');
if (preview === 'projects') enterWorkspace('projects');
if (preview === 'light') { state.theme='light'; document.body.dataset.theme='light'; enterWorkspace('overview'); }
if (location.hash === '#signin') openAuth('signin');
if (location.hash === '#signup') openAuth('signup');
if (location.hash.startsWith('#workspace-')) enterWorkspace(location.hash.replace('#workspace-',''));
