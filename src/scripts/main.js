import './enquiry-popup.js';
import { setLoginPopup } from './login-popup.js';
import {
  createIcons,
  Backpack,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Home,
  Search,
  Bike,
  BookOpen,
  BadgeIndianRupee,
  CalendarClock,
  CalendarDays,
  Camera,
  CarFront,
  CircleCheckBig,
  CircleUserRound,
  ChevronDown,
  ChevronUp,
  Clock3,
  Earth,
  Footprints,
  Flame,
  Gift,
  Globe2,
  Heart,
  Luggage,
  Map,
  MapPinned,
  MessageCircle,
  Mail,
  MountainSnow,
  Phone,
  Plane,
  PlaneTakeoff,
  Play,
  Pause,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  ScanText,
  Sparkles,
  Star,
  Tags,
  Users,
  UsersRound,
  UserRoundCheck,
  WandSparkles,
  Headphones,
  CalendarSync,
  Hotel,
  Volume2,
  VolumeX,
  X,
} from 'lucide';

// Lucide keeps `data-lucide` on the SVG it creates. Before a later render,
// clear that marker from completed SVGs so only the original <i> placeholders
// are considered; otherwise Lucide attempts to create an icon named "svg".
const renderIcons = (icons, root = document) => {
  root.querySelectorAll('svg[data-lucide]').forEach(svg => svg.removeAttribute('data-lucide'));
  createIcons({ icons, root });
};

renderIcons({
    Backpack,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    BedDouble,
    Home,
    Search,
    Bike,
    BookOpen,
    BadgeIndianRupee,
    CalendarClock,
    CalendarDays,
    Camera,
    CarFront,
    CircleCheckBig,
    CircleUserRound,
    ChevronDown,
    ChevronUp,
    Clock3,
    Earth,
    Footprints,
    Flame,
    Gift,
    Globe2,
    Heart,
    Luggage,
    Map,
    MapPinned,
    MessageCircle,
    Mail,
    MountainSnow,
    Phone,
    Plane,
    PlaneTakeoff,
    Play,
    Pause,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    ScanText,
    Sparkles,
    Star,
    Tags,
    Users,
    UsersRound,
    UserRoundCheck,
    WandSparkles,
    Headphones,
    CalendarSync,
    Hotel,
    Volume2,
    VolumeX,
    X,
});

const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
dropdowns.forEach(dropdown => dropdown.querySelector('.nav-dropdown-toggle')?.addEventListener('click', event => {
  const wasOpen = dropdown.classList.contains('open');
  dropdowns.forEach(item => { item.classList.remove('open'); item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false'); });
  if (!wasOpen) { dropdown.classList.add('open'); event.currentTarget.setAttribute('aria-expanded', 'true'); }
}));
document.addEventListener('click', event => { if (!event.target.closest('.nav-dropdown')) dropdowns.forEach(item => { item.classList.remove('open'); item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false'); }); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') dropdowns.forEach(item => { item.classList.remove('open'); item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false'); }); });

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const announcement = $('#announcement-bar');
$('#announcement-close')?.addEventListener('click', () => {
  announcement?.remove();
});

// Video intro hero: mute toggle, and header switches from a transparent
// overlay to its normal solid styling once scrolled past the video.
const heroIntro = $('.hero-intro-video');
const heroIntroVideo = $('video', heroIntro);
const heroIntroMute = $('#hero-intro-mute');
heroIntroMute?.addEventListener('click', () => {
  if (!heroIntroVideo) return;
  const muted = !heroIntroVideo.muted;
  heroIntroVideo.muted = muted;
  heroIntroMute.setAttribute('aria-pressed', String(!muted));
  heroIntroMute.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
  heroIntroMute.replaceChildren();
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
  heroIntroMute.append(icon);
  renderIcons({ Volume2, VolumeX }, heroIntroMute);
});
if (heroIntro) {
  const headerEl = $('#header');
  const toggleHeaderSolid = () => {
    if (!headerEl) return;
    const rect = heroIntro.getBoundingClientRect();
    headerEl.classList.toggle('header-solid', rect.bottom <= headerEl.offsetHeight);
  };
  window.addEventListener('scroll', toggleHeaderSolid, { passive: true });
  window.addEventListener('resize', toggleHeaderSolid, { passive: true });
  toggleHeaderSolid();
}

// Mobile navigation chrome follows reading direction: hide while moving down,
// return immediately when the traveller scrolls up or reaches the page top.
const mobileHeader = $('#header');
const mobileBottomNav = $('#mobile-bottom-nav');
let lastMobileScrollY = window.scrollY;
let mobileScrollTicking = false;
const syncMobileChrome = () => {
  const currentY = Math.max(0, window.scrollY);
  const delta = currentY - lastMobileScrollY;
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  if (!mobile || currentY < 24) {
    mobileHeader?.classList.remove('nav-hidden');
    mobileBottomNav?.classList.remove('nav-hidden');
  } else if (Math.abs(delta) > 5 && !document.body.classList.contains('menu-open')) {
    mobileHeader?.classList.toggle('nav-hidden', delta > 0);
    mobileBottomNav?.classList.toggle('nav-hidden', delta > 0);
  }
  lastMobileScrollY = currentY;
  mobileScrollTicking = false;
};
window.addEventListener('scroll', () => {
  if (!mobileScrollTicking) { mobileScrollTicking = true; window.requestAnimationFrame(syncMobileChrome); }
}, { passive: true });

const menu = $('#mobile-nav');
const menuOverlay = $('#mobile-nav-overlay');
const hamburger = $('#hamburger');
const menuClose = $('#mobile-nav-close');
const drawerTriggers = $$('[data-drawer-trigger]');
const mobileDropdowns = [...document.querySelectorAll('.mobile-nav-dropdown')];
let menuReturnFocus = null;

// The sticky header uses backdrop-filter, which creates a containing block for
// fixed descendants. Portal the drawer to body so it always fills the viewport.
if (menuOverlay && menu) document.body.append(menuOverlay, menu);

function setMenu(open) {
  if (!menu || !menuOverlay || !hamburger) return;
  menu.classList.toggle('open', open);
  menuOverlay.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  drawerTriggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(open)));
  menu.setAttribute('aria-hidden', String(!open));
  if (open) {
    menuReturnFocus = document.activeElement;
    menuClose?.focus();
  } else {
    mobileDropdowns?.forEach(d => d.classList.remove('open'));
    if (menuReturnFocus instanceof HTMLElement) menuReturnFocus.focus();
  }
}

hamburger?.setAttribute('aria-expanded', 'false');
hamburger?.setAttribute('aria-controls', 'mobile-nav');
menu?.setAttribute('aria-hidden', 'true');
hamburger?.addEventListener('click', () => setMenu(true));
drawerTriggers.forEach(trigger => trigger.addEventListener('click', () => setMenu(true)));
menuClose?.addEventListener('click', () => setMenu(false));
menuOverlay?.addEventListener('click', () => setMenu(false));
$$('.mobile-nav-link', menu).forEach(link => {
  if (link.classList.contains('mobile-dropdown-toggle')) return;
  link.addEventListener('click', () => setMenu(false));
});

mobileDropdowns.forEach(dropdown => {
  const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
  toggle?.addEventListener('click', () => {
    const wasOpen = dropdown.classList.contains('open');
    mobileDropdowns.forEach(d => d.classList.remove('open'));
    if (!wasOpen) dropdown.classList.add('open');
  });
});

$$('.mobile-profile-trigger', menu).forEach(button => button.addEventListener('click', () => {
  setMenu(false);
  setLoginPopup(true);
}));

function syncMobileProfile() {
  const loggedOut = $('#mobile-profile-logged-out');
  const loggedIn = $('#mobile-profile-logged-in');
  const nameEl = $('#mobile-profile-name');
  const avatarEl = $('#mobile-profile-avatar');
  if (!loggedIn || !loggedOut) return;
  let user = null;
  try { user = JSON.parse(localStorage.getItem('travelenfield-user') || 'null'); } catch {}
  const authed = Boolean(user);
  loggedIn.classList.toggle('hidden', !authed);
  loggedOut.classList.toggle('hidden', authed);
  if (authed) {
    if (nameEl) nameEl.textContent = (user.name || 'Traveller').split(' ')[0];
    if (avatarEl) avatarEl.textContent = (user.name || 'T').charAt(0).toUpperCase();
  }
}
syncMobileProfile();
document.addEventListener('travelenfield:login', syncMobileProfile);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) setMenu(false);
});

function activateFilter(buttons, cards, attribute, hiddenClass = 'is-hidden') {
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset[attribute];
      buttons.forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      cards.forEach(card => {
        const categories = (card.dataset.category || card.dataset.trip || '').split(' ');
        card.classList.toggle(hiddenClass, value !== 'all' && !categories.includes(value));
      });
    });
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
}

activateFilter($$('.tab-btn'), $$('.destination-card'), 'tab');
activateFilter($$('.filter-pill'), $$('.trip-card'), 'filter');

const destinationTrack = $('#destination-grid');
const destinationPrev = $('#destination-prev');
const destinationNext = $('#destination-next');
const destinationStep = () => ($('.destination-card:not(.is-hidden)', destinationTrack)?.getBoundingClientRect().width || 280) + 18;
destinationPrev?.addEventListener('click', () => destinationTrack?.scrollBy({ left: -destinationStep(), behavior: 'smooth' }));
destinationNext?.addEventListener('click', () => destinationTrack?.scrollBy({ left: destinationStep(), behavior: 'smooth' }));
$$('.tab-btn').forEach(button => button.addEventListener('click', () => destinationTrack?.scrollTo({ left: 0, behavior: 'smooth' })));
const updateDestinationControls = () => {
  if (!destinationTrack) return;
  if (destinationPrev) destinationPrev.disabled = destinationTrack.scrollLeft < 5;
  if (destinationNext) destinationNext.disabled = destinationTrack.scrollLeft + destinationTrack.clientWidth >= destinationTrack.scrollWidth - 5;
};
destinationTrack?.addEventListener('scroll', updateDestinationControls, { passive: true });
updateDestinationControls();

const tripTrack = $('#trip-track');
const prevButton = $('#trip-prev');
const nextButton = $('#trip-next');
function carouselStep() {
  const card = $('.trip-card:not(.is-hidden)', tripTrack);
  if (!card || !tripTrack) return 320;
  return card.getBoundingClientRect().width + 20;
}
prevButton?.addEventListener('click', () => tripTrack?.scrollBy({ left: -carouselStep(), behavior: 'smooth' }));
nextButton?.addEventListener('click', () => tripTrack?.scrollBy({ left: carouselStep(), behavior: 'smooth' }));
function updateCarouselButtons() {
  if (!tripTrack) return;
  if (prevButton) prevButton.disabled = tripTrack.scrollLeft < 5;
  if (nextButton) nextButton.disabled = tripTrack.scrollLeft + tripTrack.clientWidth >= tripTrack.scrollWidth - 5;
}
tripTrack?.addEventListener('scroll', updateCarouselButtons, { passive: true });
window.addEventListener('resize', updateCarouselButtons, { passive: true });
updateCarouselButtons();

// Generic horizontal rail: arrow controls that disable at either end.
function wireRail(trackSelector, prevSelector, nextSelector, itemSelector, fallbackStep) {
  const track = $(trackSelector);
  const prev = $(prevSelector);
  const next = $(nextSelector);
  if (!track) return;
  const step = () => ($(itemSelector, track)?.getBoundingClientRect().width || fallbackStep) + 20;
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const update = () => {
    if (prev) prev.disabled = track.scrollLeft < 5;
    if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

wireRail('#review-track', '#review-prev', '#review-next', '.review-card', 340);
wireRail('#activities-track', '#activities-prev', '#activities-next', '.activity-card', 280);
wireRail('#vibe-reel-track', '#vibe-prev', '#vibe-next', '.vibe-reel-card', 240);

// Self-hosted reels shown in the homepage "Travel Vibes" rail and the
// full-screen mobile reels viewer. Order matches the Cloudinary upload
// result (reels-upload-result.json); each slot's public id points to the
// renamed Cloudinary URL.
const REELS = [
  { name: 'manali-snowfall', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532497/travelenfield/reels/travel-reel-1.mp4' },
  { name: 'goa-beach', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532479/travelenfield/reels/manali-snowfall.mp4' },
  { name: 'singapore-cruise', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532481/travelenfield/reels/goa-beach.mp4' },
  { name: 'spiti-valley', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532491/travelenfield/reels/singapore-city.mp4' },
  { name: 'nightlife-beach-party', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532486/travelenfield/reels/spiti-valley.mp4' },
  { name: 'singapore-city', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532488/travelenfield/reels/nightlife-beach-party.mp4' },
  { name: 'travel-reel-1', url: 'https://res.cloudinary.com/dq3typk9u/video/upload/v1786532483/travelenfield/reels/singapore-cruise.mp4' },
];

const reelVideoHtml = url => `<video class="block size-full object-cover" src="${url}" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-label="Travel reel"></video>`;

const reelControlsHtml = () => `
  <div class="reel-controls">
    <button type="button" class="reel-btn" data-reel-play aria-label="Pause video"><i data-lucide="pause"></i></button>
    <button type="button" class="reel-btn" data-reel-mute aria-label="Unmute video"><i data-lucide="volume-x"></i></button>
  </div>`;

function reelCardHtml(item, { full = false } = {}) {
  const video = reelVideoHtml(item.url);
  if (full) {
    return `<div class="reels-slide"><div class="reels-slide-frame">${video}</div>${reelControlsHtml()}</div>`;
  }
  return `<div class="vibe-reel-card">${video}${reelControlsHtml()}</div>`;
}

function setReelIcon(button, name) {
  button.replaceChildren();
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', name);
  button.append(icon);
  renderIcons({ Play, Pause, Volume2, VolumeX }, button);
}

function wireReelControls(card) {
  const video = card.querySelector('video');
  const playBtn = card.querySelector('[data-reel-play]');
  const muteBtn = card.querySelector('[data-reel-mute]');
  if (!video || !playBtn || !muteBtn) return;
  playBtn.addEventListener('click', () => { if (video.paused) video.play()?.catch(() => {}); else video.pause(); });
  muteBtn.addEventListener('click', () => { video.muted = !video.muted; });
  const sync = () => {
    setReelIcon(playBtn, video.paused ? 'play' : 'pause');
    playBtn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    setReelIcon(muteBtn, video.muted ? 'volume-x' : 'volume-2');
    muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('volumechange', sync);
  video.addEventListener('loadeddata', sync);
  sync();
}

$$('[data-reels-embed-target]').forEach(target => {
  const full = target.hasAttribute('data-reels-full');
  target.innerHTML = REELS.map(item => reelCardHtml(item, { full })).join('');
  $$(full ? '.reels-slide' : '.vibe-reel-card', target).forEach(wireReelControls);
});

// Muted autoplay is allowed by browsers, so every reel starts on its own.
// Only the on-screen videos keep playing; off-screen ones pause to save
// bandwidth (rail is horizontal, viewer is vertical full-screen).
if ('IntersectionObserver' in window) {
  const reelPlayObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video) return;
      if (entry.isIntersecting) video.play()?.catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.4 });
  $$('.vibe-reel-card, .reels-slide').forEach(card => reelPlayObserver.observe(card));
}

const reelsViewer = $('#reels-viewer');
const reelsTrigger = $('[data-reels-trigger]');
const reelsClose = $('#reels-viewer-close');
const pauseAllReels = () => $$('video', reelsViewer || document).forEach(video => { video.pause(); video.currentTime = 0; });
const openReelsViewer = () => {
  if (!reelsViewer) return;
  reelsViewer.classList.add('open');
  reelsViewer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  reelsViewer.querySelector('video')?.play()?.catch(() => {});
};
const closeReelsViewer = () => {
  if (!reelsViewer) return;
  reelsViewer.classList.remove('open');
  reelsViewer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  pauseAllReels();
};
reelsTrigger?.addEventListener('click', openReelsViewer);
reelsClose?.addEventListener('click', closeReelsViewer);
reelsViewer?.addEventListener('click', event => { if (event.target === reelsViewer) closeReelsViewer(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && reelsViewer?.classList.contains('open')) closeReelsViewer();
});

function wireMobileSearchFilter(panel, input) {
  if (!panel || !input) return;
  const cards = $$('.search-dest-card', panel);
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    cards.forEach(card => { card.hidden = query.length > 0 && !card.textContent.toLowerCase().includes(query); });
  });
}

const mobileSearchPanel = $('#mobile-search-panel');
const mobileSearchTrigger = $('[data-mobile-search-trigger]');
const mobileSearchClose = $('#mobile-search-close');
const mobileSearchInput = $('#mobile-search-input');
const openMobileSearch = () => {
  if (!mobileSearchPanel) return;
  mobileSearchPanel.classList.add('open');
  mobileSearchPanel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => mobileSearchInput?.focus());
};
const closeMobileSearch = () => {
  if (!mobileSearchPanel) return;
  mobileSearchPanel.classList.remove('open');
  mobileSearchPanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
mobileSearchTrigger?.addEventListener('click', openMobileSearch);
mobileSearchClose?.addEventListener('click', closeMobileSearch);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileSearchPanel?.classList.contains('open')) closeMobileSearch();
});
wireMobileSearchFilter(mobileSearchPanel, mobileSearchInput);

const backToTop = $('#back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const toggleBackToTop = () => backToTop.classList.toggle('show', window.scrollY > 480);
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}

$$('.footer-col').forEach(col => {
  const toggle = $('.footer-col-toggle', col);
  toggle?.addEventListener('click', () => {
    const open = col.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
});

$$('.faq-item').forEach((item, index) => {
  const question = $('.faq-question', item);
  const answer = $('.faq-answer', item);
  if (!question || !answer) return;
  const answerId = `faq-answer-${index + 1}`;
  answer.id = answerId;
  question.setAttribute('aria-controls', answerId);
  question.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    $$('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        $('.faq-question', openItem)?.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', willOpen);
    question.setAttribute('aria-expanded', String(willOpen));
  });
});

$$('.trip-wishlist').forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const active = button.classList.toggle('active');
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '♥' : '♡';
    button.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
  });
});

$$('.trip-card[data-url]').forEach(card => {
  const openTrip = event => {
    if (event.target.closest('button')) return;
    window.location.href = card.dataset.url;
  };
  card.addEventListener('click', openTrip);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter') openTrip(event);
  });
});

function handleSearch(input, button) {
  const submit = () => {
    const query = input?.value.trim().toLowerCase();
    if (!query) {
      input?.focus();
      return;
    }
    const match = $$('.destination-card, .trip-card').find(card => card.textContent.toLowerCase().includes(query));
    (match || $('#destinations'))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    match?.animate([
      { boxShadow: '0 0 0 0 rgba(251,207,8,0)' },
      { boxShadow: '0 0 0 6px rgba(251,207,8,.75)' },
      { boxShadow: '0 0 0 0 rgba(251,207,8,0)' }
    ], { duration: 900 });
  };
  button?.addEventListener('click', submit);
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') submit();
  });
}
handleSearch($('.hero-search-input'), $('.hero-search-btn'));
handleSearch($('#search-input'));

const heroSearchWrap=$('.hero-search-wrap'),heroSearchInput=$('.hero-search-input');
const setHeroSuggestions=open=>{heroSearchWrap?.classList.toggle('is-open',open);heroSearchInput?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('hero-search-active',open)};
heroSearchInput?.addEventListener('focus',()=>setHeroSuggestions(true));
heroSearchInput?.addEventListener('input',()=>{const query=heroSearchInput.value.trim().toLowerCase();$$('.hero-suggestions [data-hero-query]').forEach(item=>item.hidden=query&&!item.dataset.heroQuery.toLowerCase().includes(query));setHeroSuggestions(true)});
$$('[data-hero-query]').forEach(item=>item.addEventListener('click',()=>{heroSearchInput.value=item.dataset.heroQuery;setHeroSuggestions(false);$('.hero-search-btn')?.click()}));
document.addEventListener('click',event=>{if(!event.target.closest('.hero-search-wrap')&&!event.target.closest('.hero-quick-picks'))setHeroSuggestions(false)});
heroSearchInput?.addEventListener('keydown',event=>{if(event.key==='Escape'){setHeroSuggestions(false);heroSearchInput.blur()}});

const headerSearchInput=$('#search-input'),headerSearchPanel=$('#search-suggestions');
const setHeaderSearchOpen=open=>{headerSearchPanel?.classList.toggle('open',open);headerSearchInput?.setAttribute('aria-expanded',String(open))};
headerSearchInput?.addEventListener('focus',()=>setHeaderSearchOpen(true));
headerSearchInput?.addEventListener('click',()=>setHeaderSearchOpen(true));
document.addEventListener('click',event=>{if(!event.target.closest('.header-search'))setHeaderSearchOpen(false)});
headerSearchInput?.addEventListener('keydown',event=>{if(event.key==='Escape'){setHeaderSearchOpen(false);headerSearchInput.blur()}});

function syncAuthButton() {
  const btn = $('#login-btn');
  if (!btn) return;
  let user = null;
  try { user = JSON.parse(localStorage.getItem('travelenfield-user') || 'null'); } catch {}
  if (user) {
    btn.textContent = 'My Profile';
    btn.onclick = () => { window.location.href = '/profile'; };
  } else {
    btn.textContent = 'Login';
    btn.onclick = () => setLoginPopup(true);
  }
}
syncAuthButton();
document.addEventListener('travelenfield:login', syncAuthButton);

async function restoreSession() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (response.ok) {
      const result = await response.json();
      if (result.user) localStorage.setItem('travelenfield-user', JSON.stringify(result.user));
    } else {
      localStorage.removeItem('travelenfield-user');
    }
  } catch { /* Server unreachable — keep cached session for display. */ }
  syncAuthButton();
  syncMobileProfile();
}
restoreSession();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep the hero message useful without motion, then rotate short trust signals
// for visitors who have not requested reduced motion.
const heroTrustText = $('#hero-trust-text');
const heroTrustMessages = [
  'Transparent prices. No hidden surprises.',
  'Verified stays and experienced trip captains.',
  'Real human support before and during your trip.',
  'Flexible departures and custom-made routes.'
];
if (heroTrustText && !reduceMotion) {
  let messageIndex = 0;
  let characterIndex = heroTrustMessages[0].length;
  let deleting = true;
  const typeTrustMessage = () => {
    const message = heroTrustMessages[messageIndex];
    characterIndex += deleting ? -1 : 1;
    heroTrustText.textContent = message.slice(0, characterIndex);

    let delay = deleting ? 28 : 48;
    if (!deleting && characterIndex === message.length) {
      deleting = true;
      delay = 2100;
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      messageIndex = (messageIndex + 1) % heroTrustMessages.length;
      delay = 260;
    }
    window.setTimeout(typeTrustMessage, delay);
  };
  window.setTimeout(typeTrustMessage, 2200);
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = $$('.section, .social-banner, .promo-banner');
  revealTargets.forEach(element => element.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px' });
  revealTargets.forEach(element => observer.observe(element));
}

// Image-only campaign carousel. It auto-advances and pauses while being explored.
const campaignSlider = $('#campaign-slider');
if (campaignSlider) {
  const track = $('#campaign-track');
  const slides = $$('.campaign-slide', campaignSlider);
  let campaignIndex = 0;
  let campaignTimer;

  const showCampaign = index => {
    campaignIndex = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${campaignIndex * 100}%,0,0)`;
    slides.forEach((slide, i) => {
      const active = i === campaignIndex;
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
    });
  };
  const stopCampaigns = () => window.clearInterval(campaignTimer);
  const startCampaigns = () => {
    stopCampaigns();
    if (!reduceMotion) campaignTimer = window.setInterval(() => showCampaign(campaignIndex + 1), 4500);
  };

  campaignSlider.addEventListener('mouseenter', stopCampaigns);
  campaignSlider.addEventListener('mouseleave', startCampaigns);
  campaignSlider.addEventListener('focusin', stopCampaigns);
  campaignSlider.addEventListener('focusout', startCampaigns);
  document.addEventListener('visibilitychange', () => document.hidden ? stopCampaigns() : startCampaigns());
  showCampaign(0);
  startCampaigns();
}
