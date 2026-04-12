/**
 * setup.js — First-Time Setup Logic
 * Exam Seating Management System
 */

'use strict';

// ─── Window controls ──────────────────────────────────────────────────────────
document.getElementById('btn-min')?.addEventListener('click', () => window.esms.minimize());
document.getElementById('btn-max')?.addEventListener('click', () => window.esms.maximize());
document.getElementById('btn-close')?.addEventListener('click', () => window.esms.close());

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const setupForm     = document.getElementById('setupForm');
const newPassword   = document.getElementById('newPassword');
const confirmPass   = document.getElementById('confirmPassword');
const setupBtn      = document.getElementById('setupBtn');
const btnText       = setupBtn.querySelector('.btn-setup__text');
const btnSpinner    = setupBtn.querySelector('.btn-setup__spinner');
const alertBox      = document.getElementById('alert');
const alertMsg      = document.getElementById('alert-msg');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

// Requirements
const REQ = {
  len:     { el: document.getElementById('req-len'),     test: p => p.length >= 8 },
  upper:   { el: document.getElementById('req-upper'),   test: p => /[A-Z]/.test(p) },
  num:     { el: document.getElementById('req-num'),     test: p => /[0-9]/.test(p) },
  special: { el: document.getElementById('req-special'), test: p => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
};

// ─── Password toggles ─────────────────────────────────────────────────────────
function makeToggle(btnId, inputEl) {
  const btn = document.getElementById(btnId);
  btn.addEventListener('click', () => {
    const show = inputEl.type === 'password';
    inputEl.type = show ? 'text' : 'password';
    btn.querySelector('.eye-show').style.display = show ? 'none' : '';
    btn.querySelector('.eye-hide').style.display = show ? '' : 'none';
    inputEl.focus();
  });
}
makeToggle('toggle1', newPassword);
makeToggle('toggle2', confirmPass);

// ─── Strength meter ───────────────────────────────────────────────────────────
const LEVELS = [
  { label: '—',      color: 'transparent', pct: 0   },
  { label: 'Weak',   color: '#f87171',     pct: 25  },
  { label: 'Fair',   color: '#fbbf24',     pct: 50  },
  { label: 'Good',   color: '#34d399',     pct: 75  },
  { label: 'Strong', color: '#4a8fd4',     pct: 100 },
];

function calcStrength(p) {
  const met = Object.values(REQ).filter(r => r.test(p)).length;
  return p.length === 0 ? 0 : Math.max(1, met);
}

function updateRequirements(p) {
  Object.values(REQ).forEach(({ el, test }) => {
    const ok = test(p);
    el.classList.toggle('req-item--met', ok);
    el.querySelector('.req-icon').textContent = ok ? '✓' : '✕';
  });
}

function updateStrength(p) {
  const lvl = LEVELS[calcStrength(p)];
  strengthFill.style.width      = lvl.pct + '%';
  strengthFill.style.background = lvl.color;
  strengthLabel.textContent     = lvl.label;
  strengthLabel.style.color     = lvl.color;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function allReqsMet(p) {
  return Object.values(REQ).every(r => r.test(p));
}

function updateSubmitBtn() {
  const valid = allReqsMet(newPassword.value) &&
                newPassword.value === confirmPass.value &&
                newPassword.value.length > 0;
  setupBtn.disabled = !valid;
}

newPassword.addEventListener('input', () => {
  const p = newPassword.value;
  updateRequirements(p);
  updateStrength(p);
  updateSubmitBtn();
  clearFieldError(document.getElementById('fg-new-password'), document.getElementById('new-err'));
});

confirmPass.addEventListener('input', () => {
  updateSubmitBtn();
  clearFieldError(document.getElementById('fg-confirm-password'), document.getElementById('confirm-err'));
});

// ─── Field error helpers ──────────────────────────────────────────────────────
function clearFieldError(groupEl, errEl) {
  groupEl?.querySelector('.field-input')?.classList.remove('field-input--error');
  if (errEl) errEl.textContent = '';
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  alertBox.hidden = false;
  alertBox.classList.toggle('alert--success', type === 'success');
  alertMsg.textContent = msg;
}

// ─── Submit ───────────────────────────────────────────────────────────────────
setupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (newPassword.value !== confirmPass.value) {
    const cfErr = document.getElementById('confirm-err');
    cfErr.textContent = 'Passwords do not match.';
    confirmPass.classList.add('field-input--error');
    return;
  }

  setupBtn.disabled = true;
  btnText.textContent = 'Saving…';
  btnSpinner.hidden = false;

  try {
    const result = await window.esms.setup({ password: newPassword.value });
    if (result.success) {
      document.getElementById('step-indicator-1').classList.remove('step--active');
      document.getElementById('step-indicator-1').classList.add('step--done');
      document.getElementById('step-indicator-1').querySelector('.step__num').textContent = '✓';
      document.getElementById('step-indicator-2').classList.add('step--active');

      showAlert('Password saved successfully! Redirecting to login…', 'success');
      setTimeout(() => window.esms.navigate('login'), 1500);
    } else {
      showAlert(result.message || 'Setup failed. Please try again.');
      setupBtn.disabled = false;
      btnText.textContent = 'Save Password & Continue';
      btnSpinner.hidden = true;
    }
  } catch (err) {
    showAlert('An unexpected error occurred.');
    console.error('[Setup]', err);
    setupBtn.disabled = false;
    btnText.textContent = 'Save Password & Continue';
    btnSpinner.hidden = true;
  }
});

// ─── Auto-focus ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => newPassword.focus(), 300);
});