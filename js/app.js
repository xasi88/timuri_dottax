// Запуск: вкладки, переходы между экранами, поиск, экран «Кафе», связь с корзиной.

(function () {
  const { $, esc, ico, ctl, toast, fly, haptic, closeSheet } = window.UI;
  const C = window.CAFE, M = window.MENU, cart = window.Cart;
  const Menu = window.MenuView, Order = window.OrderView;
  const TABS = [["menu", "Меню", ico.menu], ["search", "Поиск", ico.search], ["order", "Заказ", ico.bag], ["cafe", "Кафе", ico.cafe]];

  // Вкладки: снизу на телефоне, в шапке на большом экране
  const tabHtml = TABS.map(([id, t, svg]) => `<a class="tab" href="#${id}" data-tab="${id}">${svg}<span>${t}</span>${id === "order" ? '<i class="dot" data-count></i>' : ""}</a>`).join("");
  $("tabbar").innerHTML = tabHtml;
  $("tabs").innerHTML = tabHtml;

  Menu.render();
  Order.mount($("orderPage"), false);
  Order.mount($("sideOrder"), true);

  // Открыто ли кафе сейчас: часы по Москве (Грозный)
  function status() {
    const h = Number(new Intl.DateTimeFormat("ru-RU", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Moscow" }).format(new Date()));
    const open = h >= C.open && h < C.close;
    const el = $("status");
    el.innerHTML = open ? "Открыто<span class=\"st-more\"> до 00:00</span>" : `Закрыто<span class="st-more">, откроется в ${C.open}:00</span>`;
    el.classList.toggle("closed", !open);
  }
  status();
  setInterval(status, 60000);

  // Экран «Кафе»
  const row = (href, icon, title, sub, ext) => `<a class="row" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}><i>${icon}</i><div><b>${title}</b><span>${sub}</span></div>${ico.go.replace("<svg", '<svg class="go"')}</a>`;
  $("cafePage").innerHTML = `
    <div class="cafe-hero">
      <span class="cafe-logo" role="img" aria-label="Логотип Katar Café"></span>
      <h1>Katar Café</h1>
      <p>${esc(C.tagline)}. Курица, мясо, люля. Доставка по Грозному.</p>
      <div class="cafe-rate"><b>${esc(C.rating)}</b><span class="stars" aria-hidden="true">★★★★★</span><span>${esc(C.ratingCount)} на Яндекс Картах</span></div>
    </div>
    <div class="rows">
      ${row(C.mapUrl, ico.pin, esc(C.place), "Построить маршрут", true)}
      ${row("tel:+" + C.phone, ico.phone, esc(C.phoneText), "Позвонить", false)}
      ${row(`https://instagram.com/${C.instagram}`, ico.ig, "@" + esc(C.instagram), "Instagram", true)}
      <div class="row"><i>${ico.clock}</i><div><b>${esc(C.hours)}</b><span>Готовим без выходных</span></div><span></span></div>
    </div>
    <div class="feats">${C.features.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
    <div class="cafe-cta">
      <a class="btn btn-wa" href="https://wa.me/${C.phone}" target="_blank" rel="noopener">${ico.wa}Написать в WhatsApp</a>
      <a class="btn btn-soft" href="#menu">Смотреть меню</a>
    </div>`;

  // Поиск: без учёта регистра и буквы «ё»
  const norm = (s) => s.toLowerCase().replace(/ё/g, "е");
  const all = M.flatMap((g) => g.items.map((it) => ({ it, hay: norm(`${it.name} ${it.desc} ${g.title}`) })));
  ["Курица", "Люля", "Плов", "Манты", "Чай", "Суп"].forEach((w) => $("quick").insertAdjacentHTML("beforeend", `<button type="button">${w}</button>`));
  function search() {
    const q = norm($("q").value.trim());
    $("qClear").hidden = !q;
    $("quick").hidden = !!q;
    if (!q) { $("results").innerHTML = ""; return; }
    const found = all.filter((x) => q.split(/\s+/).every((w) => x.hay.includes(w))).map((x) => x.it);
    $("results").innerHTML = found.length
      ? `<p class="results-head">Найдено: ${found.length}</p>${found.map(Menu.card).join("")}`
      : `<div class="blank"><div class="blank-art">${ico.search}</div><h2>Ничего не нашли</h2><p>Попробуйте другое слово: «курица», «плов», «чай».</p></div>`;
  }
  $("q").addEventListener("input", search);
  $("qClear").addEventListener("click", () => { $("q").value = ""; search(); $("q").focus(); });
  $("quick").addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") { $("q").value = e.target.textContent; search(); } });

  // Переходы между экранами по адресу (#menu, #search, #order, #cafe)
  const scrollMemo = {};
  let view = null;
  function route() {
    const want = (location.hash || "#menu").slice(1);
    const next = TABS.some(([id]) => id === want) ? want : "menu";
    if (next === view) return;
    if (view) scrollMemo[view] = scrollY;
    view = next;
    document.querySelectorAll(".view").forEach((v) => { v.hidden = v.dataset.view !== next; });
    document.querySelectorAll("[data-tab]").forEach((t) => {
      t.classList.toggle("on", t.dataset.tab === next);
      if (t.dataset.tab === next) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    scrollTo(0, scrollMemo[next] || 0);
    if (next === "menu") Menu.refreshChips();
    if (next === "search" && matchMedia("(hover: hover)").matches) $("q").focus({ preventScroll: true });
  }
  addEventListener("hashchange", route);
  route();

  // Нажатия: добавить, убрать, открыть блюдо
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]"), sub = e.target.closest("[data-sub]");
    if (add) {
      e.stopPropagation();
      const first = !cart.qty(add.dataset.add);
      cart.add(add.dataset.add);
      haptic();
      fly(add);
      if (first) toast(`${cart.byId[add.dataset.add].name}: в заказе`);
      return;
    }
    if (sub) { e.stopPropagation(); cart.sub(sub.dataset.sub); haptic(); return; }
    const card = e.target.closest("[data-open]");
    if (card) Menu.openDish(card.dataset.open);
  });
  document.addEventListener("keydown", (e) => {
    const card = e.target.closest && e.target.closest("[data-open]");
    if (card && (e.key === "Enter" || e.key === " ") && e.target === card) { e.preventDefault(); Menu.openDish(card.dataset.open); }
    if (e.key === "Escape" && $("sheet").classList.contains("open")) closeSheet($("sheet"));
  });
  $("sheet").addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet($("sheet")); });

  // Корзина изменилась: обновить счётчики, значок «Заказ», экран заказа
  function sync() {
    document.querySelectorAll("[data-ctl]").forEach((el) => {
      const q = String(cart.qty(el.dataset.ctl));
      if (el.dataset.q !== q) { el.innerHTML = ctl(el.dataset.ctl, !!el.dataset.big); el.dataset.q = q; }
    });
    if (Menu.openId() && $("sheet").classList.contains("open")) $("dCtl").innerHTML = ctl(Menu.openId(), true);
    const n = cart.count();
    document.querySelectorAll("[data-count]").forEach((d) => {
      const changed = d.textContent !== String(n);
      d.textContent = n;
      d.classList.toggle("show", n > 0);
      if (changed && n) { d.classList.remove("bump"); void d.offsetWidth; d.classList.add("bump"); }
    });
    Order.update();
  }
  cart.onChange(sync);
  sync();

  addEventListener("scroll", () => document.querySelector(".appbar").classList.toggle("scrolled", scrollY > 4), { passive: true });
})();
