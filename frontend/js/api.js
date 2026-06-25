// Client API centralise + utilitaires d'authentification cote frontend
const API_BASE = '/api';

function getToken() { return localStorage.getItem('pt_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('pt_user')); } catch { return null; }
}
function setSession(token, user) {
  localStorage.setItem('pt_token', token);
  localStorage.setItem('pt_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('pt_token');
  localStorage.removeItem('pt_user');
}

function requireAuth(rolesAutorises = null) {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = '/index.html';
    return null;
  }
  if (rolesAutorises && !rolesAutorises.includes(user.role)) {
    alert("Acces refuse : vous n'avez pas la permission de voir cette page.");
    window.location.href = '/pages/dashboard.html';
    return null;
  }
  return user;
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body instanceof FormData) delete headers['Content-Type'];

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearSession();
    window.location.href = '/index.html';
    return null;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur API');
    return data;
  }
  if (!res.ok) throw new Error('Erreur API');
  return res;
}

function badgeStatut(statut) {
  const labels = {
    enrole: ['Enrole', 'primary'], en_production: ['En production', 'warning'],
    produit: ['Produit', 'success'], quarantaine: ['Quarantaine', 'danger'],
    pret_a_livrer: ['Pret a livrer', 'info'], livre: ['Livre', 'dark'],
    plainte_ouverte: ['Plainte ouverte', 'secondary'], plainte_resolue: ['Plainte resolue', 'success']
  };
  const [label, color] = labels[statut] || [statut, 'secondary'];
  return `<span class="badge bg-${color} badge-statut">${label}</span>`;
}

function logout() {
  apiFetch('/auth/logout', { method: 'POST' }).finally(() => {
    clearSession();
    window.location.href = '/index.html';
  });
}

function initTheme() {
  const saved = localStorage.getItem('pt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pt_theme', next);
}
initTheme();
