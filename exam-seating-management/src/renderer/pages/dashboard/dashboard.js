/**
 * dashboard.js — Dashboard Page Logic
 * Exam Seating Management System
 *
 * Add your dashboard data-loading and interactivity here.
 */

'use strict';

// ─── Window controls ──────────────────────────────────────────────────────────
document.getElementById('btn-min')?.addEventListener('click', () => window.esms.minimize());
document.getElementById('btn-max')?.addEventListener('click', () => window.esms.maximize());
document.getElementById('btn-close')?.addEventListener('click', () => window.esms.close());

// ─── Logout ───────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  window.esms.navigate('login');
});

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-item--active'));
    item.classList.add('nav-item--active');
    // TODO: load sub-pages into main-content dynamically
    // const page = item.dataset.page;
    // loadPage(page);
  });
});

// ─── Date ─────────────────────────────────────────────────────────────────────
function updateDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  });
}
updateDate();
