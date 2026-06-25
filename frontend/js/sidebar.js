// Genere la sidebar et la top bar selon le role de l'utilisateur connecte
function renderSidebar(activePage) {
  const user = getUser();
  if (!user) return;

  const menus = {
    super_admin: [
      ['dashboard.html', 'bi-speedometer2', 'Dashboard'],
      ['enrolement.html', 'bi-person-plus', 'Enrolement'],
      ['production.html', 'bi-gear', 'Production'],
      ['produit.html', 'bi-box-seam', 'Produit'],
      ['quarantaine.html', 'bi-exclamation-triangle', 'Quarantaine'],
      ['reception.html', 'bi-truck', 'Reception/Livraison'],
      ['plaintes.html', 'bi-megaphone', 'Plaintes'],
      ['utilisateurs.html', 'bi-people', 'Utilisateurs'],
      ['rapports.html', 'bi-file-earmark-bar-graph', 'Rapports']
    ],
    enrolement: [
      ['enrolement.html', 'bi-person-plus', 'Enrolement']
    ],
    production: [
      ['production.html', 'bi-gear', 'Production']
    ],
    produit: [
      ['produit.html', 'bi-box-seam', 'Produit']
    ],
    quarantaine: [
      ['quarantaine.html', 'bi-exclamation-triangle', 'Quarantaine']
    ],
    reception_plaintes: [
      ['reception.html', 'bi-truck', 'Reception/Livraison'],
      ['plaintes.html', 'bi-megaphone', 'Plaintes']
    ]
  };

  const items = menus[user.role] || [];
  const sidebar = document.getElementById('pt-sidebar');
  sidebar.innerHTML = `
    <div class="brand d-flex align-items-center gap-2">
      <i class="bi bi-passport"></i> <span class="brand-text">PasseportTrack</span>
    </div>
    <nav class="nav flex-column mt-2">
      ${items.map(([href, icon, label]) => `
        <a class="nav-link d-flex align-items-center gap-2 py-2 px-3 ${activePage === href ? 'active' : ''}" href="${href}">
          <i class="bi ${icon}"></i> <span class="nav-text">${label}</span>
        </a>`).join('')}
      <a class="nav-link d-flex align-items-center gap-2 py-2 px-3 text-warning" href="#" onclick="logout()">
        <i class="bi bi-box-arrow-right"></i> <span class="nav-text">Deconnexion</span>
      </a>
    </nav>
  `;

  const userLabel = document.getElementById('pt-user-label');
  if (userLabel) userLabel.textContent = `${user.prenom} ${user.nom} (${roleLabel(user.role)})`;
}

function roleLabel(role) {
  const labels = {
    super_admin: 'Super Administrateur', enrolement: 'Enrolement', production: 'Production',
    produit: 'Produit', quarantaine: 'Quarantaine', reception_plaintes: 'Reception et Plaintes'
  };
  return labels[role] || role;
}

function toggleSidebar() {
  document.getElementById('pt-sidebar').classList.toggle('collapsed');
  document.getElementById('pt-sidebar').classList.toggle('show');
}

function connectNotifications() {
  if (typeof io === 'undefined') return;
  const socket = io();
  socket.on('notification', (notif) => {
    const container = document.getElementById('pt-toast-container');
    if (!container) return;
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-success border-0';
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body"><strong>${notif.type}</strong><br>${notif.message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    container.appendChild(toastEl);
    new bootstrap.Toast(toastEl, { delay: 6000 }).show();
  });
}
