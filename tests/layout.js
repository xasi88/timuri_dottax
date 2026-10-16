// Проверка вёрстки в браузере: текст за рамкой, наезды, обрезка, прокрутка вбок.
// Запуск: открыть сайт, вставить этот код в консоль браузера, вызвать checkLayout().
// Пустой список bad и scrollX: false значат, что ошибок нет.

window.checkLayout = function () {
  document.querySelectorAll(".card").forEach((c) => c.classList.add("in"));
  const R = (e) => e.getBoundingClientRect();
  const vis = (e) => { const r = R(e); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
  const bad = [];
  const boxes = ".card,.btn,.chip,.tab,.o-line,.row,.promo,.seg button,.badge,.status,.feats span,.quick button,.searchbox,.d-buy,.sheet-card,.cafe-hero,.o-total,.c-buy,.brand,.blank";
  document.querySelectorAll("body *").forEach((e) => {
    if (!vis(e) || e.closest("svg")) return;
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const r = R(e), name = e.textContent.trim().slice(0, 30);
    if ((r.right > innerWidth + 1 || r.left < -1) && !e.closest(".chips-track")) bad.push("за экраном: " + name);
    const box = e.parentElement.closest(boxes);
    if (box) {
      const b = R(box);
      if (r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1 || r.top < b.top - 1) bad.push("за рамкой: " + name);
    }
    if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible" && !e.matches(".chips-track")) bad.push("обрезано: " + name);
  });
  const hit = (a, b) => { const x = R(a), y = R(b); return x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1; };
  document.querySelectorAll(".card, .o-line, .promo, .d-buy, .row").forEach((c) => {
    const parts = [...c.querySelectorAll(".c-name,.c-desc,.c-price,.ctl,.art,.promo-text,.promo-art,.promo-buy,.promo-rating,.d-price,b,span:not(.badge)")]
      .filter((p) => vis(p) && p.parentElement.closest(".card, .o-line, .promo, .d-buy, .row") === c && !p.closest(".ctl > *") && !p.closest(".c-price > *") && !p.closest(".promo-buy > *, .promo-text > *"));
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++)
      if (!parts[i].contains(parts[j]) && !parts[j].contains(parts[i]) && hit(parts[i], parts[j])) bad.push("наезд: " + parts[i].className + " / " + parts[j].className + " в " + (c.dataset.open || c.className));
  });
  return { w: innerWidth, scrollX: document.documentElement.scrollWidth > innerWidth, bad: [...new Set(bad)].slice(0, 25) };
};
