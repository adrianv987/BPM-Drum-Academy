/* ── Soundwave Canvas ── */
const canvas = document.getElementById('soundwaveCanvas');
const ctx = canvas.getContext('2d');

let animFrame;
let width, height;
const waves = [
  { amp: 28, freq: 0.012, speed: 0.018, phase: 0, alpha: 0.22, lineWidth: 1.5 },
  { amp: 16, freq: 0.022, speed: 0.026, phase: 1.8, alpha: 0.14, lineWidth: 1 },
  { amp: 40, freq: 0.008, speed: 0.011, phase: 0.6, alpha: 0.1, lineWidth: 2 },
  { amp: 10, freq: 0.036, speed: 0.042, phase: 3.2, alpha: 0.08, lineWidth: 0.8 },
];

function resizeCanvas() {
  width = canvas.width = canvas.offsetWidth;
  height = canvas.height = canvas.offsetHeight;
}

function drawWaves(ts) {
  ctx.clearRect(0, 0, width, height);
  const t = ts * 0.001;
  const centerY = height * 0.62;

  waves.forEach(w => {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,102,0,${w.alpha})`;
    ctx.lineWidth = w.lineWidth;
    ctx.shadowBlur = 0;

    for (let x = 0; x <= width; x += 2) {
      const y = centerY + Math.sin(x * w.freq + t * w.speed * 60 + w.phase) * w.amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  /* glow line */
  const glowW = waves[0];
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, 'rgba(255,102,0,0)');
  grad.addColorStop(0.35, 'rgba(255,102,0,0.35)');
  grad.addColorStop(0.65, 'rgba(255,102,0,0.35)');
  grad.addColorStop(1, 'rgba(255,102,0,0)');

  ctx.beginPath();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(255,102,0,0.5)';

  for (let x = 0; x <= width; x += 2) {
    const y = centerY + Math.sin(x * glowW.freq + t * glowW.speed * 60 + glowW.phase) * glowW.amp;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function animate(ts) {
  drawWaves(ts);
  animFrame = requestAnimationFrame(animate);
}

resizeCanvas();
requestAnimationFrame(animate);

const ro = new ResizeObserver(resizeCanvas);
ro.observe(canvas);

/* ── Sticky Nav ── */
const navbar = document.getElementById('navbar');
function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ── Mobile Nav Toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Scroll Animations ── */
const animElements = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    /* stagger siblings in same parent */
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.animate-on-scroll'));
    const idx = siblings.indexOf(entry.target);
    const delay = Math.min(idx * 80, 320);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animElements.forEach(el => observer.observe(el));

/* ── Back to Top ── */
/* ── Contact Form — Custom Validation & Submission ── */

const contactForm = document.getElementById('contactForm');

if (contactForm) {

  /* ── Field references ── */
  const fields = {
    name: { el: document.getElementById('name'), err: document.getElementById('error-name') },
    email: { el: document.getElementById('email'), err: document.getElementById('error-email') },
    mobile: { el: document.getElementById('mobile'), err: document.getElementById('error-mobile') },
    experience: { el: document.getElementById('experience'), err: document.getElementById('error-experience') },
    message: { el: document.getElementById('message'), err: document.getElementById('error-message') },
  };

  const submitBtn = document.getElementById('submitBtn');
  const btnLabel = submitBtn.querySelector('.btn-label');
  const iconSend = submitBtn.querySelector('.btn-icon-send');
  const iconSpinner = submitBtn.querySelector('.btn-icon-spinner');
  const successMsg = document.getElementById('formSuccess');

  /* ── Validation rules ── */
  function validate() {
    let valid = true;

    const rules = [
      {
        key: 'name',
        test: v => v.trim().length >= 2,
        msg: 'Please enter your name.',
      },
      {
        key: 'email',
        test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        msg: 'Please enter a valid email address.',
      },
      {
        key: 'mobile',
        test: v => {
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 11;
        },
        msg: 'Please enter a valid Australian mobile number.',
      },
      {
        key: 'experience',
        test: v => v !== '',
        msg: 'Please select your experience level.',
      },
      {
        key: 'message',
        test: v => v.trim().length >= 10,
        msg: 'Please include a short message (at least 10 characters).',
      },
    ];

    rules.forEach(({ key, test, msg }) => {
      const { el, err } = fields[key];
      const value = el.value;
      if (!test(value)) {
        showError(el, err, msg);
        valid = false;
      } else {
        clearError(el, err);
      }
    });

    return valid;
  }

  /* ── Error helpers ── */
  function showError(el, errEl, msg) {
    el.classList.add('field-error');
    errEl.textContent = msg;
    errEl.classList.add('visible');
  }

  function clearError(el, errEl) {
    el.classList.remove('field-error');
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }

  /* ── Live clearing: remove error as soon as field becomes valid ── */
  Object.values(fields).forEach(({ el, err }) => {
    const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventType, () => {
      if (el.classList.contains('field-error')) {
        /* only clear if field now has content */
        if (el.value.trim() !== '') {
          clearError(el, err);
        }
      }
    });

    /* also clear on blur once user leaves the field */
    el.addEventListener('blur', () => {
      if (el.classList.contains('field-error') && el.value.trim() !== '') {
        clearError(el, err);
      }
    });
  });

  /* ── Button state helpers ── */
  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      btnLabel.textContent = 'Sending…';
      iconSend.style.display = 'none';
      iconSpinner.style.display = 'block';
    } else {
      iconSend.style.display = '';
      iconSpinner.style.display = 'none';
    }
  }

  function setSuccess() {
    btnLabel.textContent = 'Enquiry Sent!';
    iconSend.style.display = '';
    iconSpinner.style.display = 'none';
    submitBtn.disabled = true;

    /* Fade in success banner */
    successMsg.style.display = 'flex';
  }

  function resetButton() {
    submitBtn.disabled = false;
    btnLabel.textContent = 'Send Enquiry';
    iconSend.style.display = '';
    iconSpinner.style.display = 'none';
    successMsg.style.display = 'none';
  }

  /* ── Submit ── */
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Validate first — if any errors, stop here */
    if (!validate()) {
      /* Scroll to first error field */
      const firstErrorField = contactForm.querySelector('.field-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus({ preventScroll: true });
      }
      return;
    }

    setLoading(true);

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setSuccess();
        contactForm.reset();

        /* Auto-reset button label after 6s, but keep success message visible */
        setTimeout(() => {
          submitBtn.disabled = false;
          btnLabel.textContent = 'Send Enquiry';
        }, 6000);

      } else {
        /* Server error */
        setLoading(false);
        btnLabel.textContent = 'Something went wrong — try again';
        setTimeout(resetButton, 4000);
      }

    } catch {
      /* Network error */
      setLoading(false);
      btnLabel.textContent = 'Connection error — try again';
      setTimeout(resetButton, 4000);
    }
  });
}