/* ═══════════════════════════════════════════
   RESTAURANT FEEDBACK — script.js
   Every rating gets the SAME Google option (no review gating).
   ═══════════════════════════════════════════ */
'use strict';

const WEBHOOK_URL = 'https://hook.eu1.make.com/lw2a19ge56y3mtp4imbe7cxfalbnxsyi';

// ── Add new restaurants here ──────────────────
// placeId: opens Google's "write a review" box directly (best).
//          Find it at: https://developers.google.com/maps/documentation/places/web-service/place-id
// mapsUrl: fallback if you don't have the placeId yet.
const RESTAURANTS = {
  'savor': {
    placeId: '', // ← paste Savor's Place ID here (starts with ChIJ...)
    mapsUrl: 'https://www.google.com/maps/place/Savor/@32.7227651,35.3171106,17.78z/data=!4m8!3m7!1s0x151c4f0041414f2d:0xba250c48b9f5eec3!8m2!3d32.7249122!4d35.3188997!9m1!1b1!16s%2Fg%2F11yqx_dk0p',
  },
  // 'burgeria': { placeId: 'ChIJ...', mapsUrl: '' },
};

const restaurantID = new URLSearchParams(window.location.search).get('restaurant') || 'unknown';
const restaurant   = RESTAURANTS[restaurantID] || Object.values(RESTAURANTS)[0];

function getGoogleURL() {
  if (restaurant.placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(restaurant.placeId)}`;
  }
  return restaurant.mapsUrl;
}

let selectedRating = 0;
let currentLang    = 'he';

const i18n = {
  he: {
    dir: 'rtl',
    question:         'איך הייתה החוויה שלך?',
    tap_hint:         'הקש על כוכב לדירוג',
    title_high:       'שמחים שנהנית!',
    title_low:        'תודה על הכנות, נשמח לשמוע',
    placeholder:      'ספר לנו במילים שלך... (אפשר להקיש על התגיות למעלה)',
    google_btn:       '⭐ העתק ופרסם בגוגל',
    private_btn:      '✉️ שלח רק לבעלים',
    privacy:          'המשוב נשלח לבעלי העסק בלבד ולא נאסף מידע מזהה. ביקורת בגוגל היא פומבית.',
    thanks_title:     'תודה על המשוב! 🙌',
    thanks_sub:       'המשוב שלך חשוב לנו מאוד',
    copied_msg:       '✅ הטקסט הועתק! הדבק אותו בחלון הביקורת של גוגל',
    google_paste_btn: '📋 פתח שוב את גוגל',
    sending:          'שולח...',
    chips_high: ['אוכל מעולה', 'שירות מהיר', 'צוות אדיב', 'אווירה נעימה', 'מחיר הוגן', 'נחזור שוב'],
    chips_low:  ['זמן המתנה', 'איכות האוכל', 'שירות', 'ניקיון', 'מחיר', 'רעש'],
  },
  ar: {
    dir: 'rtl',
    question:         'كيف كانت تجربتك؟',
    tap_hint:         'اضغط على نجمة للتقييم',
    title_high:       'يسعدنا أنك استمتعت!',
    title_low:        'شكراً لصراحتك، يهمنا أن نسمع',
    placeholder:      'احكِ لنا بكلماتك... (أو اضغط على الكلمات فوق)',
    google_btn:       '⭐ انسخ وانشر على جوجل',
    private_btn:      '✉️ أرسل لصاحب المكان فقط',
    privacy:          'التعليق يصل لصاحب المكان فقط ولا نجمع معلومات شخصية. تقييم جوجل يكون علنياً.',
    thanks_title:     'شكراً على تعليقك! 🙌',
    thanks_sub:       'رأيك يهمنا كثيراً',
    copied_msg:       '✅ تم النسخ! الصقه في نافذة التقييم على جوجل',
    google_paste_btn: '📋 افتح جوجل مرة ثانية',
    sending:          'جارٍ الإرسال...',
    chips_high: ['أكل ممتاز', 'خدمة سريعة', 'طاقم لطيف', 'أجواء حلوة', 'سعر معقول', 'رح نرجع'],
    chips_low:  ['وقت الانتظار', 'جودة الأكل', 'الخدمة', 'النظافة', 'السعر', 'الضجة'],
  },
  en: {
    dir: 'ltr',
    question:         'How was your experience?',
    tap_hint:         'Tap a star to rate',
    title_high:       "We're glad you enjoyed it!",
    title_low:        'Thanks for being honest, tell us more',
    placeholder:      'Tell us in your own words... (or tap the tags above)',
    google_btn:       '⭐ Copy & post on Google',
    private_btn:      '✉️ Send to the owner only',
    privacy:          'Feedback goes to the owner only; no personal data is collected. Google reviews are public.',
    thanks_title:     'Thank you for your feedback! 🙌',
    thanks_sub:       'Your feedback means a lot to us',
    copied_msg:       '✅ Copied! Paste it into the Google review box',
    google_paste_btn: '📋 Open Google again',
    sending:          'Sending...',
    chips_high: ['Great food', 'Fast service', 'Friendly staff', 'Nice vibe', 'Fair price', 'Will be back'],
    chips_low:  ['Wait time', 'Food quality', 'Service', 'Cleanliness', 'Price', 'Noise'],
  },
};

const html       = document.documentElement;
const stars      = document.querySelectorAll('.star');
const screens    = document.querySelectorAll('.screen');
const langBtns   = document.querySelectorAll('.lang-btn');
const commentEl  = document.getElementById('comment');
const chipsEl    = document.getElementById('chips');
const googleBtn  = document.getElementById('google-btn');
const privateBtn = document.getElementById('private-btn');

// ── Language ──────────────────────────────────
function setLang(lang) {
  currentLang = lang;
  const t = i18n[lang];
  html.setAttribute('lang', lang);
  html.setAttribute('dir', t.dir);
  html.setAttribute('data-lang', lang);
  document.body.setAttribute('dir', t.dir);
  commentEl.setAttribute('dir', t.dir);
  commentEl.setAttribute('placeholder', t.placeholder);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  if (selectedRating) renderFeedbackTexts();
}
langBtns.forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

// ── Screens ───────────────────────────────────
function goTo(screenId) {
  const target = document.getElementById(screenId);
  screens.forEach(s => {
    if (s.classList.contains('active')) {
      s.classList.add('exit');
      s.classList.remove('active');
      setTimeout(() => s.classList.remove('exit'), 400);
    }
  });
  setTimeout(() => target.classList.add('active'), 60);
}

// ── Stars ─────────────────────────────────────
function highlightStars(value) {
  stars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.val) <= value));
}

function pickRating(val) {
  selectedRating = val;
  stars.forEach(s => {
    if (parseInt(s.dataset.val) <= val) {
      s.classList.add('pop');
      setTimeout(() => s.classList.remove('pop'), 350);
    }
  });
  highlightStars(val);
  setTimeout(showFeedbackScreen, 420);
}

stars.forEach(star => {
  const val = parseInt(star.dataset.val);
  star.addEventListener('mouseenter', () => highlightStars(val));
  star.addEventListener('mouseleave', () => highlightStars(selectedRating));
  star.addEventListener('click', () => pickRating(val));
  star.addEventListener('touchend', e => { e.preventDefault(); pickRating(val); }, { passive: false });
});

// ── Feedback screen (identical options for all ratings) ──
function renderFeedbackTexts() {
  const t = i18n[currentLang];
  const high = selectedRating >= 4;
  document.getElementById('fb-emoji').textContent = high ? '🙌' : '🙏';
  document.getElementById('fb-title').textContent = high ? t.title_high : t.title_low;

  chipsEl.innerHTML = '';
  (high ? t.chips_high : t.chips_low).forEach(label => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => toggleChip(chip, label));
    chipsEl.appendChild(chip);
  });
}

function toggleChip(chip, label) {
  const on = chip.classList.toggle('on');
  let parts = commentEl.value.split(/[,،]\s*/).map(p => p.trim()).filter(Boolean);
  parts = on ? [...parts, label] : parts.filter(p => p !== label);
  commentEl.value = parts.join(currentLang === 'ar' ? '، ' : ', ');
}

function showFeedbackScreen() {
  commentEl.value = '';
  renderFeedbackTexts();
  goTo('screen-feedback');
}

// ── Webhook ───────────────────────────────────
function buildTimestamp() {
  const now    = new Date();
  const offset = -now.getTimezoneOffset();
  const sign   = offset >= 0 ? '+' : '-';
  const hh     = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mm     = String(Math.abs(offset) % 60).padStart(2, '0');
  const local  = now.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  return { iso: now.toISOString(), readable: `${local} (UTC${sign}${hh}:${mm})` };
}

function sendWebhook(comment, destination) {
  const ts = buildTimestamp();
  const payload = {
    restaurant_id:      restaurantID,
    rating:             selectedRating,
    rating_label:       `${selectedRating} / 5`,
    comment:            comment || '—',
    language:           currentLang,
    destination,                                   // 'google' | 'private'
    priority:           selectedRating <= 3 ? 'urgent' : 'positive',
    timestamp_iso:      ts.iso,
    timestamp_readable: ts.readable,
  };
  return fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(err => console.warn('Webhook failed:', err));
}

// ── Clipboard ─────────────────────────────────
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch { return false; }
  }
}

// ── Confetti ──────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 80 + 20,
    color: ['#f5a623','#2563eb','#10b981','#f43f5e','#a855f7'][Math.floor(Math.random()*5)],
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));
  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += Math.cos(frame / 20 + p.d) + 2;
      p.x += Math.sin(frame / 30) * 0.5;
      const tilt = Math.sin(p.tiltAngle) * 12;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x + tilt, p.y, p.r, p.r / 2, tilt * 0.1, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  })();
}

// ── Thanks screen ─────────────────────────────
function showThanks(wentToGoogle, copied) {
  const t = i18n[currentLang];
  const msgEl    = document.getElementById('thanks-copy-msg');
  const againBtn = document.getElementById('thanks-google-btn');
  if (wentToGoogle) {
    msgEl.textContent = copied ? t.copied_msg : t.thanks_sub;
    msgEl.style.display = 'block';
    againBtn.style.display = 'flex';
    againBtn.onclick = () => window.open(getGoogleURL(), '_blank');
  } else {
    msgEl.style.display = 'none';
    againBtn.style.display = 'none';
  }
  if (selectedRating >= 4) launchConfetti();
  goTo('screen-thanks');
}

// ── Buttons (same for every rating) ───────────
googleBtn.addEventListener('click', async () => {
  const comment = commentEl.value.trim();
  // Start the copy and open the tab inside the same tap, so mobile browsers allow both
  const copyPromise = comment ? copyToClipboard(comment) : Promise.resolve(false);
  window.open(getGoogleURL(), '_blank');
  const copied = await copyPromise;
  sendWebhook(comment, 'google');
  showThanks(true, copied);
});

privateBtn.addEventListener('click', async () => {
  if (privateBtn.disabled) return;
  privateBtn.disabled = true;
  privateBtn.textContent = i18n[currentLang].sending;
  await sendWebhook(commentEl.value.trim(), 'private');
  showThanks(false, false);
});

setLang('he');
