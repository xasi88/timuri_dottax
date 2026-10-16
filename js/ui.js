// Общие детали интерфейса: значки, счётчик блюда, подсказка, летящая точка, окно блюда.

window.UI = (function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const line = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ico = {
    menu: line('<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M12 3v3M8 4.5l1 2M16 4.5l-1 2M3 19h18"/>'),
    search: line('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    bag: line('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    cafe: line('<path d="M4 10 6 4h12l2 6"/><path d="M4 10a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>'),
    plus: line('<path d="M12 5v14M5 12h14"/>'),
    minus: line('<path d="M5 12h14"/>'),
    pin: line('<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    clock: line('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    phone: line('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    ig: line('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>'),
    go: line('<path d="m9 6 6 6-6 6"/>'),
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>',
  };

  // Кнопка «+» или счётчик «− 2 +»
  function ctl(id, big) {
    const q = window.Cart.qty(id);
    const cls = big ? " big" : "";
    if (!q) return `<div class="ctl empty${cls}"><button type="button" data-add="${id}" aria-label="Добавить в заказ">${ico.plus}${big ? "В заказ" : ""}</button></div>`;
    return `<div class="ctl has${cls}"><button type="button" data-sub="${id}" aria-label="Убрать одну порцию">${ico.minus}</button><output aria-live="polite">${q}</output><button type="button" data-add="${id}" aria-label="Добавить ещё порцию">${ico.plus}</button></div>`;
  }

  let toastTimer;
  function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // Точка летит от кнопки к значку «Заказ»
  function fly(from) {
    if (reduced() || !from) return;
    const target = [...document.querySelectorAll('[data-tab="order"]')].find((el) => el.offsetParent);
    const side = $("sideOrder");
    const to = target || (side && side.offsetParent ? side : null);
    if (!to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - 8, y0 = a.top + a.height / 2 - 8;
    const x1 = b.left + (target ? b.width / 2 : 40) - 8, y1 = b.top + (target ? b.height / 2 - 6 : 30) - 8;
    $("flyer").animate([
      { transform: `translate(${x0}px,${y0}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 80}px) scale(1.2)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x1}px,${y1}px) scale(0.5)`, opacity: 0 },
    ], { duration: 600, easing: "cubic-bezier(.45,0,.55,1)" });
  }

  const haptic = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* не везде есть вибрация */ } };

  // Плавное появление карточек при прокрутке
  const reveal = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
      }), { rootMargin: "0px 0px -6% 0px" })
    : null;
  function observe(el, i) {
    el.style.transitionDelay = `${(i % 4) * 50}ms`;
    if (reveal) reveal.observe(el); else el.classList.add("in");
  }

  // Окно с затемнением: закрывается фоном, крестиком и клавишей Esc
  let lastFocus = null;
  function openSheet(el) {
    lastFocus = document.activeElement;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => el.querySelector("[tabindex='-1']").focus({ preventScroll: true }), 50);
  }
  function closeSheet(el) {
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  return { $, esc, ico, ctl, toast, fly, haptic, observe, openSheet, closeSheet };
})();
