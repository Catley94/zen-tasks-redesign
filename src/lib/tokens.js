// Shared tokens — Refined Forest + turquoise pair.
export const TOKENS = {
  bg: '#f6f2e8', bgSoft: '#f1ecdd', surface: '#fbf7ee', surfaceAlt: '#fdfaf3',
  ink: '#2a2e26', inkSoft: '#4a4e45', sub: '#6b6e63', subSoft: '#8a8d82',
  line: '#e6ddc9', lineSoft: '#efe8d6', lineSofter: '#f3edde',
  green: '#3f6e3a', greenDeep: '#2d5228', greenSoft: '#d6e2cb', greenTint: '#ebf1e2',
  teal: '#2a8a8a', tealDeep: '#1f6a6a', tealSoft: '#c8e0e0', tealTint: '#e0ecec',
  warn: '#b8733a', warnSoft: '#f1e1cf',
  rose: '#9a4a4a',
  dotSeedling: '#a8b89a', dotGrowing: '#6b9a4e', dotRooted: '#3f6e3a', dotFalling: '#b8733a',
  radius: 10, radiusSm: 6, radiusLg: 14,
  fontSans: '"Inter", system-ui, sans-serif',
  fontMono: 'ui-monospace, "SF Mono", monospace',
};

export const btnReset = { background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 };

export const PRIORITY_LABEL = { seedling: 'Seedling', growing: 'Growing', rooted: 'Rooted', falling: 'Falling' };
export const PRIORITY_COLOR = { seedling: TOKENS.dotSeedling, growing: TOKENS.dotGrowing, rooted: TOKENS.dotRooted, falling: TOKENS.dotFalling };

// Call once from main.jsx to inject shared animation + hover styles.
export function injectStyles() {
  if (document.getElementById('zen-anim-styles')) return;
  const s = document.createElement('style');
  s.id = 'zen-anim-styles';
  s.textContent = `
    @keyframes zenFocusPulse {
      0%   { box-shadow: 0 0 0 0 ${TOKENS.teal}55; }
      50%  { box-shadow: 0 0 0 6px ${TOKENS.teal}22; }
      100% { box-shadow: 0 0 0 0 ${TOKENS.teal}00; }
    }
    .zen-focus-highlight { animation: zenFocusPulse 1.5s ease-in-out; }

    @keyframes zenSlideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes zenFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .zen-row-more { opacity: 0; transition: opacity .12s; }
    .zen-task-row:hover .zen-row-more,
    .zen-proj-row:hover .zen-row-more,
    .zen-row-more[data-open="1"],
    .zen-row-more:focus-visible { opacity: 1; }

    .zen-proj-row:hover { background: ${TOKENS.greenTint}; }
  `;
  document.head.appendChild(s);
}
