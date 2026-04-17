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