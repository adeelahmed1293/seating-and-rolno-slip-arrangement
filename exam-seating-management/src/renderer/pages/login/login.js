/**
 * login.js — Login Page Logic
 * Exam Seating Management System
 */

'use strict';

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const loginForm      = document.getElementById('loginForm');
const usernameInput  = document.getElementById('username');
const passwordInput  = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginBtn       = document.getElementById('loginBtn');
const btnText        = loginBtn.querySelector('.btn-login__text');
const btnSpinner     = loginBtn.querySelector('.btn-login__spinner');
const btnArrow       = loginBtn.querySelector('.btn-login__arrow');
const alertBox       = document.getElementById('alert');
const alertMsg       = document.getElementById('alert-msg');
const usernameErr    = document.getElementById('username-err');
const passwordErr    = document.getElementById('password-err');

// Window control buttons
document.getElementById('btn-min')?.addEventListener('click', () => window.esms.minimize());
document.getElementById('btn-max')?.addEventListener('click', () => window.esms.maximize());
document.getElementById('btn-close')?.addEventListener('click', () => window.esms.close());

// ─── Password Toggle ──────────────────────────────────────────────────────────
const eyeShow = togglePassword.querySelector('.eye-icon--show');
const eyeHide = togglePassword.querySelector('.eye-icon--hide');

togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeShow.style.display = isPassword ? 'none' : '';
  eyeHide.style.display = isPassword ? ''     : 'none';
  togglePassword.setAttribute('aria-label',
    isPassword ? 'Hide password' : 'Show password'
  );
  // Brief highlight on input
  passwordInput.focus();
});

// ─── Inline Validation ────────────────────────────────────────────────────────
function clearFieldError(input, errEl) {
  input.classList.remove('field-input--error');
  errEl.textContent = '';
}

function setFieldError(input, errEl, message) {
  input.classList.add('field-input--error');
  errEl.textContent = message;
}

usernameInput.addEventListener('input', () => clearFieldError(usernameInput, usernameErr));
passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordErr));

function validate() {
  let valid = true;
  clearFieldError(usernameInput, usernameErr);
  clearFieldError(passwordInput, passwordErr);

  if (!usernameInput.value.trim()) {
    setFieldError(usernameInput, usernameErr, 'Username is required.');
    valid = false;
  }
  if (!passwordInput.value) {
    setFieldError(passwordInput, passwordErr, 'Password is required.');
    valid = false;
  }
  return valid;
}

// ─── Alert helpers ────────────────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  alertBox.hidden = false;
  alertBox.classList.toggle('alert--success', type === 'success');
  alertMsg.textContent = msg;
}

function hideAlert() {
  alertBox.hidden = true;
}

// ─── Loading State ────────────────────────────────────────────────────────────
function setLoading(state) {
  loginBtn.disabled = state;
  btnText.textContent  = state ? 'Signing in...' : 'Sign In';
  btnSpinner.hidden    = !state;
  btnArrow.style.display = state ? 'none' : '';
}

// ─── Submit ───────────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  if (!validate()) {
    // Shake the card
    const card = document.querySelector('.form-card');
    card.classList.remove('shake');
    void card.offsetWidth; // force reflow
    card.classList.add('shake');
    return;
  }

  setLoading(true);

  try {
    const result = await window.esms.login({
      username: usernameInput.value.trim(),
      password: passwordInput.value,
    });

    if (result.success) {
      showAlert('Authentication successful. Redirecting…', 'success');
      setTimeout(() => window.esms.navigate('dashboard'), 800);
    } else {
      showAlert(result.message || 'Invalid credentials. Please try again.');
      passwordInput.value = '';
      // Shake on failure
      const card = document.querySelector('.form-card');
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      setTimeout(() => passwordInput.focus(), 50);
    }
  } catch (err) {
    showAlert('An unexpected error occurred. Please restart the application.');
    console.error('[Login]', err);
  } finally {
    setLoading(false);
  }
});

// ─── Enter key on username moves to password ──────────────────────────────────
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); passwordInput.focus(); }
});

// ─── Auto-focus ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => usernameInput.focus(), 400);
});
