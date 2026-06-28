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
    /* NAV */
    'nav.about':    'Hakkımızda',
    'nav.services': 'Hizmetler',
    'nav.projects': 'Projeler',
    'nav.tech':     'Teknolojiler',
    'nav.contact':  'İletişim',
    /* HERO */
    'hero.badge':   "2000'den beri aktif · İzmir, Türkiye",
    'hero.title':   'Teknoloji ile<br /><span class="gradient-text">Geleceği İnşa</span><br />Ediyoruz',
    'hero.desc':    'Yazılım geliştirme, siber güvenlik ve bilişim çözümlerinde 25+ yıllık deneyimle işletmenizi dijital dünyada güçlendiriyoruz.',
    'hero.cta1':    'Hizmetlerimiz',
    'hero.cta2':    'Projelerimizi Gör',
    'hero.stat1':   'Yıl Deneyim',
    'hero.stat2':   'Tamamlanan Proje',
    'hero.stat3':   'Mutlu Müşteri',
    /* ABOUT */
    'about.label':  'Hakkımızda',
    'about.title':  '25 Yıllık Deneyim,<br /><span class="gradient-text">Modern Çözümler</span>',
    'about.p1':     'Kamsis Teknoloji olarak 2000 yılından bu yana işletmelerin dijital dönüşümüne öncülük ediyoruz. Yazılım geliştirmeden siber güvenliğe, web uygulamalarından otomasyon sistemlerine kadar geniş bir yelpazede hizmet sunuyoruz.',
    'about.p2':     'Suat Ayaz liderliğinde kurulmuş olan firmamız, her projede güvenlik, performans ve sürdürülebilirliği ön planda tutarak müşterilerimize uzun vadeli değer katmayı hedefler.',
    'about.f1t':    'Özel Yazılım Çözümleri',
    'about.f1d':    'İş süreçlerinize özel, ölçeklenebilir yazılımlar',
    'about.f2t':    '7/24 Destek',
    'about.f2d':    'Projeleriniz için kesintisiz teknik destek',
    'about.f3t':    'Şeffaf İletişim',
    'about.f3d':    'Proje boyunca düzenli raporlama ve bilgilendirme',
    'about.b1':     'ISO 27001 Uyumlu',
    'about.b2':     'Hızlı Teslimat',
    'about.b3':     'Güvenli Yazılım',
    /* SERVICES */
    'srv.label':    'Hizmetlerimiz',
    'srv.title':    'Ne Yapıyoruz?',
    'srv.desc':     'İşletmenizin ihtiyaçlarına göre şekillenen, uçtan uca teknoloji çözümleri',
    'srv.1.title':  'Yazılım Geliştirme',
    'srv.1.desc':   'İş süreçlerinizi dijitalleştiren, ölçeklenebilir ve güvenli özel yazılım çözümleri geliştiriyoruz. React, TypeScript, Python ve daha fazlası.',
    'srv.1.l1': 'ERP / CRM Sistemleri', 'srv.1.l2': 'İş Takip Yazılımları', 'srv.1.l3': 'Sipariş Yönetim Sistemleri', 'srv.1.l4': 'Otomasyon Araçları',
    'srv.2.badge':  'En Çok Tercih',
    'srv.2.title':  'Siber Güvenlik',
    'srv.2.desc':   'Sistemlerinizi tehditlere karşı koruyoruz. Güvenlik analizi, penetrasyon testi ve danışmanlık hizmetleriyle dijital varlıklarınızı güvence altına alıyoruz.',
    'srv.2.l1': 'Penetrasyon Testi', 'srv.2.l2': 'Güvenlik Denetimi', 'srv.2.l3': 'Güvenlik Danışmanlığı', 'srv.2.l4': 'Veri Koruma (KVKK/GDPR)',
    'srv.3.title':  'Web Geliştirme',
    'srv.3.desc':   'Modern, hızlı ve SEO uyumlu web siteleri ve uygulamaları tasarlıyoruz. Kullanıcı deneyimini ön planda tutarak markanz için değer katıyoruz.',
    'srv.3.l1': 'Kurumsal Web Siteleri', 'srv.3.l2': 'E-Ticaret Platformları', 'srv.3.l3': 'Web Uygulamaları', 'srv.3.l4': 'API Geliştirme',
    'srv.4.title':  'Mobil Uygulama',
    'srv.4.desc':   'iOS ve Android platformları için native ve cross-platform mobil uygulamalar geliştiriyoruz. Kullanıcı dostu arayüzlerle fark yaratıyoruz.',
    'srv.4.l1': 'iOS & Android Uygulamalar', 'srv.4.l2': 'Cross-Platform Geliştirme', 'srv.4.l3': 'Uygulama Bakım & Destek', 'srv.4.l4': 'App Store Yönetimi',
    'srv.5.title':  'Otomasyon & Bot',
    'srv.5.desc':   'Tekrarlayan iş süreçlerinizi otomatikleştiriyor, yapay zeka destekli botlar ve araçlarla verimliliğinizi artırıyoruz.',
    'srv.5.l1': 'İş Süreci Otomasyonu', 'srv.5.l2': 'Sosyal Medya Botları', 'srv.5.l3': 'Veri Analizi Araçları', 'srv.5.l4': 'AI Destekli Sistemler',
    'srv.6.title':  'Bilişim Danışmanlığı',
    'srv.6.desc':   'Teknoloji altyapınızı optimize ediyoruz. Donanım, yazılım ve ağ çözümleri konusunda kapsamlı danışmanlık hizmeti sunuyoruz.',
    'srv.6.l1': 'IT Altyapı Yönetimi', 'srv.6.l2': 'Bulut Çözümleri', 'srv.6.l3': 'Ağ & Sunucu Kurulumu', 'srv.6.l4': 'Teknik Destek',
    /* PROJECTS */
    'prj.label':    'Portföy',
    'prj.title':    'Öne Çıkan Projeler',
    'prj.desc':     'GitHub üzerinde paylaşılan bazı çalışmalarımız',
    'prj.1.title':  'İş Takip Yazılımı',
    'prj.1.desc':   'React + Flask ile geliştirilmiş kapsamlı iş takip ve yönetim sistemi. Görev atama, ilerleme takibi ve raporlama özellikleri içerir.',
    'prj.2.title':  'Sipariş Yönetim Sistemi',
    'prj.2.desc':   'TypeScript ile yazılmış, işletmeler için uçtan uca sipariş yönetimi çözümü. Stok takibi, fatura oluşturma ve müşteri yönetimi.',
    'prj.3.title':  'Trade Bot',
    'prj.3.desc':   'Kripto ve borsa piyasalarını anlık izleyen, teknik analiz göstergelerine göre otomatik alım-satım sinyalleri üreten yapay zeka destekli bot.',
    'prj.4.title':  'Dip Fiyat Bot',
    'prj.4.desc':   'Amazon ürün fırsatlarını otomatik olarak bulan ve sosyal medyada paylaşan akıllı bot sistemi. Fiyat takibi ve anlık bildirim özelliği.',
    'prj.5.title':  'Zamam Voting',
    'prj.5.desc':   'Blockchain tabanlı oylama sistemi. Güvenli, şeffaf ve manipülasyona karşı dirençli dijital oy kullanma platformu. 4 ⭐ aldı.',
    'prj.6.sub':    'Spor Gündemi',
    'prj.6.desc':   'Bugünkü maçlar, canlı skorlar — anında cepte. Arkadaşına skor gönder, maç bildirimlerini takip et. Futbol, basketbol ve daha fazlası.',
    'prj.6.l1': 'Tüm maçlar & canlı skorlar', 'prj.6.l2': 'Futbol · Basketbol · MMA ve daha fazlası', 'prj.6.l3': 'Arkadaşına anında skor gönder', 'prj.6.l4': 'Maç bildirimleri',
    /* TECH */
    'tech.label':   'Teknolojiler',
    'tech.title':   'Kullandığımız Araçlar',
    'tech.desc':    'Modern ve kanıtlanmış teknolojilerle çalışıyoruz',
    'tech.c3':      'Güvenlik',
    'tech.c4':      'Diğer',
    /* TESTIMONIALS */
    'tst.label':    'Referanslar',
    'tst.title':    'Müşterilerimiz Ne Diyor?',
    'tst.1.text':   '"Kamsis ile çalışmak mükemmel bir deneyimdi. İş takip yazılımımızı bize özel geliştirdiler ve teslim süresi beklentilerimizin çok üzerindeydi."',
    'tst.1.name':   'Ali Kaya',
    'tst.1.role':   'Genel Müdür, Kaya Lojistik',
    'tst.2.text':   '"Siber güvenlik danışmanlığı konusunda gerçekten uzmanlar. Sistemlerimizde ciddi açıklar buldular ve kapattılar. Artık çok daha güvende hissediyoruz."',
    'tst.2.name':   'Selma Ercan',
    'tst.2.role':   'IT Direktörü, Ege Finans',
    'tst.3.text':   '"E-ticaret sitemizi sıfırdan yaptılar. Hem tasarım hem de performans açısından rakiplerimizden bir adım öndeyiz. Teşekkürler Kamsis!"',
    'tst.3.name':   'Mert Özdemir',
    'tst.3.role':   'Kurucu, ModaShop TR',
    /* CONTACT */
    'cnt.label':    'İletişim',
    'cnt.title':    'Projenizi Konuşalım',
    'cnt.desc':     'Ücretsiz keşif görüşmesi için formu doldurun, 24 saat içinde dönüş yapalım',
    'cnt.email':    'E-posta',
    'cnt.phone':    'Telefon',
    'cnt.location': 'Konum',
    'cnt.loc.val':  'İzmir, Türkiye',
    'cnt.hours':    'Çalışma Saatleri',
    'cnt.hrs.val':  'Hft içi 09:00 – 18:00',
    'cnt.namelbl':  'Ad Soyad',
    'cnt.nameph':   'Adınız Soyadınız',
    'cnt.emaillbl': 'E-posta',
    'cnt.emailph':  'ornek@sirket.com',
    'cnt.sublbl':   'Konu',
    'cnt.subph':    'Konu seçin',
    'cnt.sub1': 'Yazılım Geliştirme', 'cnt.sub2': 'Siber Güvenlik', 'cnt.sub3': 'Web Geliştirme', 'cnt.sub4': 'Mobil Uygulama', 'cnt.sub5': 'Otomasyon', 'cnt.sub6': 'Diğer',
    'cnt.msglbl':   'Mesaj',
    'cnt.msgph':    'Projenizden bahsedin...',
    'cnt.send':     'Mesaj Gönder',
    'cnt.success':  'Mesajınız iletildi! En kısa sürede dönüş yapacağız.',
    /* FOOTER */
    'ftr.desc':     "2000'den beri yazılım ve siber güvenlik alanında yenilikçi çözümler sunuyoruz.",
    'ftr.srv':      'Hizmetler',
    'ftr.srv1': 'Yazılım Geliştirme', 'ftr.srv2': 'Siber Güvenlik', 'ftr.srv3': 'Web Geliştirme', 'ftr.srv4': 'Mobil Uygulama',
    'ftr.links':    'Bağlantılar',
    'ftr.l1': 'Hakkımızda', 'ftr.l2': 'Projeler', 'ftr.l3': 'Teknolojiler', 'ftr.l4': 'İletişim',
    'ftr.copy':     '© 2025 Kamsis Teknoloji. Tüm hakları saklıdır.',
  },
  en: {
    /* NAV */
    'nav.about':    'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.tech':     'Technologies',
    'nav.contact':  'Contact',
    /* HERO */
    'hero.badge':   'Active since 2000 · Izmir, Turkey',
    'hero.title':   'Building the Future<br /><span class="gradient-text">with Technology</span>',
    'hero.desc':    'We empower your business in the digital world with 25+ years of expertise in software development, cybersecurity, and IT solutions.',
    'hero.cta1':    'Our Services',
    'hero.cta2':    'View Projects',
    'hero.stat1':   'Years of Experience',
    'hero.stat2':   'Projects Completed',
    'hero.stat3':   'Happy Clients',
    /* ABOUT */
    'about.label':  'About Us',
    'about.title':  '25 Years of Experience,<br /><span class="gradient-text">Modern Solutions</span>',
    'about.p1':     'Since 2000, Kamsis Technology has been pioneering the digital transformation of businesses. We offer a wide range of services from software development to cybersecurity, web applications to automation systems.',
    'about.p2':     'Founded under the leadership of Suat Ayaz, our company prioritizes security, performance, and sustainability in every project, aiming to add long-term value for our clients.',
    'about.f1t':    'Custom Software Solutions',
    'about.f1d':    'Scalable software tailored to your business processes',
    'about.f2t':    '24/7 Support',
    'about.f2d':    'Uninterrupted technical support for your projects',
    'about.f3t':    'Transparent Communication',
    'about.f3d':    'Regular reporting and updates throughout the project',
    'about.b1':     'ISO 27001 Compliant',
    'about.b2':     'Fast Delivery',
    'about.b3':     'Secure Software',
    /* SERVICES */
    'srv.label':    'Our Services',
    'srv.title':    'What We Do',
    'srv.desc':     'End-to-end technology solutions tailored to your business needs',
    'srv.1.title':  'Software Development',
    'srv.1.desc':   'We develop scalable and secure custom software solutions that digitize your business processes. React, TypeScript, Python and more.',
    'srv.1.l1': 'ERP / CRM Systems', 'srv.1.l2': 'Task Management Software', 'srv.1.l3': 'Order Management Systems', 'srv.1.l4': 'Automation Tools',
    'srv.2.badge':  'Most Preferred',
    'srv.2.title':  'Cybersecurity',
    'srv.2.desc':   'We protect your systems against threats. We secure your digital assets with security analysis, penetration testing, and consulting services.',
    'srv.2.l1': 'Penetration Testing', 'srv.2.l2': 'Security Audit', 'srv.2.l3': 'Security Consulting', 'srv.2.l4': 'Data Protection (GDPR)',
    'srv.3.title':  'Web Development',
    'srv.3.desc':   'We design modern, fast, and SEO-friendly websites and applications. We add value to your brand by prioritizing user experience.',
    'srv.3.l1': 'Corporate Websites', 'srv.3.l2': 'E-Commerce Platforms', 'srv.3.l3': 'Web Applications', 'srv.3.l4': 'API Development',
    'srv.4.title':  'Mobile App',
    'srv.4.desc':   'We develop native and cross-platform mobile applications for iOS and Android. We make a difference with user-friendly interfaces.',
    'srv.4.l1': 'iOS & Android Apps', 'srv.4.l2': 'Cross-Platform Development', 'srv.4.l3': 'App Maintenance & Support', 'srv.4.l4': 'App Store Management',
    'srv.5.title':  'Automation & Bot',
    'srv.5.desc':   'We automate your repetitive business processes and increase your efficiency with AI-powered bots and tools.',
    'srv.5.l1': 'Business Process Automation', 'srv.5.l2': 'Social Media Bots', 'srv.5.l3': 'Data Analysis Tools', 'srv.5.l4': 'AI-Powered Systems',
    'srv.6.title':  'IT Consulting',
    'srv.6.desc':   'We optimize your technology infrastructure. We provide comprehensive consulting services on hardware, software, and network solutions.',
    'srv.6.l1': 'IT Infrastructure Management', 'srv.6.l2': 'Cloud Solutions', 'srv.6.l3': 'Network & Server Setup', 'srv.6.l4': 'Technical Support',
    /* PROJECTS */
    'prj.label':    'Portfolio',
    'prj.title':    'Featured Projects',
    'prj.desc':     'Some of our work shared on GitHub',
    'prj.1.title':  'Task Tracking Software',
    'prj.1.desc':   'Comprehensive task tracking and management system built with React + Flask. Includes task assignment, progress tracking, and reporting features.',
    'prj.2.title':  'Order Management System',
    'prj.2.desc':   'End-to-end order management solution for businesses written in TypeScript. Stock tracking, invoice generation, and customer management.',
    'prj.3.title':  'Trade Bot',
    'prj.3.desc':   'AI-powered bot that monitors crypto and stock markets in real time and generates automatic buy/sell signals based on technical analysis indicators.',
    'prj.4.title':  'Dip Price Bot',
    'prj.4.desc':   'Smart bot system that automatically finds Amazon product deals and shares them on social media. Price tracking and instant notification feature.',
    'prj.5.title':  'Zamam Voting',
    'prj.5.desc':   'Blockchain-based voting system. Secure, transparent, and manipulation-resistant digital voting platform. Rated 4 ⭐.',
    'prj.6.sub':    'Sports Agenda',
    'prj.6.desc':   "Today's matches, live scores — instantly on your phone. Send scores to friends, track match notifications. Football, basketball and more.",
    'prj.6.l1': "All matches & live scores", 'prj.6.l2': 'Football · Basketball · MMA & more', 'prj.6.l3': 'Send scores to friends instantly', 'prj.6.l4': 'Match notifications',
    /* TECH */
    'tech.label':   'Technologies',
    'tech.title':   'Tools We Use',
    'tech.desc':    'We work with modern and proven technologies',
    'tech.c3':      'Security',
    'tech.c4':      'Other',
    /* TESTIMONIALS */
    'tst.label':    'References',
    'tst.title':    'What Our Clients Say',
    'tst.1.text':   '"Working with Kamsis was an excellent experience. They developed our task tracking software specifically for us and the delivery time far exceeded our expectations."',
    'tst.1.name':   'Ali Kaya',
    'tst.1.role':   'General Manager, Kaya Logistics',
    'tst.2.text':   '"They are truly experts in cybersecurity consulting. They found and closed serious vulnerabilities in our systems. We feel much safer now."',
    'tst.2.name':   'Selma Ercan',
    'tst.2.role':   'IT Director, Ege Finance',
    'tst.3.text':   '"They built our e-commerce site from scratch. We are a step ahead of our competitors in both design and performance. Thank you Kamsis!"',
    'tst.3.name':   'Mert Özdemir',
    'tst.3.role':   'Founder, ModaShop TR',
    /* CONTACT */
    'cnt.label':    'Contact',
    'cnt.title':    "Let's Talk About Your Project",
    'cnt.desc':     'Fill out the form for a free discovery call, we will get back to you within 24 hours',
    'cnt.email':    'Email',
    'cnt.phone':    'Phone',
    'cnt.location': 'Location',
    'cnt.loc.val':  'Izmir, Turkey',
    'cnt.hours':    'Working Hours',
    'cnt.hrs.val':  'Weekdays 09:00 – 18:00',
    'cnt.namelbl':  'Full Name',
    'cnt.nameph':   'Your Full Name',
    'cnt.emaillbl': 'Email',
    'cnt.emailph':  'example@company.com',
    'cnt.sublbl':   'Subject',
    'cnt.subph':    'Select a subject',
    'cnt.sub1': 'Software Development', 'cnt.sub2': 'Cybersecurity', 'cnt.sub3': 'Web Development', 'cnt.sub4': 'Mobile App', 'cnt.sub5': 'Automation', 'cnt.sub6': 'Other',
    'cnt.msglbl':   'Message',
    'cnt.msgph':    'Tell us about your project...',
    'cnt.send':     'Send Message',
    'cnt.success':  'Your message has been sent! We will get back to you as soon as possible.',
    /* FOOTER */
    'ftr.desc':     'Providing innovative solutions in software and cybersecurity since 2000.',
    'ftr.srv':      'Services',
    'ftr.srv1': 'Software Development', 'ftr.srv2': 'Cybersecurity', 'ftr.srv3': 'Web Development', 'ftr.srv4': 'Mobile App',
    'ftr.links':    'Links',
    'ftr.l1': 'About', 'ftr.l2': 'Projects', 'ftr.l3': 'Technologies', 'ftr.l4': 'Contact',
    'ftr.copy':     '© 2025 Kamsis Technology. All rights reserved.',
  }
};

const langToggle = document.getElementById('langToggle');
let currentLang  = localStorage.getItem('lang') || 'tr';

const applyLang = (lang) => {
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t[key];
    } else if (el.tagName === 'OPTION' && el.value === '') {
      el.textContent = t[key];
    } else {
      el.innerHTML = t[key];
    }
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
