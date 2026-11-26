const sky = [
  [0, '#070b1e', '#141b3f', '#27305c'],
  [5, '#0b1230', '#1e2a5a', '#3b3f73'],
  [6.5, '#3f5fae', '#c98fa6', '#f3b98f'],
  [8, '#4f86cf', '#9fc0e6', '#e9dcd2'],
  [12, '#3f83d6', '#86b7ea', '#dfeaf4'],
  [16, '#4a86d2', '#95bde6', '#e6e6e0'],
  [18.5, '#5677bd', '#b79bc0', '#f0b483'],
  [19.75, '#3b4a92', '#a8719a', '#ec9670'],
  [21, '#141c48', '#2f2f66', '#5d4370'],
  [24, '#070b1e', '#141b3f', '#27305c'],
];
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const [x, y] = [rgb(a), rgb(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};
function paintSky() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const next = sky.findIndex(([h]) => h > hour);
  const [h0, ...from] = sky[next - 1];
  const [h1, ...to] = sky[next];
  const t = (hour - h0) / (h1 - h0);
  const colors = from.map((c, i) => mix(c, to[i], t));
  const root = document.documentElement;
  ['--sky-a', '--sky-b', '--sky-c'].forEach((name, i) => root.style.setProperty(name, colors[i]));
  const [r, g, b] = colors[1].match(/\d+/g).map(Number);
  const dark = 0.299 * r + 0.587 * g + 0.114 * b < 120;
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = colors[1];
}
paintSky();
setInterval(paintSky, 5 * 60 * 1000);

const tabs = document.querySelectorAll('[role="tab"]');
tabs.forEach((tab) =>
  tab.addEventListener('click', () => {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    });
  }),
);

const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.querySelectorAll('.split').forEach((element) => {
  element.innerHTML = element.textContent
    .trim()
    .split(/\s+/)
    .map((word, i) => `<span class="w" style="--i:${i}">${word}</span>`)
    .join(' ');
});

const rotator = document.querySelector('.rotator');
const letters = (text) =>
  [...text]
    .map((char, i) =>
      char === ' '
        ? '<span class="l sp"> </span>'
        : `<span class="l" style="--i:${i}">${char}</span>`,
    )
    .join('');
rotator.innerHTML = letters(rotator.textContent);
if (!still) {
  const words = rotator.dataset.words.split('|');
  let index = 0;
  setInterval(async () => {
    rotator.querySelectorAll('.l').forEach((l) => l.classList.add('out'));
    await wait(420);
    index = (index + 1) % words.length;
    rotator.innerHTML = letters(words[index]);
  }, 3200);
}

document.querySelectorAll('.head h2').forEach((heading) => {
  heading.innerHTML = heading.textContent
    .trim()
    .split(/\s+/)
    .map((word, i) => `<span class="w" style="--i:${i}">${word}</span>`)
    .join(' ');
});
document
  .querySelectorAll('.grid')
  .forEach((grid) => [...grid.children].forEach((child, i) => child.style.setProperty('--i', i)));

const fill = document.querySelector('[data-fill]');
fill.innerHTML = fill.textContent
  .trim()
  .split(/\s+/)
  .map((word) =>
    word.startsWith('*') || word.endsWith('*')
      ? `<span class="w key">${word.replaceAll('*', '')}</span>`
      : `<span class="w">${word}</span>`,
  )
  .join(' ');
const fillWords = [...fill.querySelectorAll('.w')];
const paintFill = () => {
  const box = fill.getBoundingClientRect();
  const progress = Math.min(
    1,
    Math.max(0, (innerHeight * 0.82 - box.top) / (box.height + innerHeight * 0.35)),
  );
  const lit = Math.round(progress * fillWords.length);
  fillWords.forEach((word, i) => word.classList.toggle('lit', still || i < lit));
};
addEventListener('scroll', paintFill, { passive: true });
addEventListener('resize', paintFill);
paintFill();

document.querySelectorAll('.marquee-track').forEach((track) => {
  track.innerHTML += track.innerHTML;
});

document.querySelectorAll('.spot').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  });
});

const demo = document.querySelector('.demo');
const action = document.getElementById('demo-action');
const typing = demo.querySelector('.typing');
const steps = [...demo.querySelectorAll('.step')];
let played = false;
async function playDemo() {
  if (played) return;
  played = true;
  if (still) return steps.forEach((step) => step.classList.add('show'));
  const [question, who, answer, card] = steps;
  await wait(300);
  question.classList.add('show');
  await wait(700);
  who.classList.add('show');
  typing.hidden = false;
  await wait(1300);
  typing.hidden = true;
  answer.classList.add('show');
  await wait(900);
  card.classList.add('show');
}
action
  .querySelectorAll('[data-approve]')
  .forEach((button) => button.addEventListener('click', () => action.classList.add('is-done')));

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      if (entry.target === demo) playDemo();
      observer.unobserve(entry.target);
    }),
  { threshold: 0.12 },
);
document.querySelectorAll('.rise').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-lang]').forEach((link) =>
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('soul.lang', link.dataset.lang);
    } catch {}
    if (location.hash) link.href = link.href.split('#')[0] + location.hash;
  }),
);
