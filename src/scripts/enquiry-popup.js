const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const closeIcon = svg('<path d="M18 6 6 18M6 6l12 12"/>');
const callIcon = svg('<path d="M4 14a8 8 0 0 1 16 0"/><path d="M18 19c0 1.1-.9 2-2 2h-3"/><path d="M4 14v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2ZM20 14v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2Z"/>');
const shieldIcon = svg('<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>');

document.body.insertAdjacentHTML('beforeend', `
  <button class="enquiry-orbit fixed bottom-5 left-5 z-40 flex min-h-14 items-center gap-2.5 rounded-full bg-brand-purple px-5 text-sm font-extrabold text-white shadow-[0_14px_36px_rgba(69,13,105,.35)] transition hover:-translate-y-1 hover:bg-brand-deep focus-visible:outline-4 focus-visible:outline-brand-yellow/60 max-md:bottom-20 max-md:left-3.5" id="enquiry-orbit" aria-label="Open trip enquiry form">
    <span class="enquiry-orbit-ring pointer-events-none absolute inset-[-7px] rounded-full border-2 border-brand-purple/25"></span>${callIcon}<span>Plan my trip</span>
  </button>
  <div class="enquiry-modal invisible fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-brand-ink/65 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-300 [&.open]:visible [&.open]:opacity-100 [&.open_.enquiry-dialog]:translate-y-0 [&.open_.enquiry-dialog]:scale-100 max-[700px]:items-end max-[700px]:p-0" id="enquiry-modal" aria-hidden="true">
    <div class="enquiry-backdrop absolute inset-0" data-popup-close></div>
    <section class="enquiry-dialog relative z-10 max-h-[calc(100dvh-32px)] w-[min(820px,calc(100%-32px))] translate-y-6 scale-[.98] overflow-y-auto rounded-3xl border border-white/20 bg-white shadow-[0_30px_90px_rgba(22,5,31,.4)] transition duration-300 max-[700px]:max-h-[92dvh] max-[700px]:w-full max-[700px]:rounded-b-none max-[700px]:rounded-t-3xl" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
      <button class="enquiry-close absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full border border-brand-purple/10 bg-white/90 text-brand-purple shadow-lg backdrop-blur transition hover:rotate-90 hover:bg-brand-yellow focus-visible:outline-3 focus-visible:outline-brand-purple/30" type="button" data-popup-close aria-label="Close enquiry form">${closeIcon}</button>
      <div class="enquiry-panel grid grid-cols-[.9fr_1.1fr] max-[700px]:grid-cols-1">
        <div class="enquiry-trust relative flex min-h-[570px] flex-col justify-end overflow-hidden p-8 text-white max-[700px]:min-h-[138px] max-[700px]:p-4 max-[700px]:pr-16">
          <img class="enquiry-photo absolute inset-0 size-full object-cover object-center" src="/images/trip-consultation-popup.jpg" alt="Traveller planning a Ladakh route with a TravelEnfield trip expert">
          <span class="enquiry-kicker relative z-10 mb-3 w-max rounded-full border border-white/25 bg-brand-deep/50 px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wider text-brand-yellow backdrop-blur">Planning soon?</span>
          <h2 class="relative z-10 mb-2.5 font-heading text-[clamp(1.75rem,2.5vw,2.35rem)] font-extrabold leading-tight max-[700px]:mb-0 max-[700px]:max-w-72 max-[700px]:text-xl" id="enquiry-title">Get a route that fits—not a copied itinerary.</h2>
          <p class="relative z-10 text-xs leading-relaxed text-white/75 max-[700px]:hidden">Share three details. A real TravelEnfield expert will help with dates, budget and the right travel style.</p>
          <div class="enquiry-proof relative z-10 mt-4 grid grid-cols-2 gap-2 max-[700px]:hidden">
            <div class="flex items-start gap-2 rounded-xl border border-white/15 bg-white/10 p-2.5">${shieldIcon}<span class="grid"><strong class="text-xs">No payment now</strong><small class="text-[.6rem] text-white/60">The planning call is completely free</small></span></div>
            <div class="flex items-start gap-2 rounded-xl border border-white/15 bg-white/10 p-2.5">${callIcon}<span class="grid"><strong class="text-xs">Human response</strong><small class="text-[.6rem] text-white/60">Usually within one working day</small></span></div>
          </div>
          <div class="enquiry-urgency relative z-10 mt-2.5 rounded-xl border-l-2 border-brand-yellow bg-brand-yellow/10 p-2.5 text-xs max-[700px]:hidden"><strong>Travelling in the next 30 days?</strong><span class="hidden">Send your request early so stays and transfers can be checked properly.</span></div>
        </div>
        <form class="enquiry-quick-form bg-white p-8 max-[700px]:p-4 max-[700px]:pb-[calc(1rem+env(safe-area-inset-bottom))] [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-brand-purple/15 [&_input]:bg-brand-surface/60 [&_input]:px-3.5 [&_input]:text-base [&_input]:outline-none [&_input]:transition [&_input:focus]:border-brand-purple [&_input:focus]:ring-4 [&_input:focus]:ring-brand-purple/10" id="enquiry-quick-form">
          <div class="quick-form-head mb-3 max-[700px]:flex max-[700px]:items-end max-[700px]:justify-between max-[700px]:gap-3"><span class="text-[.65rem] font-extrabold uppercase tracking-wider text-brand-purple">Free trip consultation</span><h3 class="mt-2 font-heading text-2xl font-extrabold leading-tight text-brand-deep max-[700px]:mt-0 max-[700px]:text-lg">Where should we call you?</h3></div>
          <label class="mb-1 mt-2 block text-xs font-bold text-brand-ink" for="quick-name">Full name</label><input id="quick-name" name="name" required autocomplete="name" placeholder="Your name">
          <label class="mb-1 mt-2 block text-xs font-bold text-brand-ink" for="quick-phone">Phone number</label><input id="quick-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 +()-]{10,}" placeholder="10-digit mobile number">
          <label class="mb-1 mt-2 block text-xs font-bold text-brand-ink" for="quick-destination">Destination or trip idea</label><input id="quick-destination" name="destination" required placeholder="e.g. Ladakh, Bali, weekend escape">
          <button class="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 font-extrabold text-brand-deep shadow-[0_12px_28px_rgba(251,207,8,.25)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60" type="submit">Get my free trip plan <span>→</span></button>
          <p class="quick-form-note mt-2 text-center text-[.62rem] leading-relaxed text-gray-500">By submitting, you agree to be contacted about this enquiry. No spam.</p><p class="quick-form-status mt-1 min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
  </div>`);

const modal = document.querySelector('#enquiry-modal');
const trigger = document.querySelector('#enquiry-orbit');
const form = document.querySelector('#enquiry-quick-form');
let returnFocus = null;
const focusable = () => [...modal.querySelectorAll('button,input,a,[tabindex]:not([tabindex="-1"])')];

function setPopup(open) {
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('popup-open', open);
  if (open) {
    returnFocus = document.activeElement;
    requestAnimationFrame(() => form.querySelector('input')?.focus());
  } else returnFocus?.focus?.();
}

trigger.addEventListener('click', () => setPopup(true));
modal.querySelectorAll('[data-popup-close]').forEach(item => item.addEventListener('click', () => setPopup(false)));
document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
  if (event.key === 'Escape') setPopup(false);
  if (event.key === 'Tab') {
    const items = focusable(), first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]'), status = form.querySelector('.quick-form-status');
  button.disabled = true;
  status.className = 'quick-form-status mt-1 min-h-4 text-center text-xs font-bold [&.success]:text-green-700 [&.error]:text-red-600';
  status.textContent = 'Sending your request…';
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
