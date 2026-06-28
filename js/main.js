/* ============================================================
   KAMSIS TEKNOLOJİ — main.js
   ============================================================ */

/* ----- NAVBAR: scroll sticky ----- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ----- HAMBURGER MENU ----- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ----- SMOOTH ACTIVE NAV ----- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

const activateNav = () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const anchor = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (!anchor) return;
    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => a.style.color = '');
      anchor.style.color = 'var(--accent)';
    }
  });
};
window.addEventListener('scroll', activateNav, { passive: true });

/* ----- COUNTER ANIMATION ----- */
const counters = document.querySelectorAll('.stat-num');

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

/* ----- SCROLL REVEAL ----- */
const reveals = document.querySelectorAll(
  '.service-card, .project-card, .testi-card, .tech-category, .about-visual, .about-text, .contact-info, .contact-form'
);

reveals.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

/* ----- STAGGERED CARD ANIMATION ----- */
document.querySelectorAll('[data-delay]').forEach(el => {
  const delay = parseInt(el.dataset.delay, 10);
  el.style.transitionDelay = delay + 'ms';
});

/* ----- PARTICLES (lightweight canvas) ----- */
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  particlesContainer.appendChild(canvas);
}

let particles = [];
let raf;

const resizeCanvas = () => {
  if (!canvas.parentElement) return;
  canvas.width  = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
};

const createParticle = () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  r: Math.random() * 1.5 + 0.5,
  alpha: Math.random() * 0.5 + 0.1,
});

const initParticles = () => {
  resizeCanvas();
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
  particles = Array.from({ length: count }, createParticle);
};

const drawParticles = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(79,126,248,${p.alpha})`;
    ctx.fill();

    particles.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(79,126,248,${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  raf = requestAnimationFrame(drawParticles);
};

if (particlesContainer) {
  window.addEventListener('resize', () => { resizeCanvas(); });
  initParticles();
  drawParticles();

  const heroSection = document.getElementById('hero');
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!raf) { initParticles(); drawParticles(); }
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  });
  if (heroSection) visibilityObserver.observe(heroSection);
}

/* ----- CONTACT FORM ----- */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      shakeForm();
      return;
    }

    const btn = form.querySelector('.btn-primary');
    const btnText = btn.querySelector('.btn-text');
    btnText.textContent = 'Gönderiliyor...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
        btnText.textContent = 'Mesaj Gönder';
      } else {
        btnText.textContent = 'Hata! Tekrar deneyin';
      }
    } catch {
      btnText.textContent = 'Hata! Tekrar deneyin';
    } finally {
      btn.disabled = false;
    }
  });
}

const shakeForm = () => {
  form.style.animation = 'shake 0.4s ease';
  form.addEventListener('animationend', () => form.style.animation = '', { once: true });
};

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ----- SCROLL TO HERO on logo click ----- */
document.querySelectorAll('a[href="#hero"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ----- HERO SCROLL INDICATOR ----- */
const scrollIndicator = document.querySelector('.hero-scroll');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ----- THEME TOGGLE ----- */
const themeToggle = document.getElementById('themeToggle');
const iconMoon    = document.getElementById('iconMoon');
const iconSun     = document.getElementById('iconSun');

const applyTheme = (light) => {
  document.body.classList.toggle('light', light);
  iconMoon.style.display = light ? 'none'  : 'block';
  iconSun.style.display  = light ? 'block' : 'none';
};

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'light');

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  iconMoon.style.display = isLight ? 'none'  : 'block';
  iconSun.style.display  = isLight ? 'block' : 'none';
});

/* ----- LANGUAGE TOGGLE ----- */
const translations = {
  tr: {
    'nav.about':    'Hakkımızda',
    'nav.services': 'Hizmetler',
    'nav.projects': 'Projeler',
    'nav.tech':     'Teknolojiler',
    'nav.contact':  'İletişim',
    'hero.badge':   "2000'den beri aktif · İzmir, Türkiye",
    'hero.title':   'Teknoloji ile<br /><span class="gradient-text">Geleceği İnşa</span><br />Ediyoruz',
    'hero.desc':    'Yazılım geliştirme, siber güvenlik ve bilişim çözümlerinde 25+ yıllık deneyimle işletmenizi dijital dünyada güçlendiriyoruz.',
    'hero.cta1':    'Hizmetlerimiz',
    'hero.cta2':    'Projelerimizi Gör',
    'hero.stat1':   'Yıl Deneyim',
    'hero.stat2':   'Tamamlanan Proje',
    'hero.stat3':   'Mutlu Müşteri',
  },
  en: {
    'nav.about':    'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.tech':     'Technologies',
    'nav.contact':  'Contact',
    'hero.badge':   'Active since 2000 · Izmir, Turkey',
    'hero.title':   'Building the Future<br /><span class="gradient-text">with Technology</span>',
    'hero.desc':    'We empower your business in the digital world with 25+ years of expertise in software development, cybersecurity, and IT solutions.',
    'hero.cta1':    'Our Services',
    'hero.cta2':    'View Projects',
    'hero.stat1':   'Years of Experience',
    'hero.stat2':   'Projects Completed',
    'hero.stat3':   'Happy Clients',
  }
};

const langToggle = document.getElementById('langToggle');
let currentLang  = localStorage.getItem('lang') || 'tr';

const applyLang = (lang) => {
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  langToggle.textContent = lang === 'tr' ? 'EN' : 'TR';
  document.documentElement.lang = lang;
};

applyLang(currentLang);

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  localStorage.setItem('lang', currentLang);
  applyLang(currentLang);
});
