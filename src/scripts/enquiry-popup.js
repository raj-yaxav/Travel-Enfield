const svg = body => `<svg class="size-5 shrink-0" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const closeIcon = svg('<path d="M18 6 6 18M6 6l12 12"/>');
const callIcon = svg('<path d="M4 14a8 8 0 0 1 16 0"/><path d="M18 19c0 1.1-.9 2-2 2h-3"/><path d="M4 14v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2ZM20 14v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2Z"/>');

document.body.insertAdjacentHTML('beforeend', `
  <button class="enquiry-orbit fixed bottom-5 left-5 z-40 flex min-h-14 items-center gap-2.5 rounded-full bg-brand-purple px-5 text-sm font-extrabold text-white shadow-[0_14px_36px_rgba(69,13,105,.35)] transition hover:-translate-y-1 hover:bg-brand-deep focus-visible:outline-4 focus-visible:outline-brand-yellow/60 max-md:bottom-20 max-md:left-3.5" id="enquiry-orbit" aria-label="Open free trip planning form">
    <span class="enquiry-orbit-ring pointer-events-none absolute inset-[-7px] rounded-full border-2 border-brand-purple/25"></span>${callIcon}<span>Plan my trip</span>
  </button>

  <div class="enquiry-modal invisible fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-brand-ink/70 p-4 opacity-0 backdrop-blur-md transition-opacity duration-300 [&.open]:visible [&.open]:opacity-100 [&.open_.enquiry-dialog]:translate-y-0 [&.open_.enquiry-dialog]:scale-100" id="enquiry-modal" aria-hidden="true">
    <button class="enquiry-backdrop absolute inset-0 cursor-default" type="button" data-popup-close aria-label="Close trip planning form"></button>
    <section class="enquiry-dialog relative z-10 max-h-[calc(100dvh-32px)] w-[min(320px,calc(100%-32px))] translate-y-5 scale-[.98] overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_32px_100px_rgba(22,5,31,.5)] transition duration-300" role="dialog" aria-modal="true" aria-labelledby="enquiry-title" aria-describedby="enquiry-description">
      <button class="enquiry-close absolute right-3 top-3 z-30 grid size-8 place-items-center rounded-full border border-brand-purple/10 bg-white text-brand-purple shadow-sm transition hover:rotate-90 hover:bg-brand-yellow focus-visible:outline-4 focus-visible:outline-brand-purple/20" type="button" data-popup-close aria-label="Close enquiry form">${closeIcon}</button>

      <h2 class="max-w-[85%] font-heading text-lg font-extrabold leading-tight text-brand-deep outline-none" id="enquiry-title" tabindex="-1">Let's plan your dream trip!</h2>
      <p class="mt-1.5 max-w-[90%] text-xs leading-5 text-slate-500" id="enquiry-description">Drop a few details, and we'll craft an unforgettable adventure just for you!</p>

      <form class="enquiry-quick-form mt-4 grid gap-2.5" id="enquiry-quick-form" novalidate>
        <label class="sr-only" for="quick-name">Full name</label>
        <input class="min-h-11 w-full rounded-full border border-brand-purple/15 bg-brand-surface/70 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-name" name="name" required autocomplete="name" placeholder="Name">

        <label class="sr-only" for="quick-destination">Destination</label>
        <input class="min-h-11 w-full rounded-full border border-brand-purple/15 bg-brand-surface/70 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-destination" name="destination" required placeholder="Choose your destination...">

        <label class="sr-only" for="quick-phone">Mobile number</label>
        <div class="flex min-h-11 w-full items-center gap-1.5 rounded-full border border-brand-purple/15 bg-brand-surface/70 pl-4 pr-2 transition focus-within:border-brand-purple focus-within:ring-4 focus-within:ring-brand-purple/10">
          <span class="shrink-0 text-sm text-brand-ink">+91</span>
          <input class="min-h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400" id="quick-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 ]{10,}" placeholder="Enter mobile number">
        </div>

        <label class="sr-only" for="quick-email">Email</label>
        <input class="min-h-11 w-full rounded-full border border-brand-purple/15 bg-brand-surface/70 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-email" name="email" type="email" autocomplete="email" placeholder="Email">

        <button class="btn btn-primary btn-block mt-1 min-h-11 text-sm" type="submit">Talk to our Experts</button>
        <p class="quick-form-status min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600" role="status" aria-live="polite"></p>
      </form>
    </section>
  </div>`);

const modal = document.querySelector('#enquiry-modal');
const trigger = document.querySelector('#enquiry-orbit');
const form = document.querySelector('#enquiry-quick-form');
let returnFocus = null;
const focusable = () => [...modal.querySelectorAll('button,input,a,[tabindex]:not([tabindex="-1"])')].filter(item => !item.disabled);

function setPopup(open) {
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('popup-open', open);
  if (open) {
    returnFocus = document.activeElement;
    requestAnimationFrame(() => document.querySelector('#enquiry-title')?.focus());
  } else returnFocus?.focus?.();
}

trigger.addEventListener('click', () => setPopup(true));
modal.querySelectorAll('[data-popup-close]').forEach(item => item.addEventListener('click', () => setPopup(false)));
document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
  if (event.key === 'Escape') { setPopup(false); return; }
  if (event.key === 'Tab') {
    const items = focusable(), first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]'), status = form.querySelector('.quick-form-status');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  button.disabled = true;
  status.className = 'quick-form-status min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600';
  status.textContent = 'Sending your request...';
  try {
    const body = { ...Object.fromEntries(new FormData(form)), type: 'popup-enquiry', travellers: 1 };
    const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error();
    status.classList.add('success');
    status.textContent = 'Request received. A TravelEnfield expert will contact you shortly.';
    form.reset();
  } catch {
    status.classList.add('error');
    status.textContent = 'Could not send right now. Please try again or use WhatsApp.';
  } finally { button.disabled = false; }
});

if (!new URLSearchParams(window.location.search).has('noPopup')) window.setTimeout(() => setPopup(true), 6000);
