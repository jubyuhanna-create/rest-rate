/* ═══════════════════════════════════════════
   RESTAURANT FEEDBACK — script.js
   ═══════════════════════════════════════════ */

'use strict';

// ── Config ──────────────────────────────────
const WEBHOOK_URL = 'https://hook.eu1.make.com/lw2a19ge56y3mtp4imbe7cxfalbnxsyi';

// ── הוסף כאן מסעדות חדשות ──────────────────
// 'restaurant_id': 'קישור Google Reviews'
const GOOGLE_LINKS = {
  'locanda':  'https://www.google.com/maps/place/Locanda+-+%D7%9C%D7%95%D7%A7%D7%A0%D7%93%D7%94+%D7%A0%D7%A6%D7%A8%D7%AA%E2%80%AD/@32.7029821,35.3114171,18z/data=!4m8!3m7!1s0x151c4e85c55e452f:0xdfd9f5d92e6d5805!8m2!3d32.7027778!4d35.3116667!9m1!1b1!16s%2Fg%2F11g6yqmcv8?authuser=0&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D',
  // 'burgeria':  'https://maps.google.com/?...',
  // 'pizzaroma': 'https://maps.google.com/?...',
};

const GOOGLE_REVIEW = GOOGLE_LINKS[restaurantID] || GOOGLE_LINKS['locanda'];

// ── State ────────────────────────────────────
const restaurantID  = new URLSearchParams(window.location.search).get('restaurant') || 'unknown';
let   selectedRating = 0;
let   currentLang    = 'he';

// ── i18n strings ─────────────────────────────
const i18n = {
  he: {
    dir: 'rtl',
    question:         'איך הייתה החוויה שלך?',
    tap_hint:         'הקש על כוכב לדירוג',
    positive_msg:     'שמחים שנהנית! 🙌',
    negative_msg:     'נרצה להשתפר עבורך',
    google_btn:       'שתף ביקורת בגוגל',
    send_feedback:    'שלח משוב',
    send_note:        'שלח הערה',
    note_placeholder: 'הוסף הערה (אופציונלי)...',
    what_went_wrong:  'ספר לנו מה לא הלך...',
    thanks_title:     'תודה על המשוב שלך! 🙌',
    thanks_sub:       'המשוב שלך חשוב לנו מאד',
    sending:          'שולח...',
  },
  ar: {
    dir: 'rtl',
    question:         'كيف كانت تجربتك؟',
    tap_hint:         'اضغط على نجمة للتقييم',
    positive_msg:     'يسعدنا أنك استمتعت! 🙌',
    negative_msg:     'نريد التحسن من أجلك',
    google_btn:       'شارك تقييمك على جوجل',
    send_feedback:    'أرسل التعليق',
    send_note:        'أرسل ملاحظة',
    note_placeholder: 'أضف ملاحظة (اختياري)...',
    what_went_wrong:  'أخبرنا بما حدث...',
    thanks_title:     'شكراً على تعليقك! 🙌',
    thanks_sub:       'رأيك يهمنا كثيراً',
    sending:          'جارٍ الإرسال...',
  },
  en: {
    dir: 'ltr',
    question:         'How was your experience?',
    tap_hint:         'Tap a star to rate',
    positive_msg:     "We're glad you enjoyed it! 🙌",
    negative_msg:     'We want to improve for you',
    google_btn:       'Share your review on Google',
    send_feedback:    'Send feedback',
    send_note:        'Send note',
    note_placeholder: 'Add a note (optional)...',
    what_went_wrong:  'Tell us what went wrong...',
    thanks_title:     'Thank you for your feedback! 🙌',
    thanks_sub:       'Your feedback means a lot to us',
    sending:          'Sending...',
  },
};

// ── DOM refs ─────────────────────────────────
const html           = document.documentElement;
const stars          = document.querySelectorAll('.star');
const screens        = document.querySelectorAll('.screen');
const langBtns       = document.querySelectorAll('.lang-btn');

const highBlock      = document.getElementById('high-rating-block');
const lowBlock       = document.getElementById('low-rating-block');

const googleLinkHigh = document.getElementById('google-link-high');
const googleLinkLow  = document.getElementById('google-link-low');

const commentHigh    = document.getElementById('comment-high');
const commentLow     = document.getElementById('comment-low');

const sendHighBtn    = document.getElementById('send-high-btn');
const sendLowBtn     = document.getElementById('send-low-btn');

// ── Language ──────────────────────────────────
function setLang(lang) {
  currentLang = lang;
  const t = i18n[lang];

  // Set direction and font
  html.setAttribute('lang', lang);
  html.setAttribute('dir', t.dir);
  html.setAttribute('data-lang', lang);

  // Translate all text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });

  // Active button state
  langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));

  // Force font re-render so Arabic/Hebrew fonts load correctly
  document.body.classList.remove('lang-applied');
  requestAnimationFrame(() => document.body.classList.add('lang-applied'));
}

langBtns.forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// ── Screen transitions ────────────────────────
function goTo(screenId) {
  const target = document.getElementById(screenId);

  screens.forEach(s => {
    if (s.classList.contains('active')) {
      s.classList.add('exit');
      s.classList.remove('active');
      setTimeout(() => s.classList.remove('exit'), 400);
    }
  });

  setTimeout(() => {
    target.classList.add('active');
  }, 60);
}

// ── Star rating ───────────────────────────────
function highlightStars(value) {
  stars.forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle('selected', v <= value);
    s.classList.toggle('hovered', v <= value);
  });
}

function resetStarHover() {
  stars.forEach(s => {
    s.classList.remove('hovered');
    if (selectedRating > 0) {
      s.classList.toggle('selected', parseInt(s.dataset.val) <= selectedRating);
    }
  });
}

stars.forEach(star => {
  const val = parseInt(star.dataset.val);

  star.addEventListener('mouseenter', () => highlightStars(val));
  star.addEventListener('mouseleave', resetStarHover);

  star.addEventListener('click', () => {
    selectedRating = val;
    stars.forEach(s => {
      if (parseInt(s.dataset.val) <= val) {
        s.classList.add('pop');
        setTimeout(() => s.classList.remove('pop'), 350);
      }
    });
    highlightStars(val);
    setTimeout(() => showFeedbackScreen(val), 420);
  });

  star.addEventListener('touchstart', e => {
    e.preventDefault();
    highlightStars(val);
  }, { passive: false });

  star.addEventListener('touchend', e => {
    e.preventDefault();
    selectedRating = val;
    stars.forEach(s => {
      if (parseInt(s.dataset.val) <= val) {
        s.classList.add('pop');
        setTimeout(() => s.classList.remove('pop'), 350);
      }
    });
    highlightStars(val);
    setTimeout(() => showFeedbackScreen(val), 420);
  }, { passive: false });
});

// ── Show feedback screen ──────────────────────
function showFeedbackScreen(rating) {
  googleLinkHigh.href = GOOGLE_REVIEW;
  googleLinkLow.href  = GOOGLE_REVIEW;

  if (rating >= 4) {
    highBlock.classList.remove('hidden');
    lowBlock.classList.add('hidden');
  } else {
    lowBlock.classList.remove('hidden');
    highBlock.classList.add('hidden');
  }

  goTo('screen-feedback');
}

// ── Timestamp builder ─────────────────────────
function buildTimestamp() {
  const now    = new Date();
  const offset = -now.getTimezoneOffset();
  const sign   = offset >= 0 ? '+' : '-';
  const hh     = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mm     = String(Math.abs(offset) % 60).padStart(2, '0');
  const local  = now.toLocaleString('en-GB', {
    day:    '2-digit', month:  '2-digit', year:   'numeric',
    hour:   '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  return {
    iso:      now.toISOString(),
    readable: `${local} (UTC${sign}${hh}:${mm})`,
  };
}

function getCurrentComment() {
  if (selectedRating >= 4) return commentHigh.value.trim();
  return commentLow.value.trim();
}

// ── Send to webhook ───────────────────────────
async function sendWebhook(comment) {
  const ts = buildTimestamp();

  const payload = {
    restaurant_id:      restaurantID,
    rating:             selectedRating,
    rating_label:       `${selectedRating} / 5`,
    comment:            comment || '—',
    language:           currentLang,
    timestamp_iso:      ts.iso,
    timestamp_readable: ts.readable,
  };

  try {
    await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Webhook failed:', err);
  }
}

// ── Button loading state ──────────────────────
function setBtnLoading(btn, loading) {
  const t = i18n[currentLang];
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn._originalText = btn.textContent;
    btn.textContent = t.sending;
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = btn._originalText;
  }
}

// ── Send handlers ─────────────────────────────
async function handleSend(btn, getComment) {
  if (btn.disabled) return;
  const comment = getComment();
  setBtnLoading(btn, true);
  await sendWebhook(comment);
  goTo('screen-thanks');
}

sendHighBtn.addEventListener('click', () =>
  handleSend(sendHighBtn, () => commentHigh.value.trim())
);

sendLowBtn.addEventListener('click', () =>
  handleSend(sendLowBtn, () => commentLow.value.trim())
);

// Google links — fire webhook silently then open Google
[googleLinkHigh, googleLinkLow].forEach(link => {
  link.addEventListener('click', () => {
    sendWebhook(getCurrentComment());
  });
});

// ── Init ──────────────────────────────────────
setLang('he');