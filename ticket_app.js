/*
  CUSTOMER SUPPORT TICKET SYSTEM
  Built by: Sneh Desai
  -----------------------------------------------
  FILE 5 of 6: ticket_app.js
  Updated: Added customer registration system
*/


// ==============================
// ADMIN ACCOUNT (fixed — only one admin)
// ==============================
const ADMIN = { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' };


// ==============================
// DATA STORAGE
// localStorage acts as our database
// ==============================

// Get all registered customers
function getUsers() {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : [];
}

// Save all customers
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getTickets() {
  const data = localStorage.getItem('tickets');
  return data ? JSON.parse(data) : [];
}

function saveTickets(tickets) {
  localStorage.setItem('tickets', JSON.stringify(tickets));
}

function getSession() {
  const data = sessionStorage.getItem('session');
  return data ? JSON.parse(data) : null;
}

function saveSession(user) {
  sessionStorage.setItem('session', JSON.stringify(user));
}


// ==============================
// TAB SWITCHING (Login / Register)
// ==============================
function switchTab(tab) {
  const loginCard    = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');

  if (tab === 'login') {
    loginCard.style.display    = 'block';
    registerCard.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginCard.style.display    = 'none';
    registerCard.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}


// ==============================
// REGISTRATION
// SQL: INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)
// ==============================
function handleRegister() {
  const firstname = document.getElementById('reg-firstname').value.trim();
  const lastname  = document.getElementById('reg-lastname').value.trim();
  const username  = document.getElementById('reg-username').value.trim().toLowerCase();
  const email     = document.getElementById('reg-email').value.trim().toLowerCase();
  const password  = document.getElementById('reg-password').value;
  const confirm   = document.getElementById('reg-confirm').value;
  const errorEl   = document.getElementById('register-error');
  const successEl = document.getElementById('register-success');

  // Hide previous messages
  errorEl.style.display   = 'none';
  successEl.style.display = 'none';

  // Validation
  if (!firstname || !lastname) { showRegError('Please enter your full name.'); return; }
  if (!username)               { showRegError('Please choose a username.'); return; }
  if (username.length < 3)     { showRegError('Username must be at least 3 characters.'); return; }
  if (!email)                  { showRegError('Please enter your email address.'); return; }
  if (!email.includes('@'))    { showRegError('Please enter a valid email address.'); return; }
  if (password.length < 6)     { showRegError('Password must be at least 6 characters.'); return; }
  if (password !== confirm)    { showRegError('Passwords do not match.'); return; }

  // Check if username already taken
  if (username === 'admin') { showRegError('That username is not available.'); return; }

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    showRegError('Username already taken. Please choose another.');
    return;
  }
  if (users.find(u => u.email === email)) {
    showRegError('An account with this email already exists.');
    return;
  }

  // Create new user
  // SQL: INSERT INTO users (username, password, full_name, email, role) VALUES (...)
  const newUser = {
    username: username,
    password: password,  // in production: always hash passwords with bcrypt!
    name:     firstname + ' ' + lastname,
    email:    email,
    role:     'customer',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Show success and switch to login
  successEl.style.display = 'block';
  setTimeout(() => {
    switchTab('login');
    document.getElementById('username').value = username;
    successEl.style.display = 'none';
  }, 2000);
}

function showRegError(msg) {
  const el = document.getElementById('register-error');
  el.textContent    = '❌ ' + msg;
  el.style.display  = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}


// ==============================
// LOGIN
// SQL: SELECT * FROM users WHERE username = ? AND password = ?
// ==============================
function handleLogin() {
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');

  errorEl.style.display = 'none';

  // Check admin first
  if (username === ADMIN.username && password === ADMIN.password) {
    saveSession({ username: ADMIN.username, role: 'admin', name: 'Admin' });
    window.location.href = 'ticket_admin.html';
    return;
  }

  // Check registered customers
  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);

  if (!user) {
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 3000);
    return;
  }

  // Save session and redirect
  saveSession({ username: user.username, role: 'customer', name: user.name });
  window.location.href = 'ticket_dashboard.html';
}

// Fill admin credentials on click
function fillCredentials(user, pass) {
  document.getElementById('username').value = user;
  document.getElementById('password').value = pass;
}

// Logout
function logout() {
  sessionStorage.removeItem('session');
  window.location.href = 'ticket_index.html';
}

// Protect pages
function requireAuth(requiredRole) {
  const session = getSession();
  if (!session) {
    window.location.href = 'ticket_index.html';
    return null;
  }
  if (requiredRole && session.role !== requiredRole) {
    window.location.href = session.role === 'admin' ? 'ticket_admin.html' : 'ticket_dashboard.html';
    return null;
  }
  return session;
}


// ==============================
// CUSTOMER DASHBOARD
// ==============================

let currentFilter = 'all';
let formVisible   = false;

function initDashboard() {
  const session = requireAuth('customer');
  if (!session) return;

  document.getElementById('nav-username').textContent = session.name;

  if (getTickets().filter(t => t.customer === session.username).length === 0) {
    loadSampleTickets(session.username, session.name);
  }

  renderCustomerTickets();
  updateCustomerStats(session.username);
}

function toggleForm() {
  formVisible = !formVisible;
  document.getElementById('ticket-form').style.display = formVisible ? 'block' : 'none';
}

function submitTicket() {
  const session  = getSession();
  const subject  = document.getElementById('t-subject').value.trim();
  const category = document.getElementById('t-category').value;
  const priority = document.getElementById('t-priority').value;
  const phone    = document.getElementById('t-phone').value.trim();
  const desc     = document.getElementById('t-description').value.trim();

  if (!subject) { showFlash('⚠️ Please enter a subject', '#f59e0b'); return; }
  if (!desc)    { showFlash('⚠️ Please describe your issue', '#f59e0b'); return; }

  const tickets = getTickets();

  const ticket = {
    id:           'TKT-' + String(Date.now()).slice(-6),
    subject:      subject,
    category:     category,
    priority:     priority,
    phone:        phone,
    description:  desc,
    status:       'Open',
    customer:     session.username,
    customerName: session.name,
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
    notes:        []
  };

  tickets.unshift(ticket);
  saveTickets(tickets);

  document.getElementById('t-subject').value     = '';
  document.getElementById('t-description').value = '';
  document.getElementById('t-phone').value        = '';
  toggleForm();

  renderCustomerTickets();
  updateCustomerStats(session.username);
  showFlash('✅ Ticket ' + ticket.id + ' submitted!', '#10b981');
}

function renderCustomerTickets() {
  const session = getSession();
  const tickets = getTickets().filter(t => t.customer === session.username);
  const list    = document.getElementById('ticket-list');

  let filtered = tickets;
  if (currentFilter !== 'all') filtered = tickets.filter(t => t.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎫</div>
        <p>${currentFilter === 'all' ? "No tickets yet. Click 'New Ticket' to get started!" : 'No ' + currentFilter + ' tickets.'}</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(t => `
    <div class="ticket-item" onclick="viewTicket('${t.id}')">
      <span class="ticket-id">${t.id}</span>
      <div class="ticket-info">
        <div class="ticket-subject">${t.subject}</div>
        <div class="ticket-meta">${t.category} · ${formatDate(t.createdAt)}</div>
      </div>
      <span class="priority-badge priority-${t.priority}">${t.priority}</span>
      <span class="status-badge status-${t.status.replace(' ', '-')}">${t.status}</span>
    </div>
  `).join('');
}

function updateCustomerStats(username) {
  const tickets = getTickets().filter(t => t.customer === username);
  document.getElementById('c-total').textContent    = tickets.length;
  document.getElementById('c-open').textContent     = tickets.filter(t => t.status === 'Open').length;
  document.getElementById('c-progress').textContent = tickets.filter(t => t.status === 'In Progress').length;
  document.getElementById('c-resolved').textContent = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCustomerTickets();
}

function viewTicket(id) {
  const ticket = getTickets().find(t => t.id === id);
  if (!ticket) return;

  document.getElementById('modal-subject').textContent = ticket.subject;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-body">
      <div class="detail-row"><span class="detail-label">Ticket ID</span><span class="detail-value">${ticket.id}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="status-badge status-${ticket.status.replace(' ','-')}">${ticket.status}</span></div>
      <div class="detail-row"><span class="detail-label">Priority</span><span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span></div>
      <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${ticket.category}</span></div>
      <div class="detail-row"><span class="detail-label">Submitted</span><span class="detail-value">${formatDate(ticket.createdAt)}</span></div>
      <div class="detail-row"><span class="detail-label">Last Updated</span><span class="detail-value">${formatDate(ticket.updatedAt)}</span></div>
      <p style="font-size:12px;color:var(--muted);margin:16px 0 6px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</p>
      <div class="description-box">${ticket.description}</div>
      ${ticket.notes.length > 0 ? `
        <div class="notes-history">
          <p style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:10px;">Agent Notes</p>
          ${ticket.notes.map(n => `<div class="note-item"><div class="note-meta">🛡️ Support Agent · ${n.date}</div>${n.text}</div>`).join('')}
        </div>` : ''}
    </div>`;
  openModal();
}


// ==============================
// ADMIN PANEL
// ==============================

let adminFilter = { status: 'all', priority: 'all', category: 'all', search: '' };

function initAdmin() {
  const session = requireAuth('admin');
  if (!session) return;

  document.getElementById('nav-username').textContent = session.name;

  renderAdminTickets();
  updateAdminStats();
}

function renderAdminTickets() {
  let tickets = getTickets();

  if (adminFilter.status   !== 'all') tickets = tickets.filter(t => t.status   === adminFilter.status);
  if (adminFilter.priority !== 'all') tickets = tickets.filter(t => t.priority === adminFilter.priority);
  if (adminFilter.category !== 'all') tickets = tickets.filter(t => t.category === adminFilter.category);

  if (adminFilter.search) {
    const kw = adminFilter.search.toLowerCase();
    tickets = tickets.filter(t =>
      t.subject.toLowerCase().includes(kw) ||
      t.customerName.toLowerCase().includes(kw) ||
      t.id.toLowerCase().includes(kw)
    );
  }

  const list = document.getElementById('admin-ticket-list');
  document.getElementById('ticket-count').textContent = tickets.length + ' ticket' + (tickets.length !== 1 ? 's' : '');

  if (tickets.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No tickets match your filters.</p></div>`;
    return;
  }

  list.innerHTML = tickets.map(t => `
    <div class="ticket-item" onclick="adminViewTicket('${t.id}')">
      <span class="ticket-id">${t.id}</span>
      <div class="ticket-info">
        <div class="ticket-subject">${t.subject}</div>
        <div class="ticket-meta">👤 ${t.customerName} · ${t.category} · ${formatDate(t.createdAt)}</div>
      </div>
      <span class="priority-badge priority-${t.priority}">${t.priority}</span>
      <span class="status-badge status-${t.status.replace(' ','-')}">${t.status}</span>
    </div>
  `).join('');
}

function updateAdminStats() {
  const tickets = getTickets();
  document.getElementById('a-total').textContent    = tickets.length;
  document.getElementById('a-open').textContent     = tickets.filter(t => t.status === 'Open').length;
  document.getElementById('a-progress').textContent = tickets.filter(t => t.status === 'In Progress').length;
  document.getElementById('a-resolved').textContent = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  document.getElementById('a-critical').textContent = tickets.filter(t => t.priority === 'Critical').length;
}

function applyAdminFilters() {
  adminFilter.status   = document.getElementById('filter-status').value;
  adminFilter.priority = document.getElementById('filter-priority').value;
  adminFilter.category = document.getElementById('filter-category').value;
  renderAdminTickets();
}

function adminSearch() {
  adminFilter.search = document.getElementById('admin-search').value;
  renderAdminTickets();
}

function adminViewTicket(id) {
  const ticket = getTickets().find(t => t.id === id);
  if (!ticket) return;

  document.getElementById('modal-subject').textContent = ticket.subject;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-body">
      <div class="detail-row"><span class="detail-label">Ticket ID</span><span class="detail-value">${ticket.id}</span></div>
      <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${ticket.customerName}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="status-badge status-${ticket.status.replace(' ','-')}">${ticket.status}</span></div>
      <div class="detail-row"><span class="detail-label">Priority</span><span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span></div>
      <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${ticket.category}</span></div>
      <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${ticket.phone || 'Not provided'}</span></div>
      <div class="detail-row"><span class="detail-label">Submitted</span><span class="detail-value">${formatDate(ticket.createdAt)}</span></div>
      <p style="font-size:12px;color:var(--muted);margin:16px 0 6px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</p>
      <div class="description-box">${ticket.description}</div>
      <div class="admin-actions">
        <h4>Update Ticket</h4>
        <div class="action-row">
          <label style="margin:0;line-height:36px;">Change Priority:</label>
          <select id="update-priority" style="width:auto;padding:8px 12px;">
            <option value="Low"      ${ticket.priority==='Low'      ?'selected':''}>🟢 Low</option>
            <option value="Medium"   ${ticket.priority==='Medium'   ?'selected':''}>🟡 Medium</option>
            <option value="High"     ${ticket.priority==='High'     ?'selected':''}>🔴 High</option>
            <option value="Critical" ${ticket.priority==='Critical' ?'selected':''}>🚨 Critical</option>
          </select>
        </div>
        <div class="notes-box">
          <label>Add Note for Customer</label>
          <textarea id="admin-note" placeholder="Add a note about this ticket..." rows="3"></textarea>
        </div>
        <div class="resolve-actions">
          <button class="status-btn btn-progress" onclick="updateTicket('${id}', 'In Progress')">🟡 In Progress</button>
          <button class="status-btn btn-resolved" onclick="updateTicket('${id}', 'Resolved')">🟢 Resolved</button>
          <button class="status-btn btn-closed"   onclick="updateTicket('${id}', 'Closed')">⬛ Close</button>
          <button class="status-btn btn-reopen"   onclick="updateTicket('${id}', 'Open')">🔴 Reopen</button>
        </div>
      </div>
      ${ticket.notes.length > 0 ? `
        <div class="notes-history">
          <p style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:10px;">Note History</p>
          ${ticket.notes.map(n => `<div class="note-item"><div class="note-meta">🛡️ Admin · ${n.date}</div>${n.text}</div>`).join('')}
        </div>` : ''}
    </div>`;
  openModal();
}

function updateTicket(id, newStatus) {
  const tickets  = getTickets();
  const index    = tickets.findIndex(t => t.id === id);
  if (index === -1) return;

  const note     = document.getElementById('admin-note')?.value.trim();
  const priority = document.getElementById('update-priority')?.value;

  tickets[index].status    = newStatus;
  tickets[index].updatedAt = new Date().toISOString();
  if (priority) tickets[index].priority = priority;

  if (note) {
    tickets[index].notes.push({
      text: note,
      date: new Date().toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }

  saveTickets(tickets);
  closeModal();
  renderAdminTickets();
  updateAdminStats();
  showFlash('✅ Ticket ' + id + ' updated to ' + newStatus, '#10b981');
}

function exportTickets() {
  const tickets = getTickets();
  const headers = ['ID', 'Subject', 'Customer', 'Category', 'Priority', 'Status', 'Created'];
  const rows    = tickets.map(t => [t.id, `"${t.subject}"`, t.customerName, t.category, t.priority, t.status, formatDate(t.createdAt)]);
  const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob    = new Blob([csv], { type: 'text/csv' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = 'tickets_report.csv'; a.click();
  showFlash('📥 Report exported as CSV!', '#3b82f6');
}


// ==============================
// MODAL HELPERS
// ==============================
function openModal()  { document.getElementById('modal-overlay').classList.add('show'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('show'); }


// ==============================
// FLASH NOTIFICATION
// ==============================
function showFlash(message, color) {
  const f = document.getElementById('flash');
  f.textContent      = message;
  f.style.background = color;
  f.style.display    = 'block';
  setTimeout(() => f.style.display = 'none', 3000);
}


// ==============================
// FORMAT DATE
// ==============================
function formatDate(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}


// ==============================
// SAMPLE DATA — loads once per new customer
// ==============================
function loadSampleTickets(username, name) {
  const existing = getTickets();
  const sample = [
    {
      id: 'TKT-001', subject: 'Internet connection dropping every hour',
      category: 'Internet', priority: 'High', phone: '306-555-1234',
      description: 'My internet drops every hour for 2-3 minutes. This has been happening for 3 days.',
      status: 'In Progress', customer: username, customerName: name,
      createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
      updatedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
      notes: [{ text: 'A technician has been scheduled for tomorrow between 9AM-12PM.', date: 'Mar 4, 2026' }]
    },
    {
      id: 'TKT-002', subject: 'Incorrect charge on my February bill',
      category: 'Billing', priority: 'Medium', phone: '306-555-1234',
      description: 'I was charged $45 for a service I never requested.',
      status: 'Open', customer: username, customerName: name,
      createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
      updatedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
      notes: []
    },
  ];
  saveTickets([...sample, ...existing]);
}