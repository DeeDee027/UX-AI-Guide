/* =========================================================
   Interactive features for the guide
   1. Copy buttons on sample prompts
   2. AI / human toggle on figures
   3. Glossary pop-ups
   4. Table of contents highlights the current section
   ========================================================= */

const statusEl = document.getElementById('status');

/* ---------- 1. Copy buttons ---------- */
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = document.getElementById(btn.dataset.copy);
    if (!target) return;
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(target.innerText.trim());
      btn.textContent = 'Copied';
      statusEl.textContent = 'Prompt copied to clipboard';
    } catch (err) {
      btn.textContent = 'Copy failed';
      statusEl.textContent = 'Could not copy. Select the text and copy it manually.';
    }
    setTimeout(() => { btn.textContent = original; }, 2000);
  });
});

/* ---------- 2. Figure toggles ---------- */
document.querySelectorAll('.toggle-figure').forEach((fig) => {
  const buttons = fig.querySelectorAll('.figure-toggle button');
  const versions = fig.querySelectorAll('.fig-version');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      versions.forEach((v) => { v.hidden = v.dataset.version !== btn.dataset.show; });
    });
  });
});

/* ---------- 3. Glossary pop-ups ---------- */
const pop = document.getElementById('term-pop');
const popTitle = pop.querySelector('.term-pop-title');
const popDef = pop.querySelector('.term-pop-def');
let activeTerm = null;

function closePop({ returnFocus = false } = {}) {
  if (!activeTerm) return;
  pop.hidden = true;
  activeTerm.setAttribute('aria-expanded', 'false');
  if (returnFocus) activeTerm.focus();
  activeTerm = null;
}

function openPop(termBtn) {
  const key = termBtn.dataset.term;
  const dt = document.querySelector(`.glossary dt[data-term="${key}"]`);
  const dd = document.querySelector(`.glossary dd[data-term="${key}"]`);
  if (!dt || !dd) return;  // no matching glossary entry

  popTitle.textContent = dt.textContent;
  popDef.textContent = dd.textContent;
  pop.hidden = false;

  // Position the pop-up just below the term, kept inside the screen
  const r = termBtn.getBoundingClientRect();
  const margin = 16;
  let left = r.left + window.scrollX;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - margin;
  left = Math.max(window.scrollX + margin, Math.min(left, maxLeft));
  pop.style.left = `${left}px`;
  pop.style.top = `${r.bottom + window.scrollY + 8}px`;

  termBtn.setAttribute('aria-expanded', 'true');
  activeTerm = termBtn;
}

document.querySelectorAll('.term').forEach((btn) => {
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'term-pop');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeTerm === btn) closePop();
    else { closePop(); openPop(btn); }
  });
});

document.addEventListener('click', (e) => {
  if (activeTerm && !pop.contains(e.target)) closePop();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePop({ returnFocus: true });
});
pop.querySelector('.term-pop-link').addEventListener('click', () => closePop());

/* ---------- 4. Highlight current section in the contents ---------- */
const tocLinks = document.querySelectorAll('.toc a');
const sections = [...tocLinks]
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    tocLinks.forEach((a) => {
      a.setAttribute('aria-current', String(a.getAttribute('href') === `#${entry.target.id}`));
    });
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach((s) => observer.observe(s));

// On small screens, close the contents menu after choosing a section
const tocDetails = document.querySelector('.toc-details');
const smallScreen = window.matchMedia('(max-width: 900px)');
if (smallScreen.matches) tocDetails.open = false;
tocLinks.forEach((a) => a.addEventListener('click', () => {
  if (smallScreen.matches) tocDetails.open = false;
}));
