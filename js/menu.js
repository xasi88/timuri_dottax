// Экран «Меню»: главная карточка, полоса разделов, карточки блюд, окно блюда.

window.MenuView = (function () {
  const { $, esc, ctl, observe, openSheet } = window.UI;
  const C = window.CAFE, M = window.MENU, I = window.ICONS, cart = window.Cart;
  const hero = M.flatMap((g) => g.items).find((it) => it.hero);
  const groupOf = {};
  M.forEach((g) => g.items.forEach((it) => { groupOf[it.id] = g; }));

  // Карточка блюда: общая для меню и поиска
  function card(it) {
    return `<article class="card" data-open="${it.id}" data-g="${groupOf[it.id].id}" tabindex="0" aria-label="${esc(it.name)}, ${cart.rub(it.price)}">
      <div class="art">${I[it.icon]}${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ""}</div>
      <div class="c-body">
        <h3 class="c-name">${esc(it.name)}</h3>
        <p class="c-desc">${esc(it.desc)}</p>
        <div class="c-buy"><span class="c-price"><b>${cart.rub(it.price)}</b><small>${esc(it.weight)}</small></span><span data-ctl="${it.id}">${ctl(it.id)}</span></div>
      </div>
    </article>`;
  }

  function render() {
    $("promo").innerHTML = `
      <div class="promo-text">
        <p class="promo-kicker">Фирменное блюдо</p>
        <h1>${esc(hero.name)}</h1>
        <p class="promo-meta">Маринад, живой огонь, золотая корочка</p>
      </div>
      <div class="promo-art" aria-hidden="true">${I[hero.icon]}</div>
      <div class="promo-buy"><span class="promo-price">${cart.rub(hero.price)}</span><span data-ctl="${hero.id}" data-big="1">${ctl(hero.id, true)}</span></div>
      <a class="promo-rating" href="${C.mapUrl}" target="_blank" rel="noopener">★ ${esc(C.rating)} · ${esc(C.ratingCount)} на Яндекс Картах</a>`;

    $("chipsTrack").insertAdjacentHTML("beforeend", M.map((g) => `<button class="chip" type="button" data-cat="${g.id}">${esc(g.title)}</button>`).join(""));

    $("groups").innerHTML = M.map((g) => `
      <section class="group" id="g-${g.id}" aria-labelledby="h-${g.id}">
        <div class="group-head"><h2 id="h-${g.id}">${esc(g.title)}</h2><p>${esc(g.note)}</p></div>
        <div class="grid">${g.items.map(card).join("")}</div>
      </section>`).join("");
    document.querySelectorAll("#groups .grid").forEach((grid) => [...grid.children].forEach(observe));
    $("demoNote").hidden = !C.demo;
    setupChips();
  }

  // Полоса разделов: подложка едет к текущему разделу
  function setupChips() {
    const track = $("chipsTrack"), pill = $("chipsPill");
    const chips = [...track.querySelectorAll(".chip")];
    let current = M[0].id, lock = 0;

    function place(id, scrollTrack) {
      current = id;
      const c = chips.find((x) => x.dataset.cat === id);
      if (!c || !c.offsetWidth) return;
      if (!pill.dataset.ready) { pill.style.transition = "none"; requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ""; pill.dataset.ready = "1"; })); }
      chips.forEach((x) => x.classList.toggle("on", x === c));
      track.classList.toggle("more", track.scrollWidth - track.scrollLeft > track.clientWidth + 4);
      pill.style.width = c.offsetWidth + "px";
      pill.style.transform = `translate(${c.offsetLeft}px, ${c.offsetTop}px)`;
      if (scrollTrack) track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: "smooth" });
    }

    track.addEventListener("scroll", () => track.classList.toggle("more", track.scrollWidth - track.scrollLeft > track.clientWidth + 4), { passive: true });
    track.addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      lock = Date.now() + 900;
      place(c.dataset.cat, true);
      $("g-" + c.dataset.cat).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });

    function spy() {
      if (Date.now() < lock || $("view-menu").hidden) return;
      const line = $("chips").getBoundingClientRect().bottom + 24;
      let id = M[0].id;
      for (const g of M) if ($("g-" + g.id).getBoundingClientRect().top <= line) id = g.id;
      if (id !== current) place(id, true);
    }
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", () => place(current, false));
    document.fonts.ready.then(() => place(current, false));
    return { refresh: () => place(current, false) };
  }

  // Окно блюда
  let openId = null;
  function openDish(id) {
    const it = cart.byId[id];
    openId = id;
    $("sheet").querySelector(".d-art").dataset.g = groupOf[id].id;
    $("dArt").innerHTML = I[it.icon];
    $("dMeta").textContent = `${groupOf[id].title} · ${it.weight}`;
    $("dName").textContent = it.name;
    $("dDesc").textContent = it.desc;
    $("dPrice").textContent = cart.rub(it.price);
    $("dCtl").innerHTML = ctl(id, true);
    openSheet($("sheet"));
  }

  return { render, card, openDish, openId: () => openId, refreshChips: () => window.dispatchEvent(new Event("resize")) };
})();
