const svg = body => `<svg class="size-5 shrink-0" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const closeIcon = svg('<path d="M18 6 6 18M6 6l12 12"/>');
const callIcon = svg('<path d="M4 14a8 8 0 0 1 16 0"/><path d="M18 19c0 1.1-.9 2-2 2h-3"/><path d="M4 14v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2ZM20 14v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2Z"/>');
const shieldIcon = svg('<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>');
const clockIcon = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
const arrowIcon = svg('<path d="M5 12h14m-5-5 5 5-5 5"/>');

document.body.insertAdjacentHTML('beforeend', `
  <button class="enquiry-orbit fixed bottom-5 left-5 z-40 flex min-h-14 items-center gap-2.5 rounded-full bg-brand-purple px-5 text-sm font-extrabold text-white shadow-[0_14px_36px_rgba(69,13,105,.35)] transition hover:-translate-y-1 hover:bg-brand-deep focus-visible:outline-4 focus-visible:outline-brand-yellow/60 max-md:bottom-20 max-md:left-3.5" id="enquiry-orbit" aria-label="Open free trip planning form">
    <span class="enquiry-orbit-ring pointer-events-none absolute inset-[-7px] rounded-full border-2 border-brand-purple/25"></span>${callIcon}<span>Plan my trip</span>
  </button>

  <div class="enquiry-modal invisible fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-brand-ink/70 p-4 opacity-0 backdrop-blur-md transition-opacity duration-300 [&.open]:visible [&.open]:opacity-100 [&.open_.enquiry-dialog]:translate-y-0 [&.open_.enquiry-dialog]:scale-100 max-[700px]:items-end max-[700px]:p-0" id="enquiry-modal" aria-hidden="true">
    <button class="enquiry-backdrop absolute inset-0 cursor-default" type="button" data-popup-close aria-label="Close trip planning form"></button>
    <section class="enquiry-dialog relative z-10 max-h-[calc(100dvh-32px)] w-[min(860px,calc(100%-32px))] translate-y-5 scale-[.98] overflow-hidden rounded-[28px] bg-white shadow-[0_32px_100px_rgba(22,5,31,.5)] transition duration-300 max-[700px]:max-h-[94dvh] max-[700px]:w-full max-[700px]:overflow-y-auto max-[700px]:rounded-b-none max-[700px]:rounded-t-[24px]" role="dialog" aria-modal="true" aria-labelledby="enquiry-title" aria-describedby="enquiry-description">
      <button class="enquiry-close absolute right-3 top-3 z-30 grid size-11 place-items-center rounded-full border border-brand-purple/10 bg-white text-brand-purple shadow-lg transition hover:rotate-90 hover:bg-brand-yellow focus-visible:outline-4 focus-visible:outline-brand-purple/20" type="button" data-popup-close aria-label="Close enquiry form">${closeIcon}</button>

      <div class="grid grid-cols-[.9fr_1.1fr] max-[700px]:grid-cols-1">
        <aside class="relative min-h-[520px] overflow-hidden bg-brand-deep text-white max-[700px]:min-h-[210px]">
          <img class="absolute inset-0 size-full object-cover object-center" src="/images/trip-consultation-popup.jpg" alt="Travellers planning a mountain journey with a map">
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,7,49,.12),rgba(35,7,49,.92))]"></div>
          <div class="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-7 max-[700px]:min-h-[210px] max-[700px]:p-5 max-[700px]:pr-16">
            <span class="mb-auto w-fit rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-yellow backdrop-blur">Free expert callback</span>
            <p class="mb-2 text-xs font-extrabold uppercase tracking-[.18em] text-brand-yellow">Your idea. Our route expertise.</p>
            <h2 class="max-w-sm font-heading text-[clamp(1.75rem,2.7vw,2.45rem)] font-extrabold leading-[1.08] outline-none" id="enquiry-title" tabindex="-1">Let us shape a trip that fits you.</h2>
            <p class="mt-3 max-w-sm text-sm leading-6 text-white/75 max-[700px]:hidden">Share three quick details. A real TravelEnfield planner will help with routes, dates and the right travel style.</p>
          </div>
        </aside>

        <form class="enquiry-quick-form bg-white p-8 max-[700px]:overflow-y-auto max-[700px]:p-5 max-[700px]:pb-[calc(1.25rem+env(safe-area-inset-bottom))]" id="enquiry-quick-form" novalidate>
          <div class="mb-5 pr-10">
            <span class="text-[10px] font-extrabold uppercase tracking-[.2em] text-brand-purple">Free trip consultation</span>
            <h3 class="mt-1 font-heading text-2xl font-extrabold leading-tight text-brand-deep max-[700px]:text-xl">Where should we call you?</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500" id="enquiry-description">No payment. No pressure. Usually one call is enough to find the right direction.</p>
          </div>

          <div class="grid gap-3.5">
            <label class="grid gap-1.5 text-sm font-bold text-brand-ink" for="quick-name">Full name
              <input class="min-h-12 w-full rounded-xl border border-brand-purple/15 bg-brand-surface/70 px-4 text-base outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-name" name="name" required autocomplete="name" placeholder="Your name">
            </label>
            <label class="grid gap-1.5 text-sm font-bold text-brand-ink" for="quick-phone">Phone number
              <input class="min-h-12 w-full rounded-xl border border-brand-purple/15 bg-brand-surface/70 px-4 text-base outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 +()-]{10,}" placeholder="10-digit mobile number">
            </label>
            <label class="grid gap-1.5 text-sm font-bold text-brand-ink" for="quick-destination">Destination or trip idea
              <input class="min-h-12 w-full rounded-xl border border-brand-purple/15 bg-brand-surface/70 px-4 text-base outline-none transition placeholder:text-gray-400 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" id="quick-destination" name="destination" required placeholder="e.g. Ladakh, Bali, weekend escape">
            </label>
          </div>

          <button class="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 font-extrabold text-brand-deep shadow-[0_12px_28px_rgba(251,207,8,.25)] transition hover:-translate-y-0.5 hover:bg-[#ffe05a] focus-visible:outline-4 focus-visible:outline-brand-purple/20 disabled:cursor-wait disabled:opacity-60 [&_svg]:size-5" type="submit">Get my free trip plan ${arrowIcon}</button>
          <div class="mt-4 grid grid-cols-2 gap-2 border-t border-brand-purple/10 pt-4 text-[11px] text-gray-500">
            <span class="flex items-center gap-1.5 [&_svg]:size-4">${shieldIcon}<b>No spam</b></span>
            <span class="flex items-center justify-end gap-1.5 [&_svg]:size-4">${clockIcon}<b>Reply in 1 day</b></span>
          </div>
          <p class="quick-form-note mt-3 text-center text-[10px] leading-4 text-gray-400">By submitting, you agree to be contacted about this enquiry.</p>
          <p class="quick-form-status mt-1 min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600" role="status" aria-live="polite"></p>
        </form>
      </div>
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
  status.className = 'quick-form-status mt-1 min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600';
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
