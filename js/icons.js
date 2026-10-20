// Рисунки блюд: линии в одну толщину, цвет берётся из CSS (currentColor).
// Класс "fx" отмечает пар и огонь: они анимируются в styles.css.

const S = (body) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const steam = `<g class="fx steam"><path d="M24 14c-2-3 2-5 0-8"/><path d="M32 13c-2-3 2-5 0-8"/><path d="M40 14c-2-3 2-5 0-8"/></g>`;
const flame = `<g class="fx flame"><path d="M22 58c-3-4 1-6 0-10 4 3 4 6 2 10"/><path d="M32 59c-4-5 2-8 0-13 5 4 5 9 2 13"/><path d="M42 58c-3-4 1-6 0-10 4 3 4 6 2 10"/></g>`;

window.ICONS = {
  chicken: S(`<path d="M10 38c0-9 10-16 23-16 12 0 21 6 21 14 0 7-8 10-21 10-14 0-23-2-23-8z"/><path d="M45 26l8-5"/><circle cx="55.5" cy="19.5" r="2.6"/><path d="M50 32l7-2"/><circle cx="59.5" cy="29.5" r="2.6"/><path d="M17 33c4-4 10-6 17-6"/><path d="M8 50h48"/>${flame}`),
  skewer: S(`<path d="M8 50 56 14"/><rect x="17" y="34" width="9" height="9" rx="3" transform="rotate(-37 21 38)"/><rect x="28" y="26" width="9" height="9" rx="3" transform="rotate(-37 32 30)"/><rect x="39" y="18" width="9" height="9" rx="3" transform="rotate(-37 43 22)"/><circle cx="54" cy="15" r="2"/>${flame}`),
  steak: S(`<path d="M12 30c0-9 10-15 22-15 11 0 18 6 18 14 0 10-9 17-21 17-12 0-19-6-19-16z"/><circle cx="38" cy="27" r="4"/><path d="M18 34l6-6M24 38l8-8M32 40l4-4"/>`),
  plov: S(`<path d="M8 36h48c0 10-10 18-24 18S8 46 8 36z"/><path d="M14 36c2-6 8-10 18-10s16 4 18 10"/><path d="M22 31l3 2M30 29l2 3M38 30l-2 3M27 34h2M35 34h2"/>${steam}`),
  manty: S(`<path d="M10 46h44"/><path d="M14 46c0-8 4-14 8-14s8 6 8 14"/><path d="M34 46c0-8 4-14 8-14s8 6 8 14"/><path d="M24 32c0-6 4-10 8-10s8 4 8 10"/><path d="M22 32l-1-3M42 32l1-3M32 22v-3"/>${steam}`),
  lagman: S(`<path d="M8 34h48c0 11-10 18-24 18S8 45 8 34z"/><path d="M14 34c4-4 8 0 12-4s8 0 12-4 8 0 12 4"/><path d="M44 14 30 34M50 16 36 34"/>`),
  pot: S(`<path d="M12 28h40v14c0 7-6 12-14 12H26c-8 0-14-5-14-12z"/><path d="M6 30h6M52 30h6"/><path d="M20 28c0-4 5-6 12-6s12 2 12 6"/>${steam}`),
  wrap: S(`<path d="M20 56 14 22c6-6 30-6 36 0l-6 34z"/><path d="M14 22c4 4 10 6 18 6s14-2 18-6"/><path d="M22 18c2-6 6-8 10-8s8 2 10 8"/><path d="M24 40h16M22 48h20"/>`),
  burger: S(`<path d="M12 30c0-10 9-16 20-16s20 6 20 16z"/><path d="M10 36h44"/><path d="M12 42c6 3 34 3 40 0"/><path d="M12 48c0 4 4 6 8 6h24c4 0 8-2 8-6z"/><path d="M24 22h1M32 20h1M40 22h1"/>`),
  pizza: S(`<path d="M32 56 8 16c14-8 34-8 48 0z"/><path d="M12 22c12-6 28-6 40 0"/><circle cx="28" cy="30" r="3"/><circle cx="38" cy="34" r="3"/><circle cx="32" cy="44" r="2.5"/>`),
  soup: S(`<path d="M8 32h48c0 12-10 20-24 20S8 44 8 32z"/><path d="M48 32 56 12"/><path d="M20 38h4M30 40h4M40 38h3"/>${steam}`),
  plate: S(`<ellipse cx="32" cy="40" rx="24" ry="10"/><ellipse cx="24" cy="36" rx="8" ry="5"/><path d="M36 34c3-3 12-3 14 1-2 4-11 5-14 2"/>`),
  pasta: S(`<path d="M8 36h48c0 10-10 17-24 17S8 46 8 36z"/><path d="M16 36c0-8 7-12 16-12s16 4 16 12"/><path d="M22 32c4-3 8 1 12-2s8 1 10 2"/><path d="M42 8l-6 22M48 10l-8 20"/>`),
  tea: S(`<path d="M14 26h30v14c0 8-6 14-15 14s-15-6-15-14z"/><path d="M44 30h4c4 0 6 3 6 6s-2 6-6 6h-5"/><path d="M22 20c2-2 12-2 14 0"/><path d="M29 16v4"/>${steam}`),
  glass: S(`<path d="M18 12h28l-4 42H22z"/><path d="M20 26h24"/><circle cx="30" cy="36" r="2"/><circle cx="36" cy="44" r="1.5"/>`),
  bun: S(`<path d="M10 42c0-12 10-20 22-20s22 8 22 20c0 4-4 6-8 6H18c-4 0-8-2-8-6z"/><path d="M22 32c2-3 6-4 10-4M36 30c3 0 6 2 8 4"/>`),
  sauce: S(`<path d="M16 34h32v10c0 6-6 10-16 10s-16-4-16-10z"/><ellipse cx="32" cy="34" rx="16" ry="5"/><path d="M28 34c2-3 6-3 8 0"/>`),
};
