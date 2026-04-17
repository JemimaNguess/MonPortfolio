const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const langLabel  = document.getElementById('langLabel');
const html       = document.documentElement;

// Stocke les textes originaux FR au chargement
const originalTexts = new Map();

function collectTexts() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: node => {
        const text = node.textContent.trim();
        // Ignore les noeuds vides et les scripts/styles
        if (!text) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    originalTexts.set(node, node.textContent.trim());
  }
}

async function translateElement(el, targetLang) {
  const text = originalTexts.get(el);
  if (!text) return;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${targetLang}`
    );
    const data = await res.json();
    if (data.responseStatus === 200) {
      el.textContent = data.responseData.translatedText;
    }
  } catch (e) {
    console.warn('Traduction échouée pour :', text);
  }
}

async function translatePage(targetLang) {
  if (targetLang === 'fr') {
    // Retour au français → restaure les originaux
    originalTexts.forEach((text, el) => { el.textContent = text; });
    return;
  }

  // Traduit tous les éléments en parallèle
  const elements = [...originalTexts.keys()];
  await Promise.all(elements.map(el => translateElement(el, targetLang)));
}

// Toggle
langToggle.addEventListener('click', async () => {
  langToggle.classList.add('switching');
  langToggle.disabled = true;

  const isFR = html.getAttribute('data-lang') === 'fr';
  const newLang = isFR ? 'en' : 'fr';

  html.setAttribute('data-lang', newLang);
  langLabel.textContent = isFR ? 'EN' : 'FR';

  await translatePage(newLang);

  langToggle.classList.remove('switching');
  langToggle.disabled = false;
});

// Lance la collecte au chargement
document.addEventListener('DOMContentLoaded', collectTexts);

  // Scroll → ombre
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    if (isOpen) {
      mobileMenu.style.display = 'flex';
      requestAnimationFrame(() => mobileMenu.classList.add('open'));
      document.body.style.overflow = 'hidden';
      statsBar.style.display = 'none';
    } else {
      closeMenu();
    }
  });

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    statsBar.style.display = '';
    setTimeout(() => { mobileMenu.style.display = ''; }, 350);
  }

  // Toggle thème
  themeToggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  });

  // Lien actif au clic
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

const STATS = [
  {
    key:   'years',
    value: 3,           // ← change ce chiffre
    label: 'Années\nd\'expérience',
    suffix: '+'
  },
  {
    key:   'projects',
    value: 12,          // ← augmente quand tu ajoutes un projet
    label: 'Projets\nréalisés',
    suffix: '+'
  },
  {
    key:   'techs',
    value: 7,           // ← augmente quand tu maîtrises une techno
    label: 'Technologies\nmaîtrisées',
    suffix: '+'
  },
  {
    key:   'clients',
    value: 5,           // ← change ce chiffre
    label: 'Clients\nsatisfaits',
    suffix: '+'
  }
];

// ══ RENDU DES STATS ══
function renderStats() {
  const bar = document.getElementById('statsBar');
  bar.innerHTML = STATS.map(stat => `
    <div class="stat-item">
      <div class="stat-number">
        <span class="count" data-target="${stat.value}">0</span><span class="plus">${stat.suffix}</span>
      </div>
      <div class="stat-label">${stat.label.replace('\n', '<br>')}</div>
    </div>
  `).join('');

  // Animation des compteurs
  animateCounters();
}

function animateCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }

    requestAnimationFrame(update);
  });
}

// ══ TYPER ANIMÉ ══
const roles = [
  'Formatrice',
  'Développeuse Web',
  'Frontend Developer',
  'Créatrice d\'expériences',
];

let roleIndex = 0, charIndex = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  const current = roles[roleIndex];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(type, deleting ? 55 : 90);
}

// ══ INIT ══
renderStats();
type();

// EMAILJS — remplace par tes vraies clés
const EMAILJS_PUBLIC_KEY  = 'rUcHLI19yK5WAXk0t';   // ← Dashboard > Account > Public Key
const EMAILJS_SERVICE_ID  = 'service_64tf1tr';   // ← Email Services > Service ID
const EMAILJS_TEMPLATE_ID = 'template_yxv2ir7';  // ← Email Templates > Template ID

emailjs.init(EMAILJS_PUBLIC_KEY);

// ══ FORMULAIRE ══
const form       = document.getElementById('contactForm');
const btnSend    = document.getElementById('btnSend');
const formMsg    = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // État chargement
  btnSend.disabled = true;
  btnSend.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round"
         style="width:16px;height:16px;animation:spin 1s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Envoi en cours...
  `;

  const params = {
    from_name:    document.getElementById('name').value,
    from_email:   document.getElementById('email').value,
    from_phone:   document.getElementById('phone').value,
    subject:      document.getElementById('subject').value,
    message:      document.getElementById('message').value,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);

    formMsg.className = 'form-message success';
    formMsg.textContent = '✓ Message envoyé ! Je te répondrai très bientôt.';
    form.reset();

  } catch (err) {
    formMsg.className = 'form-message error';
    formMsg.textContent = '✗ Erreur lors de l\'envoi. Réessaie ou contacte-moi directement.';
    console.error('EmailJS error:', err);
  }

  // Réinitialise le bouton
  btnSend.disabled = false;
  btnSend.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
    Envoyer le message
  `;

  // Cache le message après 5s
  setTimeout(() => { formMsg.className = 'form-message'; }, 5000);
});

// ══ ANIMATION SPIN ══
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ══ ANNÉE AUTO ══
document.getElementById('year').textContent = new Date().getFullYear();