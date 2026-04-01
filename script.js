/* ═══════════════════════════════════════════
   RESTAURANT FEEDBACK — script.js
   ═══════════════════════════════════════════ */
'use strict';

const WEBHOOK_URL = 'https://hook.eu1.make.com/lw2a19ge56y3mtp4imbe7cxfalbnxsyi';

const restaurantID = new URLSearchParams(window.location.search).get('restaurant') || 'unknown';

// ── הוסף כאן מסעדות חדשות ──────────────────
const GOOGLE_LINKS = {
  'savor': 'https://www.google.com/maps/place/Savor/@32.7227651,35.3171106,17.78z/data=!4m8!3m7!1s0x151c4f0041414f2d:0xba250c48b9f5eec3!8m2!3d32.7249122!4d35.3188997!9m1!1b1!16s%2Fg%2F11yqx_dk0p?authuser=0&entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D',
  // 'burgeria': 'https://maps.google.com/?...',
};

let selectedRating = 0;
let currentLang    = 'he';

const i18n = {
  he: {
    dir: 'rtl',
    question:         'איך הייתה החוויה שלך?',
    tap_hint:         'הקש על כוכב לדירוג',
    positive_msg:     'שמחים שנהנית! 🙌',
    negative_msg:     'נרצה להשתפר עבורך',
    google_btn:       'שתף ביקורת בגוגל ⭐',
    google_btn_small: 'השאר ביקורת בגוגל',
    send_feedback:    'שלח משוב',
    send_note:        'שלח והעתק לגוגל 🚀',
    note_placeholder: 'שתף את החוויה שלך... (נעתיק אותה לגוגל בשבילך!)',
    what_went_wrong:  'ספר לנו מה לא הלך...',
    thanks_title:     'תודה על המשוב שלך! 🙌',
    thanks_sub:       'המשוב שלך חשוב לנו מאד',
    copied_msg:       '✅ הטקסט הועתק! כעת הדבק אותו בגוגל ועזור לנו לגדול 🚀',
    google_paste_btn: '📋 הדבק את הביקורת שלך בגוגל',
    sending:          'שולח...',
    skip_google:      'דלג על גוגל',
  },
  ar: {
    dir: 'rtl',
    question:         'كيف كانت تجربتك؟',
    tap_hint:         'اضغط على نجمة للتقييم',
    positive_msg:     'يسعدنا أنك استمتعت! 🙌',
    negative_msg:     'نريد التحسن من أجلك',
    google_btn:       'شارك تقييمك على جوجل ⭐',
    google_btn_small: 'اترك تقييماً على جوجل',
    send_feedback:    'أرسل التعليق',
    send_note:        'أرسل وانسخ على جوجل 🚀',
    note_placeholder: 'شارك تجربتك... (سننسخها لجوجل تلقائياً!)',
    what_went_wrong:  'أخبرنا بما حدث...',
    thanks_title:     'شكراً على تعليقك! 🙌',
    thanks_sub:       'رأيك يهمنا كثيراً',
    copied_msg:       '✅ تم النسخ! الصقه على جوجل وادعمنا 🚀',
    google_paste_btn: '📋 الصق تقييمك على جوجل',
    sending:          'جارٍ الإرسال...',
    skip_google:      'تخطي جوجل',
  },
  en: {
    dir: 'ltr',
    question:         'How was your experience?',
    tap_hint:         'Tap a star to rate',
    positive_msg:     "We're glad you enjoyed it! 🙌",
    negative_msg:     'We want to improve for you',
    google_btn:       'Leave a review on Google ⭐',
    google_btn_small: 'Leave a review on Google',
    send_feedback:    'Send feedback',
    send_note:        'Send & copy to Google 🚀',
    note_placeholder: 'Share your experience... (we\'ll copy it to Google for you!)',
    what_went_wrong:  'Tell us what went wrong...',
    thanks_title:     'Thank you for your feedback! 🙌',
    thanks_sub:       'Your feedback means a lot to us',
    copied_msg:       '✅ Copied! Paste it on Google and support us 🚀',
    google_paste_btn: '📋 Paste your review on Google',
    sending:          'Sending...',
    skip_google:      'Skip Google',
  },
};

const html     = document.documentElement;
const stars    = document.querySelectorAll('.star');
const screens  = document.querySelectorAll('.screen');
const langBtns = document.querySelectorAll('.lang-btn');

const highBlock      = document.getElementById('high-rating-block');
const lowBlock       = document.getElementById('low-rating-block');
const googleLinkHigh = document.getElementById('google-link-high');
const googleLinkLow  = document.getElementById('google-link-low');
const commentHigh    = document.getElementById('comment-high');
const commentLow     = document.getElementById('comment-low');
const sendHighBtn    = document.getElementById('send-high-btn');
const sendLowBtn     = document.getElementById('send-low-btn');

function getGoogleURL() {
  return GOOGLE_LINKS[restaurantID] || GOOGLE_LINKS['locanda'];
}

function setLang(lang) {
  currentLang = lang;
  const t = i18n[lang];
  html.setAttribute('lang', lang);
  html.setAttribute('dir', t.dir);
  html.setAttribute('data-lang', lang);
  document.body.setAttribute('dir', t.dir);
  document.querySelectorAll('textarea').forEach(el => {
    el.setAttribute('dir', t.dir);
    el.style.textAlign = t.dir === 'rtl' ? 'right' : 'left';
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });
  langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  const starsRow = document.getElementById('stars-row');
  if (starsRow) starsRow.style.flexDirection = t.dir === 'rtl' ? 'row-reverse' : 'row';
}

langBtns.forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

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
  star.addEventListener('touchstart', e => { e.preventDefault(); highlightStars(val); }, { passive: false });
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

function showFeedbackScreen(rating) {
  const url = getGoogleURL();
  googleLinkHigh.href = url;
  googleLinkLow.href  = url;
  if (rating >= 4) {
    highBlock.classList.remove('hidden');
    lowBlock.classList.add('hidden');
  } else {
    lowBlock.classList.remove('hidden');
    highBlock.classList.add('hidden');
  }
  goTo('screen-feedback');
}

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

async function sendWebhook(comment, priority) {
  const ts = buildTimestamp();
  const payload = {
    restaurant_id:      restaurantID,
    rating:             selectedRating,
    rating_label:       `${selectedRating} / 5`,
    comment:            comment || '—',
    language:           currentLang,
    priority:           priority || 'normal',
    timestamp_iso:      ts.iso,
    timestamp_readable: ts.readable,
  };
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Webhook failed:', err);
  }
}

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
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += Math.cos(frame / 20 + p.d) + 2;
      p.x += Math.sin(frame / 30) * 0.5;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r / 2, p.tilt * 0.1, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  }
  draw();
}

// ── Show thanks screen with confetti + copy ───
function showThanksWithCopy(comment, isHigh) {
  const t = i18n[currentLang];
  const thanksScreen = document.getElementById('screen-thanks');

  if (isHigh && comment) {
    copyToClipboard(comment).then(copied => {
      const msgEl = document.getElementById('thanks-copy-msg');
      const googleBtn = document.getElementById('thanks-google-btn');
      const skipBtn = document.getElementById('thanks-skip-btn');

      if (msgEl) {
        msgEl.textContent = copied ? t.copied_msg : t.thanks_sub;
        msgEl.style.display = 'block';
      }
      if (googleBtn) {
        googleBtn.textContent = t.google_paste_btn;
        googleBtn.href = getGoogleURL();
        googleBtn.style.display = 'flex';
        googleBtn.onclick = (e) => {
          e.preventDefault();
          window.open(getGoogleURL(), '_blank');
        };
      }
      if (skipBtn) {
        skipBtn.textContent = t.skip_google;
        skipBtn.style.display = 'block';
      }
    });
    launchConfetti();
  } else {
    const msgEl = document.getElementById('thanks-copy-msg');
    const googleBtn = document.getElementById('thanks-google-btn');
    const skipBtn = document.getElementById('thanks-skip-btn');
    if (msgEl) msgEl.style.display = 'none';
    if (googleBtn) googleBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = 'none';
  }

  goTo('screen-thanks');
}

function setBtnLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn._originalText = btn.textContent;
    btn.textContent = i18n[currentLang].sending;
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = btn._originalText;
  }
}

// High rating: send note + copy + confetti
sendHighBtn.addEventListener('click', async () => {
  if (sendHighBtn.disabled) return;
  const comment = commentHigh.value.trim();
  setBtnLoading(sendHighBtn, true);
  await sendWebhook(comment, 'positive');
  showThanksWithCopy(comment, true);
});

// High rating: direct Google button
googleLinkHigh.addEventListener('click', (e) => {
  e.preventDefault();
  const comment = commentHigh.value.trim();
  sendWebhook(comment, 'positive');
  if (comment) {
    copyToClipboard(comment).then(() => {
      window.open(getGoogleURL(), '_blank');
      showThanksWithCopy(comment, true);
    });
  } else {
    window.open(getGoogleURL(), '_blank');
    goTo('screen-thanks');
  }
});

// Low rating: send feedback
sendLowBtn.addEventListener('click', async () => {
  if (sendLowBtn.disabled) return;
  const comment = commentLow.value.trim();
  setBtnLoading(sendLowBtn, true);
  await sendWebhook(comment, 'urgent');
  showThanksWithCopy('', false);
});

// Low rating: Google button (always available)
googleLinkLow.addEventListener('click', (e) => {
  e.preventDefault();
  sendWebhook(commentLow.value.trim(), 'normal');
  window.open(getGoogleURL(), '_blank');
  goTo('screen-thanks');
});

setLang('he');
