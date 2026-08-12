const svg = body => `<svg class="size-5 shrink-0" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const closeIcon = svg('<path d="M18 6 6 18M6 6l12 12"/>');
const backIcon = svg('<path d="m15 18-6-6 6-6"/>');

const USER_KEY = 'travelenfield-user';
const inputClass = 'min-h-13 w-full rounded-full border border-brand-purple/15 bg-brand-surface/70 px-5 text-base outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10';
const statusClass = 'login-status min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600';

document.body.insertAdjacentHTML('beforeend', `
  <div class="login-modal invisible fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-brand-ink/70 p-4 opacity-0 backdrop-blur-md transition-opacity duration-300 [&.open]:visible [&.open]:opacity-100 [&.open_.login-dialog]:translate-y-0 [&.open_.login-dialog]:scale-100" id="login-modal" aria-hidden="true">
    <button class="login-backdrop absolute inset-0 cursor-default" type="button" data-login-close aria-label="Close login form"></button>
    <section class="login-dialog relative z-10 max-h-[calc(100dvh-32px)] w-[min(380px,calc(100%-32px))] translate-y-5 scale-[.98] overflow-y-auto rounded-[28px] bg-white p-7 shadow-[0_32px_100px_rgba(22,5,31,.5)] transition duration-300" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button class="login-close absolute right-4 top-4 z-30 grid size-9 place-items-center rounded-full border border-brand-purple/10 bg-white text-brand-purple shadow-sm transition hover:rotate-90 hover:bg-brand-yellow focus-visible:outline-4 focus-visible:outline-brand-purple/20" type="button" data-login-close aria-label="Close">${closeIcon}</button>

      <div class="login-tabs mb-5 grid grid-cols-2 gap-1.5 rounded-full bg-brand-surface p-1.5" role="tablist">
        <button type="button" class="login-tab min-h-10 rounded-full text-sm font-extrabold transition" data-login-tab="login" aria-selected="true">Login</button>
        <button type="button" class="login-tab min-h-10 rounded-full text-sm font-extrabold transition" data-login-tab="signup" aria-selected="false">Sign Up</button>
      </div>

      <h2 class="sr-only" id="login-title">Login or Sign Up</h2>

      <div class="login-panel" data-login-panel="login">
        <p class="mb-4 text-sm leading-6 text-slate-500">Welcome back. Login with your email and password.</p>
        <form class="grid gap-3" id="login-form" novalidate>
          <label class="sr-only" for="login-email">Email</label>
          <input class="${inputClass}" id="login-email" name="email" type="email" required autocomplete="email" placeholder="Email address">
          <label class="sr-only" for="login-password">Password</label>
          <input class="${inputClass}" id="login-password" name="password" type="password" required autocomplete="current-password" placeholder="Password">
          <button class="btn btn-primary btn-block mt-1 min-h-13" type="submit">Login</button>
          <p class="${statusClass}" id="login-form-status" role="status" aria-live="polite"></p>
        </form>
      </div>

      <div class="login-panel hidden" data-login-panel="signup-details">
        <p class="mb-4 text-sm leading-6 text-slate-500">Enter your details and we'll email you a code to verify.</p>
        <form class="grid gap-3" id="signup-details-form" novalidate>
          <label class="sr-only" for="signup-name">Full name</label>
          <input class="${inputClass}" id="signup-name" name="name" required autocomplete="name" placeholder="Full name">
          <label class="sr-only" for="signup-email">Email</label>
          <input class="${inputClass}" id="signup-email" name="email" type="email" required autocomplete="email" placeholder="Email address">
          <label class="sr-only" for="signup-phone">Mobile number</label>
          <div class="flex min-h-13 w-full items-center gap-2 rounded-full border border-brand-purple/15 bg-brand-surface/70 pl-5 pr-2 transition focus-within:border-brand-purple focus-within:ring-4 focus-within:ring-brand-purple/10">
            <span class="shrink-0 text-base text-brand-ink">+91</span>
            <input class="min-h-13 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-gray-400" id="signup-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 ]{10,}" placeholder="Mobile number">
          </div>
          <label class="mt-1 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-gray-500">
            <input type="checkbox" id="signup-agree" name="agree" required class="mt-0.5 size-4 shrink-0 accent-brand-purple">
            <span>By continuing, you agree to our <a href="/terms-and-conditions" target="_blank" class="font-bold text-brand-purple underline">T&amp;C</a> &amp; <a href="/privacy-policy" target="_blank" class="font-bold text-brand-purple underline">Privacy Policy</a></span>
          </label>
          <button class="btn btn-primary btn-block mt-1 min-h-13" type="submit">Send OTP</button>
          <p class="${statusClass}" id="signup-details-status" role="status" aria-live="polite"></p>
        </form>
      </div>

      <div class="login-panel hidden" data-login-panel="signup-otp">
        <button type="button" class="login-back mb-3 inline-flex items-center gap-1 text-sm font-bold text-brand-purple" data-signup-back="signup-details">${backIcon} Back</button>
        <p class="mb-4 text-sm leading-6 text-slate-500">Enter the 6-digit code sent to <strong class="text-brand-ink" id="signup-otp-email"></strong></p>
        <form class="grid gap-3" id="signup-otp-form" novalidate>
          <label class="sr-only" for="signup-otp-code">OTP code</label>
          <input class="min-h-13 w-full rounded-full border border-brand-purple/15 bg-brand-surface/70 px-5 text-center text-xl tracking-[0.5em] outline-none transition placeholder:tracking-normal placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="signup-otp-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="------" autocomplete="one-time-code">
          <button class="btn btn-primary btn-block min-h-13" type="submit">Verify</button>
          <button type="button" class="text-center text-xs font-bold text-brand-purple" id="signup-resend">Resend OTP</button>
          <p class="${statusClass}" id="signup-otp-status" role="status" aria-live="polite"></p>
        </form>
      </div>

      <div class="login-panel hidden" data-login-panel="signup-password">
        <p class="mb-4 text-sm leading-6 text-slate-500">Email verified. Now create a password for your account.</p>
        <form class="grid gap-3" id="signup-password-form" novalidate>
          <label class="sr-only" for="signup-password">Password</label>
          <input class="${inputClass}" id="signup-password" name="password" type="password" required minlength="6" autocomplete="new-password" placeholder="Create password (6+ characters)">
          <label class="sr-only" for="signup-password-confirm">Confirm password</label>
          <input class="${inputClass}" id="signup-password-confirm" name="passwordConfirm" type="password" required minlength="6" autocomplete="new-password" placeholder="Confirm password">
          <button class="btn btn-primary btn-block mt-1 min-h-13" type="submit">Create Account</button>
          <p class="${statusClass}" id="signup-password-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
  </div>`);

const modal = document.querySelector('#login-modal');
const tabs = [...modal.querySelectorAll('.login-tab')];
const panels = [...modal.querySelectorAll('.login-panel')];
const loginForm = modal.querySelector('#login-form');
const signupDetailsForm = modal.querySelector('#signup-details-form');
const signupOtpForm = modal.querySelector('#signup-otp-form');
const signupPasswordForm = modal.querySelector('#signup-password-form');
const signupOtpEmailLabel = modal.querySelector('#signup-otp-email');
let returnFocus = null;
let pendingEmail = '';
let pendingName = '';
let pendingPhone = '';
const focusable = () => [...modal.querySelectorAll('button,input,a,[tabindex]:not([tabindex="-1"])')].filter(item => !item.disabled && item.offsetParent !== null);

function showPanel(name) {
  panels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.loginPanel !== name));
  requestAnimationFrame(() => panels.find(p => p.dataset.loginPanel === name)?.querySelector('input')?.focus());
}

function setActiveTab(tab) {
  tabs.forEach(btn => {
    const active = btn.dataset.loginTab === tab;
    btn.setAttribute('aria-selected', String(active));
    btn.classList.toggle('bg-brand-purple', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('text-gray-500', !active);
  });
  showPanel(tab === 'login' ? 'login' : 'signup-details');
}

tabs.forEach(btn => btn.addEventListener('click', () => setActiveTab(btn.dataset.loginTab)));
modal.querySelectorAll('[data-signup-back]').forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.signupBack)));

export function setLoginPopup(open, initialTab = 'login') {
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
  if (open) {
    loginForm.reset(); signupDetailsForm.reset(); signupOtpForm.reset(); signupPasswordForm.reset();
    modal.querySelectorAll('.login-status').forEach(el => { el.textContent = ''; el.className = statusClass; });
    setActiveTab(initialTab);
    returnFocus = document.activeElement;
  } else returnFocus?.focus?.();
}

document.querySelectorAll('[data-login-trigger]').forEach(item => item.addEventListener('click', () => setLoginPopup(true)));
modal.querySelectorAll('[data-login-close]').forEach(item => item.addEventListener('click', () => setLoginPopup(false)));
document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
  if (event.key === 'Escape') { setLoginPopup(false); return; }
  if (event.key === 'Tab') {
    const items = focusable(), first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function setStatus(el, text, kind) {
  el.textContent = text;
  el.className = statusClass + (kind ? ` ${kind}` : '');
}

function finishAuth(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.dispatchEvent(new CustomEvent('travelenfield:login', { detail: user }));
  setTimeout(() => setLoginPopup(false), 600);
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]'), status = modal.querySelector('#login-form-status');
  if (!loginForm.checkValidity()) { loginForm.reportValidity(); return; }
  button.disabled = true;
  setStatus(status, 'Logging in...');
  try {
    const body = Object.fromEntries(new FormData(loginForm));
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Invalid email or password.');
    setStatus(status, `Welcome back, ${result.user.name || ''}!`, 'success');
    finishAuth(result.user);
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally { button.disabled = false; }
});

signupDetailsForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = signupDetailsForm.querySelector('button[type="submit"]'), status = modal.querySelector('#signup-details-status');
  if (!signupDetailsForm.checkValidity()) { signupDetailsForm.reportValidity(); return; }
  button.disabled = true;
  setStatus(status, 'Sending your code...');
  try {
    const body = Object.fromEntries(new FormData(signupDetailsForm));
    body.agree = signupDetailsForm.querySelector('#signup-agree').checked;
    const response = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Could not send the OTP. Please try again.');
    pendingEmail = body.email; pendingName = body.name; pendingPhone = body.phone;
    signupOtpEmailLabel.textContent = pendingEmail;
    signupOtpForm.reset();
    showPanel('signup-otp');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally { button.disabled = false; }
});

modal.querySelector('#signup-resend').addEventListener('click', async () => {
  const resendBtn = modal.querySelector('#signup-resend'), status = modal.querySelector('#signup-otp-status');
  resendBtn.disabled = true;
  setStatus(status, 'Resending...');
  try {
    const response = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pendingName, email: pendingEmail, phone: pendingPhone, agree: true }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Could not resend the code.');
    setStatus(status, 'A new code has been sent.', 'success');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally {
    setTimeout(() => { resendBtn.disabled = false; }, 15000);
  }
});

signupOtpForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = signupOtpForm.querySelector('button[type="submit"]'), status = modal.querySelector('#signup-otp-status');
  if (!signupOtpForm.checkValidity()) { signupOtpForm.reportValidity(); return; }
  button.disabled = true;
  setStatus(status, 'Verifying...');
  try {
    const code = signupOtpForm.querySelector('#signup-otp-code').value.trim();
    const response = await fetch('/api/auth/verify-signup-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pendingEmail, code }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Incorrect code. Please try again.');
    signupPasswordForm.reset();
    showPanel('signup-password');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally { button.disabled = false; }
});

signupPasswordForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = signupPasswordForm.querySelector('button[type="submit"]'), status = modal.querySelector('#signup-password-status');
  if (!signupPasswordForm.checkValidity()) { signupPasswordForm.reportValidity(); return; }
  const password = modal.querySelector('#signup-password').value;
  const confirm = modal.querySelector('#signup-password-confirm').value;
  if (password !== confirm) { setStatus(status, 'Passwords do not match.', 'error'); return; }
  button.disabled = true;
  setStatus(status, 'Creating your account...');
  try {
    const response = await fetch('/api/auth/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pendingEmail, password }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Could not create your account. Please try again.');
    setStatus(status, 'Account created! Redirecting...', 'success');
    finishAuth(result.user);
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally { button.disabled = false; }
});
