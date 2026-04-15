/* ═══════════════════════════════════════════════════════
   TIP — SVTS  |  script.js
   Complete Upgraded System
═══════════════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────────
let currentRole = 'admin';
let currentSection = '';
let currentUser = null;
let editingViolationId = null;
let violationPage = 1;
const PAGE_SIZE = 8;

// ─── ACCOUNTS ────────────────────────────────────────
const ACCOUNTS = {
  admin: [
    { id: 'admin001', password: 'admin123', name: 'Admin Officer', initials: 'AO', role: 'Administrator' }
  ],
  student: [
    { id: '2512027', password: 'tip2026', name: 'Jocass Dale Tomas', initials: 'JT', role: 'Student', program: 'BSIT', year: '1st Year' }
  ]
};

// ─── NOTIFICATIONS DATA ───────────────────────────────
let notifications = [
  { id: 'N001', title: 'New Violation Recorded', msg: 'Jocass Tomas — Dress Code Violation (Minor)', time: 'April 1, 2026', read: false, role: 'admin', icon: '⚠️' },
  { id: 'N002', title: 'Pending Review', msg: 'Angelo Delos Reyes — Tardiness violation pending action', time: 'April 3, 2026', read: false, role: 'admin', icon: '🕐' },
  { id: 'N003', title: 'Case Escalated', msg: 'Juaquin Wong — Academic Dishonesty escalated to Dean', time: 'April 4, 2026', read: false, role: 'admin', icon: '🚨' },
  { id: 'N004', title: 'Violation Recorded', msg: 'Dress Code Violation — Verbal Warning issued', time: 'April 1, 2026', read: false, role: 'student', icon: '⚠️' },
  { id: 'N005', title: 'Compliance Reminder', msg: 'Ensure proper uniform compliance at all times', time: 'April 3, 2026', read: true, role: 'student', icon: '📢' },
];

// ─── VIOLATION DATA ───────────────────────────────────
let violations = JSON.parse(localStorage.getItem('svts_violations') || 'null') || [
  { id: 'VR-001', studentId: '2512027', studentName: 'Jocass Dale Tomas', program: 'BSIT', year: '1st Year', type: 'Dress Code Violation', severity: 'Minor', date: '2026-04-01', status: 'Resolved', action: 'Verbal Warning', location: 'Main Lobby', reporter: 'Security Officer', desc: 'Student was not wearing proper uniform inside the campus.', createdAt: '2026-04-01' },
  { id: 'VR-002', studentId: '2514070', studentName: 'Angelo Vin Delos Reyes', program: 'BSIT', year: '1st Year', type: 'Tardiness / Absence', severity: 'Minor', date: '2026-04-03', status: 'Pending', action: 'Written Warning', location: 'Room A207', reporter: 'Prof. Santos', desc: 'Student arrived 45 minutes late without valid excuse.', createdAt: '2026-04-03' },
  { id: 'VR-003', studentId: '2514319', studentName: 'Juaquin Wong', program: 'BSIT', year: '1st Year', type: 'Academic Dishonesty', severity: 'Major', date: '2026-04-04', status: 'Under Review', action: 'Parent Notification', location: 'Exam Hall B', reporter: 'Prof. Reyes', desc: 'Student was caught with unauthorized notes during final examination.', createdAt: '2026-04-04' },
  { id: 'VR-004', studentId: '2517285', studentName: 'Joaquin Geronimo', program: 'BSIT', year: '1st Year', type: 'Disruptive Behavior', severity: 'Moderate', date: '2026-04-05', status: 'Resolved', action: 'Written Warning', location: 'Cafeteria', reporter: 'Dean\'s Office', desc: 'Student was causing disturbance and disrupting other students.', createdAt: '2026-04-05' },
  { id: 'VR-005', studentId: '2517549', studentName: 'Art Tutor', program: 'BSIT', year: '1st Year', type: 'Property Damage', severity: 'Major', date: '2026-04-06', status: 'Escalated', action: 'Suspension', location: 'Computer Lab 3', reporter: 'Lab In-Charge', desc: 'Student intentionally damaged computer equipment in the lab.', createdAt: '2026-04-06' },
  { id: 'VR-006', studentId: '2512408', studentName: 'Grant Wong', program: 'BSIT', year: '1st Year', type: 'Tardiness / Absence', severity: 'Minor', date: '2026-03-28', status: 'Resolved', action: 'Verbal Warning', location: 'Room A215', reporter: 'Prof. Cruz', desc: 'Student was consistently late for morning classes this week.', createdAt: '2026-03-28' },
  { id: 'VR-007', studentId: '2518002', studentName: 'Maria Santos', program: 'BSIT', year: '2nd Year', type: 'Dress Code Violation', severity: 'Minor', date: '2026-04-08', status: 'Resolved', action: 'Verbal Warning', location: 'Library', reporter: 'Library Staff', desc: 'Student wearing shorts inside the library, violating dress policy.', createdAt: '2026-04-08' },
  { id: 'VR-008', studentId: '2519100', studentName: 'Luis Fernandez', program: 'BSCE', year: '1st Year', type: 'Disruptive Behavior', severity: 'Moderate', date: '2026-04-10', status: 'Pending', action: 'Verbal Warning', location: 'Room B101', reporter: 'Prof. Villanueva', desc: 'Student using mobile phone during class and disrupting lecture.', createdAt: '2026-04-10' },
];

function saveViolations() {
  localStorage.setItem('svts_violations', JSON.stringify(violations));
}

// ─── HELPERS ─────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function genId() {
  const num = violations.length + 1;
  return 'VR-' + String(num).padStart(3, '0');
}

function toast(title, msg = '', type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

function confirm(title, msg, onConfirm, type = 'warning') {
  // Simple inline confirm overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.style.zIndex = '500';
  const colors = { warning: '#e8a020', danger: '#c0392b', info: '#1e40af' };
  overlay.innerHTML = `
    <div class="modal" style="width:380px">
      <div class="modal-body" style="padding:28px;text-align:center">
        <div style="font-size:40px;margin-bottom:14px">${type === 'danger' ? '🗑️' : type === 'warning' ? '⚠️' : '💬'}</div>
        <h3 style="font-size:16px;font-weight:700;color:var(--gray-800);margin-bottom:8px">${title}</h3>
        <p style="font-size:13px;color:var(--gray-600);margin-bottom:24px">${msg}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-outline" id="cf-cancel">Cancel</button>
          <button class="btn btn-navy" id="cf-ok" style="${type === 'danger' ? 'background:var(--red)' : ''}">${type === 'danger' ? 'Delete' : 'Confirm'}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#cf-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#cf-ok').onclick = () => { overlay.remove(); onConfirm(); };
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}

// ─── BADGES ──────────────────────────────────────────
function severityBadge(s) {
  const map = { 'Major': 'badge-red', 'Moderate': 'badge-amber', 'Minor': 'badge-gray' };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

function statusBadge(s) {
  const map = {
    'Resolved': 'badge-green',
    'Escalated': 'badge-red',
    'Under Review': 'badge-amber',
    'Pending': 'badge-blue',
  };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

// ─── ICONS ───────────────────────────────────────────
const icons = {
  grid: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  'file-text': `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  users: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  'bar-chart-2': `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  bell: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  'alert-triangle': `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  settings: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

// ─── LOGIN ────────────────────────────────────────────
function setRole(role, el) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('login-user').value = role === 'admin' ? 'admin001' : '2512027';
  document.getElementById('login-pass').value = role === 'admin' ? 'admin123' : 'tip2026';
  document.getElementById('login-error').style.display = 'none';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const errEl = document.getElementById('login-error');

  if (!user || !pass) {
    errEl.textContent = 'Please enter your credentials.';
    errEl.style.display = 'block'; return;
  }

  const accountList = ACCOUNTS[currentRole] || [];
  const found = accountList.find(a => a.id === user && a.password === pass);

  if (!found) {
    errEl.textContent = 'Invalid credentials. Please try again.';
    errEl.style.display = 'block'; return;
  }

  currentUser = { ...found, role: currentRole };
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  setupApp();
}

function logout() {
  confirm('Sign Out', 'Are you sure you want to sign out?', () => {
    currentUser = null;
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
  });
}

// ─── NAV ─────────────────────────────────────────────
const adminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', badge: null },
  { id: 'violations', label: 'Violation Records', icon: 'file-text', badge: null },
  { id: 'students', label: 'Students', icon: 'users', badge: null },
  { id: 'reports', label: 'Reports', icon: 'bar-chart-2', badge: null },
  { id: 'notifications', label: 'Notifications', icon: 'bell', badge: '3' },
];

const studentNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', badge: null },
  { id: 'my-records', label: 'My Records', icon: 'file-text', badge: null },
  { id: 'report-incident', label: 'Report Incident', icon: 'alert-triangle', badge: null },
  { id: 'notifications', label: 'Notifications', icon: 'bell', badge: '2' },
  { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
];

function setupApp() {
  const nav = currentRole === 'admin' ? adminNav : studentNav;
  const u = currentUser;

  document.getElementById('sidebar-avatar').textContent = u.initials;
  document.getElementById('sidebar-name').textContent = u.name;
  document.getElementById('sidebar-role').textContent = u.role;
  document.getElementById('topbar-avatar').textContent = u.initials;

  const today = new Date();
  document.getElementById('topbar-date').textContent =
    today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  updateNotifDot();

  const navEl = document.getElementById('sidebar-nav');
  navEl.innerHTML = `<div class="nav-section-label">Menu</div>` + nav.map(item => `
    <button class="nav-item" id="nav-${item.id}" onclick="navTo('${item.id}')">
      ${icons[item.icon] || ''}
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </button>`).join('');

  navTo('dashboard');
}

function updateNotifDot() {
  const unread = notifications.filter(n => !n.read && n.role === currentRole).length;
  const dot = document.getElementById('notif-dot');
  if (dot) dot.classList.toggle('visible', unread > 0);
}

function navTo(sectionId) {
  currentSection = sectionId;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + sectionId);
  if (navBtn) navBtn.classList.add('active');

  const area = document.getElementById('content-area');
  area.innerHTML = '';
  area.classList.remove('fade-in');
  void area.offsetWidth;
  area.classList.add('fade-in');

  const renderers = {
    dashboard: currentRole === 'admin' ? renderAdminDashboard : renderStudentDashboard,
    violations: renderViolations,
    students: renderStudents,
    reports: renderReports,
    notifications: renderNotifications,
    'my-records': renderMyRecords,
    'report-incident': renderReportIncident,
    settings: renderSettings,
  };

  const titles = {
    dashboard: ['Dashboard', 'Overview & Summary'],
    violations: ['Violation Records', 'All student violations'],
    students: ['Students', 'Student directory'],
    reports: ['Reports', 'Analytics & summaries'],
    notifications: ['Notifications', 'Recent alerts'],
    'my-records': ['My Records', 'Personal discipline history'],
    'report-incident': ['Report Incident', 'Submit an incident report'],
    settings: ['Settings', 'Account & preferences'],
  };

  const [title, subtitle] = titles[sectionId] || [sectionId, ''];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-subtitle').textContent = subtitle;

  if (renderers[sectionId]) renderers[sectionId](area);
}

// ══════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════
function renderAdminDashboard(el) {
  const total = violations.length;
  const pending = violations.filter(v => v.status === 'Pending').length;
  const resolved = violations.filter(v => v.status === 'Resolved').length;
  const major = violations.filter(v => v.severity === 'Major').length;
  const resRate = Math.round((resolved / total) * 100);

  const recent = violations.slice(0, 5);
  const typeCounts = {};
  violations.forEach(v => { typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTypeCount = topTypes[0]?.[1] || 1;

  const monthCounts = [0, 0, 0, 0, 0, 0];
  const monthLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  violations.forEach(v => {
    const m = new Date(v.date).getMonth();
    const idx = [10, 11, 0, 1, 2, 3].indexOf(m);
    if (idx >= 0) monthCounts[idx]++;
  });
  const maxMonth = Math.max(...monthCounts, 1);

  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header" style="margin-bottom:0">
        <h1>Good ${getGreeting()}, ${currentUser.name.split(' ')[0]}! 👋</h1>
        <p>Here's the overview for A.Y. 2025–2026 — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <button class="btn btn-navy" onclick="openModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Violation
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">📋</div>
        <div class="stat-label">Total Records</div>
        <div class="stat-value">${total}</div>
        <div class="stat-sub">This academic year</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">⏳</div>
        <div class="stat-label">Pending Review</div>
        <div class="stat-value">${pending}</div>
        <div class="stat-sub">Requires action</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon">⚠️</div>
        <div class="stat-label">Major Violations</div>
        <div class="stat-value">${major}</div>
        <div class="stat-sub">High severity</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Resolved</div>
        <div class="stat-value">${resolved}</div>
        <div class="stat-sub">${resRate}% resolution rate</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div><h3>Recent Violations</h3><p>Latest records logged</p></div>
          <button class="btn btn-sm btn-outline" onclick="navTo('violations')">View All</button>
        </div>
        <div style="padding:0">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Violation</th><th>Severity</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recent.map(v => `
                  <tr onclick="viewViolation('${v.id}')" style="cursor:pointer">
                    <td>
                      <div style="font-weight:600;font-size:13px">${v.studentName}</div>
                      <div style="font-size:11px;color:var(--gray-400)">${v.studentId}</div>
                    </td>
                    <td style="max-width:160px">
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px">${v.type}</div>
                      <div style="font-size:11px;color:var(--gray-400)">${fmtDate(v.date)}</div>
                    </td>
                    <td>${severityBadge(v.severity)}</td>
                    <td>${statusBadge(v.status)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div><h3>Violations by Month</h3><p>Last 6 months trend</p></div>
        </div>
        <div class="card-body">
          <div class="chart-bars">
            ${monthCounts.map((c, i) => {
    const h = Math.max(Math.round((c / maxMonth) * 80), c > 0 ? 6 : 0);
    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#0b1f3a'];
    return `
                <div class="chart-bar-wrap">
                  <div class="chart-bar-val">${c}</div>
                  <div class="chart-bar" style="height:${h}px;background:${colors[i]}"></div>
                  <div class="chart-bar-label">${monthLabels[i]}</div>
                </div>`;
  }).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div><h3>Top Violation Types</h3><p>Frequency breakdown</p></div>
        </div>
        <div class="card-body" style="display:flex;gap:20px;align-items:center">
          <div style="flex:1">
            ${topTypes.map(([type, count]) => `
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:12px;color:var(--gray-600);font-weight:500">${type}</span>
                  <span style="font-size:12px;font-weight:700;color:var(--gray-800)">${count}</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar" style="width:${Math.round((count / maxTypeCount) * 100)}%;background:var(--navy)"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div><h3>Status Overview</h3><p>Current case distribution</p></div>
        </div>
        <div class="card-body" style="display:flex;align-items:center;gap:24px">
          ${renderDonut()}
          <div class="legend">
            ${[
      ['Resolved', '#34d399', violations.filter(v => v.status === 'Resolved').length],
      ['Pending', '#60a5fa', violations.filter(v => v.status === 'Pending').length],
      ['Under Review', '#fbbf24', violations.filter(v => v.status === 'Under Review').length],
      ['Escalated', '#f87171', violations.filter(v => v.status === 'Escalated').length],
    ].map(([label, color, count]) => `
              <div class="legend-item">
                <div class="legend-dot" style="background:${color}"></div>
                <span class="legend-label">${label}</span>
                <span class="legend-val">${count}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function renderDonut() {
  const total = violations.length || 1;
  const resolved = violations.filter(v => v.status === 'Resolved').length;
  const pending = violations.filter(v => v.status === 'Pending').length;
  const review = violations.filter(v => v.status === 'Under Review').length;
  const escalated = violations.filter(v => v.status === 'Escalated').length;

  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const segments = [
    { val: resolved, color: '#34d399' },
    { val: pending, color: '#60a5fa' },
    { val: review, color: '#fbbf24' },
    { val: escalated, color: '#f87171' },
  ];

  let offset = 0;
  const paths = segments.map(s => {
    const pct = s.val / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const path = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="16"
      stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`;
    offset += dash;
    return path;
  }).join('');

  const pct = Math.round((resolved / total) * 100);
  return `
    <div class="donut-wrap" style="width:120px;height:120px">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gray-100)" stroke-width="16"/>
        ${paths}
      </svg>
      <div class="donut-center">
        <div class="dv">${pct}%</div>
        <div class="dl">Resolved</div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// VIOLATIONS SECTION
// ══════════════════════════════════════════════════════
function renderViolations(el) {
  violationPage = 1;
  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header" style="margin-bottom:0">
        <h1>Violation Records</h1>
        <p>Complete log of all student violations</p>
      </div>
      <button class="btn btn-navy" onclick="openModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Violation
      </button>
    </div>
    <div class="card">
      <div style="padding:18px 22px;border-bottom:1px solid var(--gray-100)">
        <div class="search-bar">
          <div class="search-input-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" id="v-search" type="text" placeholder="Search by name, ID, or violation type..." oninput="renderViolationTable()">
          </div>
          <select class="filter-select" id="v-filter-status" onchange="renderViolationTable()">
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Under Review</option>
            <option>Escalated</option>
          </select>
          <select class="filter-select" id="v-filter-severity" onchange="renderViolationTable()">
            <option value="">All Severity</option>
            <option>Minor</option>
            <option>Moderate</option>
            <option>Major</option>
          </select>
        </div>
      </div>
      <div class="table-wrap" id="violations-table-wrap"></div>
      <div id="violations-pagination"></div>
    </div>`;

  renderViolationTable();
}

function getFilteredViolations() {
  const q = (document.getElementById('v-search')?.value || '').toLowerCase();
  const st = document.getElementById('v-filter-status')?.value || '';
  const sev = document.getElementById('v-filter-severity')?.value || '';
  return violations.filter(v => {
    const matchQ = !q || v.studentName.toLowerCase().includes(q)
      || v.studentId.toLowerCase().includes(q)
      || v.type.toLowerCase().includes(q)
      || v.id.toLowerCase().includes(q);
    const matchS = !st || v.status === st;
    const matchSv = !sev || v.severity === sev;
    return matchQ && matchS && matchSv;
  });
}

function renderViolationTable() {
  const filtered = getFilteredViolations();
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  if (violationPage > totalPages) violationPage = totalPages;
  const paged = filtered.slice((violationPage - 1) * PAGE_SIZE, violationPage * PAGE_SIZE);

  const wrap = document.getElementById('violations-table-wrap');
  const pg = document.getElementById('violations-pagination');
  if (!wrap) return;

  if (paged.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <h4>No violations found</h4>
      <p>Try adjusting your search or filters</p>
    </div>`;
    pg.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Record ID</th>
          <th>Student</th>
          <th>Program</th>
          <th>Violation Type</th>
          <th>Severity</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${paged.map(v => `
          <tr>
            <td><span class="badge badge-navy" style="font-family:'DM Mono',monospace">${v.id}</span></td>
            <td>
              <div style="font-weight:600">${v.studentName}</div>
              <div style="font-size:11px;color:var(--gray-400)">${v.studentId}</div>
            </td>
            <td><span style="font-size:12px">${v.program || '—'}</span></td>
            <td style="max-width:160px">
              <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;font-size:13px">${v.type}</div>
            </td>
            <td>${severityBadge(v.severity)}</td>
            <td style="font-size:12px;white-space:nowrap">${fmtDate(v.date)}</td>
            <td>${statusBadge(v.status)}</td>
            <td style="font-size:12px;color:var(--gray-600)">${v.action || '—'}</td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn btn-xs btn-outline btn-icon" title="View" onclick="viewViolation('${v.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn btn-xs btn-outline btn-icon" title="Edit" onclick="editViolation('${v.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                ${v.status !== 'Resolved' ? `
                <button class="btn btn-xs btn-success btn-icon" title="Mark Resolved" onclick="resolveViolation('${v.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>` : ''}
                <button class="btn btn-xs btn-danger btn-icon" title="Delete" onclick="deleteViolation('${v.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  // Pagination
  const start = (violationPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(violationPage * PAGE_SIZE, total);
  pg.innerHTML = `
    <div class="pagination">
      <span>Showing ${start}–${end} of ${total} records</span>
      <div class="pagination-btns">
        <button class="page-btn" onclick="changePage(-1)" ${violationPage <= 1 ? 'disabled' : ''}>‹</button>
        ${Array.from({ length: totalPages }, (_, i) => `<button class="page-btn ${i + 1 === violationPage ? 'active' : ''}" onclick="gotoPage(${i + 1})">${i + 1}</button>`).join('')}
        <button class="page-btn" onclick="changePage(1)" ${violationPage >= totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>`;
}

function changePage(d) { violationPage += d; renderViolationTable(); }
function gotoPage(p) { violationPage = p; renderViolationTable(); }

// ── MODAL ────────────────────────────────────────────
function openModal(id = null) {
  editingViolationId = id;
  const modal = document.getElementById('add-modal');
  const titleEl = document.getElementById('modal-title');
  const subEl = document.getElementById('modal-subtitle');
  const btnEl = document.getElementById('modal-submit-btn');

  document.getElementById('v-date').valueAsDate = new Date();

  if (id) {
    const v = violations.find(v => v.id === id);
    if (!v) return;
    titleEl.textContent = 'Edit Violation Record';
    subEl.textContent = `Editing ${v.id}`;
    btnEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Update Record`;
    document.getElementById('v-student-id').value = v.studentId;
    document.getElementById('v-student-name').value = v.studentName;
    document.getElementById('v-program').value = v.program || '';
    document.getElementById('v-year').value = v.year || '';
    document.getElementById('v-type').value = v.type;
    document.getElementById('v-severity').value = v.severity;
    document.getElementById('v-date').value = v.date;
    document.getElementById('v-location').value = v.location || '';
    document.getElementById('v-desc').value = v.desc || '';
    document.getElementById('v-reporter').value = v.reporter || '';
    document.getElementById('v-action').value = v.action || '';
  } else {
    titleEl.textContent = 'Record New Violation';
    subEl.textContent = 'Fill in all required fields accurately';
    btnEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save Violation Record`;
    ['v-student-id', 'v-student-name', 'v-program', 'v-location', 'v-desc', 'v-reporter'].forEach(i => {
      const el = document.getElementById(i); if (el) el.value = '';
    });
    ['v-type', 'v-severity', 'v-year', 'v-action'].forEach(i => {
      const el = document.getElementById(i); if (el) el.value = '';
    });
  }

  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('add-modal').classList.remove('open');
  editingViolationId = null;
}

function editViolation(id) { openModal(id); }

function submitViolation() {
  const id = document.getElementById('v-student-id').value.trim();
  const name = document.getElementById('v-student-name').value.trim();
  const type = document.getElementById('v-type').value;
  const sev = document.getElementById('v-severity').value;
  const date = document.getElementById('v-date').value;
  const location = document.getElementById('v-location').value.trim();
  const desc = document.getElementById('v-desc').value.trim();
  const reporter = document.getElementById('v-reporter').value.trim();
  const action = document.getElementById('v-action').value;
  const program = document.getElementById('v-program').value.trim();
  const year = document.getElementById('v-year').value;

  if (!id || !name || !type || !sev || !date) {
    toast('Missing Fields', 'Please fill in all required fields.', 'error');
    return;
  }

  if (editingViolationId) {
    const v = violations.find(v => v.id === editingViolationId);
    if (v) {
      Object.assign(v, { studentId: id, studentName: name, type, severity: sev, date, location, desc, reporter, action, program, year });
    }
    closeModal();
    saveViolations();
    toast('Record Updated', `${name}'s violation has been updated.`, 'success');
  } else {
    const newViolation = {
      id: genId(), studentId: id, studentName: name, type, severity: sev,
      date, status: 'Pending', action: action || 'Pending',
      location: location || 'N/A', desc, reporter, program, year,
      createdAt: new Date().toISOString().split('T')[0]
    };
    violations.unshift(newViolation);

    // Push notification
    notifications.unshift({
      id: 'N' + Date.now(),
      title: 'New Violation Recorded',
      msg: `${name} — ${type} (${sev})`,
      time: fmtDate(date),
      read: false,
      role: 'admin',
      icon: '⚠️'
    });
    updateNotifBadge();
    updateNotifDot();

    closeModal();
    saveViolations();
    toast('Violation Recorded', `${name}'s violation has been saved.`, 'success');
  }

  if (currentSection === 'violations') navTo('violations');
  else if (currentSection === 'dashboard') navTo('dashboard');
}

function resolveViolation(id) {
  const v = violations.find(v => v.id === id);
  if (!v) return;
  confirm('Mark as Resolved?', `Are you sure you want to mark "${v.type}" for ${v.studentName} as resolved?`, () => {
    v.status = 'Resolved';
    saveViolations();
    toast('Case Resolved', `${v.studentName}'s violation has been resolved.`, 'success');
    if (currentSection === 'violations') renderViolationTable();
    else navTo('dashboard');
  });
}

function deleteViolation(id) {
  const v = violations.find(v => v.id === id);
  if (!v) return;
  confirm('Delete Record?', `Permanently delete violation record <strong>${v.id}</strong> for ${v.studentName}? This cannot be undone.`, () => {
    violations = violations.filter(v => v.id !== id);
    saveViolations();
    toast('Record Deleted', `${v.id} has been removed.`, 'warning');
    renderViolationTable();
  }, 'danger');
}

function updateNotifBadge() {
  const count = notifications.filter(n => !n.read && n.role === currentRole).length;
  const btn = document.getElementById('nav-notifications');
  if (!btn) return;
  let badge = btn.querySelector('.nav-badge');
  if (count > 0) {
    if (!badge) { badge = document.createElement('span'); badge.className = 'nav-badge'; btn.appendChild(badge); }
    badge.textContent = count;
  } else {
    if (badge) badge.remove();
  }
}

// ── VIEW MODAL ───────────────────────────────────────
function viewViolation(id) {
  const v = violations.find(v => v.id === id);
  if (!v) return;

  document.getElementById('view-modal-id').textContent = v.id;
  document.getElementById('view-modal-body').innerHTML = `
    <div style="background:linear-gradient(135deg,var(--navy),var(--navy-light));border-radius:10px;padding:16px 20px;color:white;margin-bottom:20px">
      <div style="font-size:13px;opacity:0.6;margin-bottom:4px">Student</div>
      <div style="font-size:17px;font-weight:700">${v.studentName}</div>
      <div style="font-size:12px;opacity:0.6;margin-top:2px">${v.studentId} ${v.program ? '· ' + v.program : ''} ${v.year ? '· ' + v.year : ''}</div>
    </div>
    <div class="detail-grid">
      <div class="detail-item">
        <label>Violation Type</label>
        <p>${v.type}</p>
      </div>
      <div class="detail-item">
        <label>Severity</label>
        <p>${severityBadge(v.severity)}</p>
      </div>
      <div class="detail-item">
        <label>Date</label>
        <p>${fmtDate(v.date)}</p>
      </div>
      <div class="detail-item">
        <label>Location</label>
        <p>${v.location || '—'}</p>
      </div>
      <div class="detail-item">
        <label>Status</label>
        <p>${statusBadge(v.status)}</p>
      </div>
      <div class="detail-item">
        <label>Action Taken</label>
        <p>${v.action || '—'}</p>
      </div>
      <div class="detail-item">
        <label>Reported By</label>
        <p>${v.reporter || '—'}</p>
      </div>
      <div class="detail-item">
        <label>Recorded On</label>
        <p>${fmtDate(v.createdAt)}</p>
      </div>
      ${v.desc ? `<div class="detail-item detail-full"><label>Description</label><p style="color:var(--gray-600);line-height:1.6">${v.desc}</p></div>` : ''}
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeViewModal()">Close</button>
      <button class="btn btn-outline" onclick="closeViewModal();editViolation('${v.id}')">Edit Record</button>
      ${v.status !== 'Resolved' ? `<button class="btn btn-success" onclick="closeViewModal();resolveViolation('${v.id}')">Mark Resolved</button>` : ''}
    </div>`;

  document.getElementById('view-modal').classList.add('open');
}

function closeViewModal() {
  document.getElementById('view-modal').classList.remove('open');
}

// ══════════════════════════════════════════════════════
// STUDENTS SECTION
// ══════════════════════════════════════════════════════
function renderStudents(el) {
  // Build unique students from violations
  const studentMap = {};
  violations.forEach(v => {
    if (!studentMap[v.studentId]) {
      studentMap[v.studentId] = {
        id: v.studentId, name: v.studentName,
        program: v.program || '—', year: v.year || '—',
        violations: [], initials: v.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
    }
    studentMap[v.studentId].violations.push(v);
  });
  const students = Object.values(studentMap);

  el.innerHTML = `
    <div class="page-header">
      <h1>Student Directory</h1>
      <p>${students.length} students with violation records</p>
    </div>
    <div class="card">
      <div style="padding:16px 22px;border-bottom:1px solid var(--gray-100)">
        <div class="search-bar">
          <div class="search-input-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" id="s-search" type="text" placeholder="Search by name or student ID..." oninput="filterStudents()">
          </div>
        </div>
      </div>
      <div class="table-wrap" id="students-table">
        ${renderStudentsTable(students)}
      </div>
    </div>`;
}

function renderStudentsTable(students) {
  if (!students.length) return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    <h4>No students found</h4><p>Try adjusting your search</p>
  </div>`;

  return `<table>
    <thead>
      <tr><th>Student</th><th>ID</th><th>Program</th><th>Year</th><th>Violations</th><th>Status</th><th></th></tr>
    </thead>
    <tbody>
      ${students.map(s => {
    const major = s.violations.filter(v => v.severity === 'Major').length;
    const pending = s.violations.filter(v => v.status === 'Pending').length;
    const standing = major >= 2 ? 'danger' : pending > 1 ? 'warn' : 'good';
    const standingLabel = { good: 'Good Standing', warn: 'At Risk', danger: 'Critical' }[standing];
    return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:50%;background:var(--navy);color:var(--gold-light);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">${s.initials}</div>
              <div>
                <div style="font-weight:600;font-size:13px">${s.name}</div>
              </div>
            </div>
          </td>
          <td style="font-family:'DM Mono',monospace;font-size:12px">${s.id}</td>
          <td style="font-size:13px">${s.program}</td>
          <td style="font-size:13px">${s.year}</td>
          <td><span class="badge badge-navy" style="font-family:'DM Mono'">${s.violations.length}</span></td>
          <td>
            <span class="badge ${standing === 'good' ? 'badge-green' : standing === 'warn' ? 'badge-amber' : 'badge-red'}">${standingLabel}</span>
          </td>
          <td>
            <button class="btn btn-xs btn-outline" onclick="viewStudentRecord('${s.id}')">View Records</button>
          </td>
        </tr>`;
  }).join('')}
    </tbody>
  </table>`;
}

function filterStudents() {
  const q = document.getElementById('s-search').value.toLowerCase();
  const studentMap = {};
  violations.forEach(v => {
    if (!studentMap[v.studentId]) {
      studentMap[v.studentId] = {
        id: v.studentId, name: v.studentName, program: v.program || '—', year: v.year || '—',
        violations: [], initials: v.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
    }
    studentMap[v.studentId].violations.push(v);
  });
  const all = Object.values(studentMap);
  const filtered = !q ? all : all.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  document.getElementById('students-table').innerHTML = renderStudentsTable(filtered);
}

function viewStudentRecord(studentId) {
  navTo('violations');
  setTimeout(() => {
    const s = document.getElementById('v-search');
    if (s) { s.value = studentId; renderViolationTable(); }
  }, 60);
}

// ══════════════════════════════════════════════════════
// REPORTS SECTION
// ══════════════════════════════════════════════════════
function renderReports(el) {
  const total = violations.length;
  const resolved = violations.filter(v => v.status === 'Resolved').length;
  const major = violations.filter(v => v.severity === 'Major').length;
  const moderate = violations.filter(v => v.severity === 'Moderate').length;
  const minor = violations.filter(v => v.severity === 'Minor').length;
  const pending = violations.filter(v => v.status === 'Pending').length;

  const programs = {};
  violations.forEach(v => { const p = v.program || 'Unknown'; programs[p] = (programs[p] || 0) + 1; });
  const topPrograms = Object.entries(programs).sort((a, b) => b[1] - a[1]);
  const maxProg = topPrograms[0]?.[1] || 1;

  el.innerHTML = `
    <div class="page-header">
      <h1>Analytics & Reports</h1>
      <p>Summary of violations for A.Y. 2025–2026</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Total Violations</div>
        <div class="stat-value">${total}</div>
        <div class="stat-sub">All records</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Resolution Rate</div>
        <div class="stat-value">${Math.round((resolved / total) * 100)}%</div>
        <div class="stat-sub">${resolved} of ${total} resolved</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">🚨</div>
        <div class="stat-label">Major Violations</div>
        <div class="stat-value">${major}</div>
        <div class="stat-sub">${Math.round((major / total) * 100)}% of total</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon">⏳</div>
        <div class="stat-label">Pending Cases</div>
        <div class="stat-value">${pending}</div>
        <div class="stat-sub">Awaiting resolution</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div><h3>Severity Breakdown</h3></div></div>
        <div class="card-body">
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600;color:var(--red)">Major</span>
              <span style="font-size:13px;font-weight:700">${major}</span>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((major / total) * 100)}%;background:var(--red)"></div></div>
          </div>
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600;color:var(--amber)">Moderate</span>
              <span style="font-size:13px;font-weight:700">${moderate}</span>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((moderate / total) * 100)}%;background:#fbbf24"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600;color:var(--gray-600)">Minor</span>
              <span style="font-size:13px;font-weight:700">${minor}</span>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((minor / total) * 100)}%;background:var(--gray-400)"></div></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div><h3>By Program</h3><p>Violations per course</p></div></div>
        <div class="card-body">
          ${topPrograms.map(([prog, count]) => `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                <span style="font-size:12px;font-weight:600;color:var(--gray-600)">${prog}</span>
                <span style="font-size:12px;font-weight:700">${count}</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar" style="width:${Math.round((count / maxProg) * 100)}%;background:var(--navy)"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><h3>Violations Summary Table</h3><p>Quick overview of all violation types</p></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Violation Type</th><th>Count</th><th>Major</th><th>Resolved</th><th>Rate</th></tr>
          </thead>
          <tbody>
            ${Object.entries((() => {
    const map = {};
    violations.forEach(v => {
      if (!map[v.type]) map[v.type] = { total: 0, major: 0, resolved: 0 };
      map[v.type].total++;
      if (v.severity === 'Major') map[v.type].major++;
      if (v.status === 'Resolved') map[v.type].resolved++;
    });
    return map;
  })()).sort((a, b) => b[1].total - a[1].total).map(([type, d]) => `
              <tr>
                <td style="font-weight:600">${type}</td>
                <td><span class="badge badge-navy" style="font-family:'DM Mono'">${d.total}</span></td>
                <td>${d.major > 0 ? `<span class="badge badge-red">${d.major}</span>` : '<span style="color:var(--gray-300)">—</span>'}</td>
                <td><span class="badge badge-green">${d.resolved}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar-wrap" style="width:80px">
                      <div class="progress-bar" style="width:${Math.round((d.resolved / d.total) * 100)}%;background:var(--green)"></div>
                    </div>
                    <span style="font-size:11px;font-family:'DM Mono'">${Math.round((d.resolved / d.total) * 100)}%</span>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════
function renderNotifications(el) {
  const mine = notifications.filter(n => n.role === currentRole);
  const unread = mine.filter(n => !n.read).length;

  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header" style="margin-bottom:0">
        <h1>Notifications</h1>
        <p>${unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
      </div>
      ${unread > 0 ? `<button class="btn btn-outline" onclick="markAllRead()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Mark All as Read
      </button>` : ''}
    </div>

    <div id="notif-list">
      ${mine.length === 0 ? `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <h4>No notifications</h4><p>You're all caught up!</p>
      </div>` : mine.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markRead('${n.id}')">
          <div class="notif-icon">${n.icon}</div>
          <div class="notif-text" style="flex:1">
            <h4>${n.title}</h4>
            <p>${n.msg}</p>
            <div class="notif-time">${n.time}</div>
          </div>
          ${!n.read ? '<div class="unread-dot"></div>' : ''}
        </div>`).join('')}
    </div>`;
}

function markRead(id) {
  const n = notifications.find(n => n.id === id);
  if (n && !n.read) {
    n.read = true;
    updateNotifBadge();
    updateNotifDot();
    navTo('notifications');
  }
}

function markAllRead() {
  notifications.forEach(n => { if (n.role === currentRole) n.read = true; });
  updateNotifBadge();
  updateNotifDot();
  navTo('notifications');
  toast('All Read', 'All notifications marked as read.', 'success');
}

// ══════════════════════════════════════════════════════
// STUDENT: MY RECORDS
// ══════════════════════════════════════════════════════
function renderMyRecords(el) {
  const myV = violations.filter(v => v.studentId === currentUser.id);
  const resolved = myV.filter(v => v.status === 'Resolved').length;
  const pending = myV.filter(v => v.status === 'Pending').length;
  const major = myV.filter(v => v.severity === 'Major').length;
  const standing = major >= 2 ? 'danger' : pending > 0 ? 'warn' : 'good';

  el.innerHTML = `
    <div class="page-header">
      <h1>My Violation Records</h1>
      <p>Your complete discipline history at TIP</p>
    </div>

    <div class="student-profile-card">
      <div class="profile-row">
        <div class="profile-avatar">${currentUser.initials}</div>
        <div class="profile-info">
          <h3>${currentUser.name}</h3>
          <p>${currentUser.id} · ${currentUser.program || 'BSIT'} · ${currentUser.year || '1st Year'}</p>
          <div class="profile-badge">🎓 Technological Institute of the Philippines</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="p-stat"><div class="val">${myV.length}</div><div class="lbl">Total</div></div>
        <div class="p-stat"><div class="val">${resolved}</div><div class="lbl">Resolved</div></div>
        <div class="p-stat"><div class="val">${pending}</div><div class="lbl">Pending</div></div>
      </div>
    </div>

    <div class="standing-card ${standing}" style="margin-bottom:20px">
      <div class="standing-icon">${standing === 'good' ? '✅' : standing === 'warn' ? '⚠️' : '🚨'}</div>
      <div>
        <h4>${standing === 'good' ? 'Good Standing' : standing === 'warn' ? 'At Risk' : 'Critical Standing'}</h4>
        <p>${standing === 'good' ? 'No current issues. Keep up the good work!' : standing === 'warn' ? 'You have pending violations. Please address them.' : 'You have major violations. Please see the disciplinary office.'}</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Violation Timeline</h3></div>
      <div class="card-body">
        ${myV.length === 0 ? `<div class="empty-state"><h4>No violations recorded</h4><p>You have a clean record!</p></div>` :
      `<div class="timeline">
            ${myV.map(v => {
        const dotClass = v.severity === 'Major' ? 'dot-red' : v.severity === 'Moderate' ? 'dot-amber' : 'dot-blue';
        const letter = v.type[0];
        return `
                <div class="timeline-item">
                  <div class="timeline-dot ${dotClass}">${letter}</div>
                  <div class="timeline-content">
                    <h4>${v.type}</h4>
                    <p>${v.desc || v.location}</p>
                    <div class="meta">
                      <span>📅 ${fmtDate(v.date)}</span>
                      <span>📍 ${v.location}</span>
                      <span>${statusBadge(v.status)}</span>
                      <span>${severityBadge(v.severity)}</span>
                    </div>
                  </div>
                </div>`;
      }).join('')}
          </div>`}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// STUDENT: DASHBOARD
// ══════════════════════════════════════════════════════
function renderStudentDashboard(el) {
  const myV = violations.filter(v => v.studentId === currentUser.id);
  const resolved = myV.filter(v => v.status === 'Resolved').length;
  const pending = myV.filter(v => v.status === 'Pending').length;
  const major = myV.filter(v => v.severity === 'Major').length;
  const standing = major >= 2 ? 'danger' : pending > 0 ? 'warn' : 'good';
  const myNotifs = notifications.filter(n => n.role === 'student' && !n.read);

  el.innerHTML = `
    <div class="page-header">
      <h1>Welcome, ${currentUser.name.split(' ')[0]}! 👋</h1>
      <p>Your discipline status at Technological Institute of the Philippines</p>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card amber">
        <div class="stat-icon">📋</div>
        <div class="stat-label">Total Violations</div>
        <div class="stat-value">${myV.length}</div>
        <div class="stat-sub">This academic year</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Resolved</div>
        <div class="stat-value">${resolved}</div>
        <div class="stat-sub">${myV.length ? Math.round((resolved / myV.length) * 100) : 0}% resolved</div>
      </div>
      <div class="stat-card ${standing === 'good' ? 'green' : standing === 'warn' ? 'amber' : 'red'}">
        <div class="stat-icon">${standing === 'good' ? '🌟' : standing === 'warn' ? '⚠️' : '🚨'}</div>
        <div class="stat-label">Standing</div>
        <div class="stat-value" style="font-size:18px">${standing === 'good' ? 'Good' : standing === 'warn' ? 'At Risk' : 'Critical'}</div>
        <div class="stat-sub">${standing === 'good' ? 'No issues' : 'Needs attention'}</div>
      </div>
    </div>

    <div class="standing-card ${standing}" style="margin-bottom:20px">
      <div class="standing-icon">${standing === 'good' ? '🎓' : standing === 'warn' ? '⚠️' : '🚨'}</div>
      <div>
        <h4>${standing === 'good' ? 'You\'re in Good Standing!' : standing === 'warn' ? 'You Have Pending Violations' : 'Critical — Immediate Action Required'}</h4>
        <p>${standing === 'good' ? 'Keep following TIP\'s code of conduct. You have no unresolved violations.' : standing === 'warn' ? 'Please coordinate with the disciplinary office to resolve your pending cases.' : 'You have major violations. Report to the Discipline Office immediately.'}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div><h3>My Recent Violations</h3></div>
          <button class="btn btn-sm btn-outline" onclick="navTo('my-records')">View All</button>
        </div>
        <div style="padding:0">
          ${myV.length === 0 ? `<div class="empty-state"><h4>No violations</h4><p>Clean record — keep it up!</p></div>` :
      `<div class="table-wrap"><table>
            <thead><tr><th>Type</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              ${myV.slice(0, 4).map(v => `
                <tr>
                  <td style="font-size:13px">${v.type}</td>
                  <td style="font-size:12px;color:var(--gray-400)">${fmtDate(v.date)}</td>
                  <td>${statusBadge(v.status)}</td>
                </tr>`).join('')}
            </tbody>
          </table></div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div><h3>Notifications</h3></div>
          ${myNotifs.length > 0 ? `<span class="badge badge-blue">${myNotifs.length} unread</span>` : ''}
        </div>
        <div class="card-body">
          ${notifications.filter(n => n.role === 'student').slice(0, 3).map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" style="margin-bottom:8px" onclick="navTo('notifications')">
              <div class="notif-icon">${n.icon}</div>
              <div class="notif-text">
                <h4>${n.title}</h4>
                <p>${n.msg}</p>
                <div class="notif-time">${n.time}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// REPORT INCIDENT (STUDENT)
// ══════════════════════════════════════════════════════
function renderReportIncident(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1>Report an Incident</h1>
      <p>Submit a confidential incident report to the Discipline Office</p>
    </div>

    <div class="grid-2" style="grid-template-columns:2fr 1fr">
      <div class="report-form-card">
        <div class="report-form-header">
          <h3>Incident Report Form</h3>
          <p>All information provided is kept confidential</p>
        </div>
        <div class="report-form-body">
          <div class="form-grid">
            <div class="field">
              <label>Incident Type <span class="required">*</span></label>
              <select id="ri-type">
                <option value="">Select type...</option>
                <option>Harassment / Bullying</option>
                <option>Property Theft</option>
                <option>Physical Altercation</option>
                <option>Unsafe Condition</option>
                <option>Academic Misconduct</option>
                <option>Unauthorized Entry</option>
                <option>Other</option>
              </select>
            </div>
            <div class="field">
              <label>Date of Incident <span class="required">*</span></label>
              <input type="date" id="ri-date">
            </div>
            <div class="field">
              <label>Time of Incident</label>
              <input type="time" id="ri-time">
            </div>
            <div class="field">
              <label>Location <span class="required">*</span></label>
              <input type="text" id="ri-location" placeholder="e.g. Room 301, Library">
            </div>
            <div class="field form-full">
              <label>Description <span class="required">*</span></label>
              <textarea id="ri-desc" style="min-height:100px" placeholder="Describe the incident in detail. Include who was involved and what happened..."></textarea>
            </div>
            <div class="field form-full">
              <label>Persons Involved (if known)</label>
              <input type="text" id="ri-persons" placeholder="Names or student IDs of persons involved">
            </div>
          </div>
          <div style="margin-top:14px">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--gray-600);cursor:pointer">
              <input type="checkbox" id="ri-anon">
              <span>Submit anonymously (your name will not be disclosed)</span>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn btn-outline" onclick="clearReportForm()">Clear Form</button>
            <button class="btn btn-navy" onclick="submitReport()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Submit Report
            </button>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-header"><h3>ℹ️ Guidelines</h3></div>
          <div class="card-body" style="font-size:13px;color:var(--gray-600);line-height:1.7">
            <p style="margin-bottom:8px">• Be factual and specific in your report</p>
            <p style="margin-bottom:8px">• Reports are reviewed within 24–48 hours</p>
            <p style="margin-bottom:8px">• False reports may result in disciplinary action</p>
            <p style="margin-bottom:8px">• Anonymous reports are still confidential</p>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('ri-date').valueAsDate = new Date();
}

function clearReportForm() {
  ['ri-type', 'ri-location', 'ri-desc', 'ri-persons'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('ri-date').valueAsDate = new Date();
  document.getElementById('ri-time').value = '';
  document.getElementById('ri-anon').checked = false;
}

function submitReport() {
  const type = document.getElementById('ri-type').value;
  const date = document.getElementById('ri-date').value;
  const location = document.getElementById('ri-location').value.trim();
  const desc = document.getElementById('ri-desc').value.trim();

  if (!type || !date || !location || !desc) {
    toast('Missing Fields', 'Please fill in all required fields.', 'error');
    return;
  }

  confirm('Submit Report?', 'Make sure all details are correct before submitting.', () => {
    // Push a notification to admin
    notifications.unshift({
      id: 'N' + Date.now(),
      title: 'Student Incident Report',
      msg: `${currentUser.name} reported: ${type} at ${location}`,
      time: fmtDate(date),
      read: false,
      role: 'admin',
      icon: '📝'
    });

    toast('Report Submitted!', 'The Discipline Office will review your report within 24 hours.', 'success');
    clearReportForm();
  });
}

// ══════════════════════════════════════════════════════
// SETTINGS (STUDENT)
// ══════════════════════════════════════════════════════
function renderSettings(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1>Settings</h1>
      <p>Manage your account preferences</p>
    </div>

    <div style="max-width:560px">
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><h3>Account Information</h3></div>
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div style="width:60px;height:60px;border-radius:50%;background:var(--navy);border:3px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--gold-light)">${currentUser.initials}</div>
            <div>
              <div style="font-weight:700;font-size:16px">${currentUser.name}</div>
              <div style="font-size:13px;color:var(--gray-400)">${currentUser.id}</div>
              <div style="font-size:12px;color:var(--gray-400);margin-top:2px">${currentUser.program || 'BSIT'} · ${currentUser.year || '1st Year'}</div>
            </div>
          </div>
          <div class="form-grid" style="grid-template-columns:1fr">
            <div class="field">
              <label>Email Address</label>
              <input type="email" value="${currentUser.id}@tip.edu.ph" readonly style="background:var(--gray-50)">
            </div>
            <div class="field">
              <label>Campus</label>
              <input type="text" value="TIP Manila" readonly style="background:var(--gray-50)">
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><h3>Notification Preferences</h3></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
          ${[
      ['Violation alerts', true],
      ['Compliance reminders', true],
      ['Status updates', true],
    ].map(([label, checked]) => `
            <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <span style="font-size:13px;color:var(--gray-700)">${label}</span>
              <input type="checkbox" ${checked ? 'checked' : ''}>
            </label>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Security</h3></div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--gray-600);margin-bottom:14px">For account security concerns, contact the Registrar's Office or IT Help Desk.</p>
          <button class="btn btn-outline" onclick="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>`;
}

// ─── CLOSE MODALS ON BACKDROP ───────────────────────
document.getElementById('add-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
document.getElementById('view-modal').addEventListener('click', function (e) { if (e.target === this) closeViewModal(); });

// ─── KEYBOARD SHORTCUTS ─────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeViewModal(); }
});

/* ══════════════════════════════════════
   MOBILE SIDEBAR TOGGLE
══════════════════════════════════════ */
function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('sidebar-open');
  }
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.classList.remove('sidebar-open');
}

/* Close mobile sidebar whenever a nav item is clicked */
(function patchNavClicks() {
  document.addEventListener('click', function (e) {
    const navBtn = e.target.closest('.nav-item');
    if (navBtn && window.innerWidth <= 768) {
      closeMobileSidebar();
    }
  });
})();
