/* ============================================================
   BlazePlus — static portfolio demo engine
   Converted from the original PHP/MySQL app.

   Persistence model (deliberate):
   - App state (who's logged in, the directory, admin queue,
     transfers, contact requests, complaints) lives in
     localStorage, namespaced under bp_*, so the demo behaves
     like a real app while you click around.
   - Chat & announcement MESSAGES are never written to storage —
     they live only in a page-level JS array, so they disappear
     the moment you refresh (this mirrors the "live demo" chat
     the client asked for).
   - Use Demo.resetAll() (linked from the login footer) to wipe
     the demo back to its seeded state at any time.
   ============================================================ */
(function (global) {
  const KEYS = {
    users: 'bp_users',
    unverified: 'bp_unverified',
    banned: 'bp_banned',
    transfers: 'bp_transfers',
    contactRequests: 'bp_contact_requests',
    complaints: 'bp_complaints',
    session: 'bp_session',
    adminSession: 'bp_admin_session',
    seeded: 'bp_seeded_v1'
  };

  const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Sales', 'Operations', 'Marketing'];
  const ROLES = ['employee', 'manager', 'senior'];
  const ADMIN = { username: 'admin', password: 'Admin@123', name: 'Aman' };

  const SEED_USERS = [
    { id: 1, name: 'Karan Mehta', email: 'karan.mehta@blazeplus.demo', phone: '9876543210', password: 'demo123', emp_no: 'IT-1001', dob: '1988-04-12', department: 'IT', role: 'manager', hide_contact: 0, hide_email: 0 },
    { id: 2, name: 'Riya Nair', email: 'riya.nair@blazeplus.demo', phone: '9876543211', password: 'demo123', emp_no: 'IT-1002', dob: '1996-09-03', department: 'IT', role: 'employee', hide_contact: 1, hide_email: 0 },
    { id: 3, name: 'John Dsouza', email: 'john.dsouza@blazeplus.demo', phone: '9876543212', password: 'demo123', emp_no: 'IT-1003', dob: '1994-01-22', department: 'IT', role: 'employee', hide_contact: 0, hide_email: 0 },
    { id: 4, name: 'Priya Singh', email: 'priya.singh@blazeplus.demo', phone: '9876543213', password: 'demo123', emp_no: 'HR-2001', dob: '1985-07-18', department: 'HR', role: 'manager', hide_contact: 0, hide_email: 1 },
    { id: 5, name: 'Ayesha Khan', email: 'ayesha.khan@blazeplus.demo', phone: '9876543214', password: 'demo123', emp_no: 'HR-2002', dob: '1998-11-05', department: 'HR', role: 'employee', hide_contact: 0, hide_email: 0 },
    { id: 6, name: 'Neha Gupta', email: 'neha.gupta@blazeplus.demo', phone: '9876543215', password: 'demo123', emp_no: 'FIN-3001', dob: '1987-03-29', department: 'Finance', role: 'manager', hide_contact: 0, hide_email: 0 },
    { id: 7, name: 'Vikram Rao', email: 'vikram.rao@blazeplus.demo', phone: '9876543216', password: 'demo123', emp_no: 'FIN-3002', dob: '1995-06-14', department: 'Finance', role: 'employee', hide_contact: 1, hide_email: 1 },
    { id: 8, name: 'Simran Kaur', email: 'simran.kaur@blazeplus.demo', phone: '9876543217', password: 'demo123', emp_no: 'SAL-4001', dob: '1990-02-08', department: 'Sales', role: 'manager', hide_contact: 0, hide_email: 0 },
    { id: 9, name: 'Arjun Sharma', email: 'arjun.sharma@blazeplus.demo', phone: '9876543218', password: 'demo123', emp_no: 'SAL-4002', dob: '1997-12-30', department: 'Sales', role: 'employee', hide_contact: 0, hide_email: 0 },
    { id: 10, name: 'Meera Iyer', email: 'meera.iyer@blazeplus.demo', phone: '9876543219', password: 'demo123', emp_no: 'OPS-5001', dob: '1989-08-17', department: 'Operations', role: 'manager', hide_contact: 0, hide_email: 0 },
    { id: 11, name: 'Farhan Ali', email: 'farhan.ali@blazeplus.demo', phone: '9876543220', password: 'demo123', emp_no: 'OPS-5002', dob: '1993-05-25', department: 'Operations', role: 'employee', hide_contact: 1, hide_email: 0 },
    { id: 12, name: 'Ananya Das', email: 'ananya.das@blazeplus.demo', phone: '9876543221', password: 'demo123', emp_no: 'MKT-6001', dob: '1991-10-09', department: 'Marketing', role: 'manager', hide_contact: 0, hide_email: 0 },
    { id: 13, name: 'Kabir Malhotra', email: 'kabir.malhotra@blazeplus.demo', phone: '9876543222', password: 'demo123', emp_no: 'MKT-6002', dob: '1999-01-15', department: 'Marketing', role: 'employee', hide_contact: 0, hide_email: 0 },
    { id: 14, name: 'Rajesh Kumar', email: 'rajesh.kumar@blazeplus.demo', phone: '9876543223', password: 'demo123', emp_no: 'IT-1004', dob: '1980-06-21', department: 'IT', role: 'senior', hide_contact: 1, hide_email: 0 },
    { id: 15, name: 'Sunita Verma', email: 'sunita.verma@blazeplus.demo', phone: '9876543224', password: 'demo123', emp_no: 'HR-2003', dob: '1982-09-11', department: 'HR', role: 'senior', hide_contact: 0, hide_email: 1 }
  ];

  const SEED_UNVERIFIED = [
    { id: 101, name: 'Test Applicant', email: 'test.applicant@blazeplus.demo', phone: '9998887777', password: 'demo123', emp_no: 'MKT-6099', dob: '2000-03-03', department: 'Marketing', role: 'employee', verify_submitted_at: new Date(Date.now() - 6 * 60000).toISOString() }
  ];

  const SEED_BANNED = [
    { name: 'Old Test', email: 'banned.demo@blazeplus.demo', phone: '9990000000', reason: 'unknown identity', banned_at: new Date(Date.now() - 86400000).toISOString() }
  ];

  const SEED_TRANSFERS = [
    { id: 201, user_id: 9, name: 'Arjun Sharma', emp_no: 'SAL-4002', current_department: 'Sales', current_role: 'employee', requested_department: 'Marketing', requested_role: 'employee', reason: 'Want to move closer to brand/campaign work.', status: 'pending', requested_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 202, user_id: 10, name: 'Meera Iyer', emp_no: 'OPS-5001', current_department: 'Operations', current_role: 'manager', requested_department: 'Operations', requested_role: 'senior', reason: 'Taking on cross-department process ownership.', status: 'approved', requested_at: new Date(Date.now() - 10 * 86400000).toISOString() }
  ];

  const SEED_COMPLAINTS = [
    { id: 301, message_type: 'chat', room_key: 'general', reporter_id: 2, reported_user_id: 3, reporter_name: 'Riya Nair', reporter_emp_no: 'IT-1002', reported_name: 'John Dsouza', reported_emp_no: 'IT-1003', message_text: 'That deploy joke was not okay.', image_path: null, pdf_path: null, reason: 'Inappropriate humor in a work channel.', status: 'open', reported_at: new Date(Date.now() - 2 * 86400000).toISOString() }
  ];

  // ---- low-level storage helpers ----
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function seedIfNeeded() {
    if (localStorage.getItem(KEYS.seeded)) return;
    write(KEYS.users, SEED_USERS);
    write(KEYS.unverified, SEED_UNVERIFIED);
    write(KEYS.banned, SEED_BANNED);
    write(KEYS.transfers, SEED_TRANSFERS);
    write(KEYS.contactRequests, []);
    write(KEYS.complaints, SEED_COMPLAINTS);
    localStorage.setItem(KEYS.seeded, '1');
  }

  function resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    seedIfNeeded();
  }

  // ---- data access ----
  function getUsers() { return read(KEYS.users, []); }
  function saveUsers(u) { write(KEYS.users, u); }
  function getUnverified() { return read(KEYS.unverified, []); }
  function saveUnverified(u) { write(KEYS.unverified, u); }
  function getBanned() { return read(KEYS.banned, []); }
  function saveBanned(b) { write(KEYS.banned, b); }
  function getTransfers() { return read(KEYS.transfers, []); }
  function saveTransfers(t) { write(KEYS.transfers, t); }
  function getContactRequests() { return read(KEYS.contactRequests, []); }
  function saveContactRequests(c) { write(KEYS.contactRequests, c); }
  function getComplaints() { return read(KEYS.complaints, []); }
  function saveComplaints(c) { write(KEYS.complaints, c); }

  function nextId(list) {
    return list.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
  }

  // ---- session ----
  function getSession() { return read(KEYS.session, null); }
  function setSession(s) { write(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function getAdminSession() { return read(KEYS.adminSession, null); }
  function setAdminSession(s) { write(KEYS.adminSession, s); }
  function clearAdminSession() { localStorage.removeItem(KEYS.adminSession); }

  function getCurrentUser() {
    const s = getSession();
    if (!s || s.type !== 'user') return null;
    return getUsers().find(u => u.id === s.userId) || null;
  }

  // ---- path helpers (so pages work whether at root or /admin/) ----
  function inAdmin() { return location.pathname.indexOf('/admin/') !== -1; }
  function root(path) { return (inAdmin() ? '../' : '') + path; }

  // ---- guards ----
  function requireUser() {
    const me = getCurrentUser();
    if (!me) { location.href = root('login.html'); return null; }
    return me;
  }
  function requireUnverified() {
    const s = getSession();
    if (!s || s.type !== 'unverified') { location.href = root('login.html'); return null; }
    const row = getUnverified().find(u => u.id === s.unverifiedId);
    if (!row) { location.href = root('login.html'); return null; }
    return row;
  }
  function requireAdmin() {
    const s = getAdminSession();
    if (!s) { location.href = 'login.html'; return null; }
    return s;
  }

  // ---- visibility rules (ported from fieldVisible() in index.php/profile.php) ----
  function fieldVisible(viewer, target, field, approvedGrants) {
    const hideCol = field === 'phone' ? 'hide_contact' : 'hide_email';
    if (viewer.role === 'employee' && ['manager', 'senior'].includes(target.role) && target.id !== viewer.id) {
      const grant = approvedGrants[target.id];
      return grant === 'both' || grant === field;
    }
    if (target.id === viewer.id) return true;
    if (!target[hideCol]) return true;
    if (target.role === 'employee' && viewer.role === 'employee') return false;
    if (target.role === 'senior' && viewer.role === 'senior') return false;
    return true;
  }

  function approvedGrantsFor(requesterId) {
    const grants = {};
    getContactRequests()
      .filter(r => r.requester_id === requesterId && r.status === 'approved')
      .forEach(r => { grants[r.target_id] = r.shared_field; });
    return grants;
  }

  // ---- directory visibility (ported from index.php) ----
  function visibleEmployeesFor(me) {
    const users = getUsers();
    let list;
    if (me.role === 'employee') {
      list = [
        ...users.filter(u => u.role === 'employee'),
        ...users.filter(u => u.role === 'manager' && u.department === me.department)
      ];
    } else {
      const visibleRoles = me.role === 'manager' ? ['employee', 'manager'] : ['employee', 'manager', 'senior'];
      list = users.filter(u => visibleRoles.includes(u.role));
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function slugify(dept) { return dept.toLowerCase().replace(/\s+/g, '_'); }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ---- shared sidebar (was duplicated across every PHP page) ----
  function renderSidebar(me, activeFile) {
    const deptSlug = slugify(me.department);
    const roomFile = deptSlug + '.html';
    const annFile = deptSlug + '_announcements.html';
    const item = (href, label, key) =>
      `<a href="${root(href)}" class="nav-item${activeFile === key ? ' active' : ''}"><span class="label">${label}</span></a>`;
    return `
      <div>
        <div class="brand">Blaze<span>Plus</span></div>
        <div class="nav-section-label">Workspace</div>
        ${item('index.html', 'Directory', 'index')}
        ${item('transfer.html', 'Transfers', 'transfer')}
        <div class="nav-section-label">Rooms · ${escapeHtml(me.department)}</div>
        ${item(roomFile, '#' + deptSlug, roomFile)}
        ${item('general.html', '#general', 'general.html')}
        ${item(annFile, '#' + deptSlug + '-announcements', annFile)}
        ${item('announcement.html', '#all-announcements', 'announcement.html')}
      </div>
      <div class="sidebar-user">
        ${escapeHtml(me.name)}<br>
        <span class="mono">${escapeHtml(me.emp_no)}</span> · ${me.role.charAt(0).toUpperCase() + me.role.slice(1)}<br>
        <a href="#" style="color:#BFE3D6;" onclick="Demo.logout();return false;">Log out</a>
      </div>`;
  }

  function renderAdminSidebar(adminName, activeFile) {
    const item = (href, label, key) =>
      `<a href="${href}" class="nav-item${activeFile === key ? ' active' : ''}"><span class="label">${label}</span></a>`;
    return `
      <div>
        <div class="brand">Blaze<span>Plus</span></div>
        <div class="nav-section-label">Admin</div>
        ${item('dashboard.html', 'Review Queue', 'dashboard.html')}
        ${item('tverify.html', 'Transfer Requests', 'tverify.html')}
        ${item('complaints.html', 'Complaints', 'complaints.html')}
      </div>
      <div class="sidebar-user">
        ${escapeHtml(adminName)}<br>
        <span class="mono">ADMIN</span><br>
        <a href="#" style="color:#BFE3D6;" onclick="Demo.adminLogout();return false;">Log out</a>
      </div>`;
  }

  function logout() { clearSession(); location.href = root('login.html'); }
  function adminLogout() { clearAdminSession(); location.href = 'login.html'; }

  // ---- sample chat/announcement seed lines (never persisted — see header note) ----
  const CHAT_SEED_LINES = {
    general: [
      { fromEmail: 'priya.singh@blazeplus.demo', text: "Morning all — reminder that the office is closed next Friday for the holiday." },
      { fromEmail: 'arjun.sharma@blazeplus.demo', text: "Noted, thanks Priya!" }
    ],
    it: [
      { fromEmail: 'karan.mehta@blazeplus.demo', text: "VPN maintenance tonight 11pm–1am, expect a couple of drops." },
      { fromEmail: 'riya.nair@blazeplus.demo', text: "Got it, I'll deploy before that window." }
    ],
    hr: [
      { fromEmail: 'priya.singh@blazeplus.demo', text: "Reminder: appraisal self-review forms are due this Friday." }
    ],
    finance: [
      { fromEmail: 'neha.gupta@blazeplus.demo', text: "Reimbursement batch for last month goes out today." }
    ],
    sales: [
      { fromEmail: 'simran.kaur@blazeplus.demo', text: "Great close on the Meridian account, team 🎉" }
    ],
    marketing: [
      { fromEmail: 'ananya.das@blazeplus.demo', text: "Draft campaign brief is in the shared folder, take a look before standup." }
    ],
    operations: [
      { fromEmail: 'meera.iyer@blazeplus.demo', text: "Vendor walkthrough moved to 3pm today." }
    ]
  };

  const ANNOUNCEMENT_SEED_LINES = {
    announcement: [
      { fromEmail: 'sunita.verma@blazeplus.demo', text: "Company all-hands is next Wednesday at 4pm — calendar invites going out shortly." }
    ],
    it_announcements: [
      { fromEmail: 'karan.mehta@blazeplus.demo', text: "New laptop refresh cycle starts next quarter — check with IT if yours qualifies." }
    ],
    hr_announcements: [
      { fromEmail: 'priya.singh@blazeplus.demo', text: "Updated leave policy is posted — please review by end of week." }
    ],
    finance_announcements: [
      { fromEmail: 'neha.gupta@blazeplus.demo', text: "Q-end close deadline moved up by two days this cycle." }
    ],
    sales_announcements: [
      { fromEmail: 'simran.kaur@blazeplus.demo', text: "New commission structure takes effect next month." }
    ],
    marketing_announcements: [
      { fromEmail: 'ananya.das@blazeplus.demo', text: "Brand refresh assets are live in the shared drive." }
    ],
    operations_announcements: [
      { fromEmail: 'meera.iyer@blazeplus.demo', text: "Facilities will be doing fire-safety drills next Tuesday." }
    ]
  };

  function seedMessagesFor(roomKey, table) {
    const users = getUsers();
    const lines = table[roomKey] || [];
    return lines.map((l, i) => {
      const u = users.find(x => x.email === l.fromEmail) || { name: 'Unknown', emp_no: '—', role: 'employee' };
      return {
        id: 'seed-' + roomKey + '-' + i,
        user_id: u.id,
        name: u.name,
        emp_no: u.emp_no,
        role: u.role,
        message: l.text,
        image_path: null,
        pdf_path: null,
        created_at: new Date(Date.now() - (lines.length - i) * 9 * 60000).toLocaleString('en-IN')
      };
    });
  }

  global.Demo = {
    KEYS, DEPARTMENTS, ROLES, ADMIN,
    seedIfNeeded, resetAll,
    getUsers, saveUsers, getUnverified, saveUnverified, getBanned, saveBanned,
    getTransfers, saveTransfers, getContactRequests, saveContactRequests,
    getComplaints, saveComplaints, nextId,
    getSession, setSession, clearSession, getAdminSession, setAdminSession, clearAdminSession,
    getCurrentUser, root, inAdmin,
    requireUser, requireUnverified, requireAdmin,
    fieldVisible, approvedGrantsFor, visibleEmployeesFor, slugify, escapeHtml, fmtDateTime,
    renderSidebar, renderAdminSidebar, logout, adminLogout,
    seedChatMessages: (roomKey) => seedMessagesFor(roomKey, CHAT_SEED_LINES),
    seedAnnouncementMessages: (roomKey) => seedMessagesFor(roomKey, ANNOUNCEMENT_SEED_LINES)
  };

  seedIfNeeded();
})(window);
