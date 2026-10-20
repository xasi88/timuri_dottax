// Экран «Меню»: главная карточка, акции, полоса разделов, комбо, хиты, карточки блюд, окно блюда.

window.MenuView = (function () {
  const { $, esc, art, price, ctl, observe, openSheet } = window.UI;
  const C = window.CAFE, M = window.MENU, D = window.Data, cart = window.Cart;
  const all = M.flatMap((g) => g.items);
  const hero = all.find((it) => it.hero && !it.off) || D.hits()[0] || all[0];
  const groupOf = {};
  M.forEach((g) => g.items.forEach((it) => { groupOf[it.id] = g; }));

  // Что входит в комбо: «Шурпа, Плов узбекский, Чепалг»
  function contents(c) {
    return c.items.map((x) => {
      const it = cart.byId[x.id];
      const opt = it.options && it.options[x.opt] ? ` (${it.options[x.opt].name.toLowerCase()})` : "";
      return `${it.name}${opt}${x.qty > 1 ? ` × ${x.qty}` : ""}`;
    }).join(", ");
  }

  // Карточка блюда: общая для меню, хитов и поиска
  function card(it) {
    const badge = it.off ? "" : it.discount > 0 ? `<span class="badge sale">−${it.discount}%</span>` : it.badge ? `<span class="badge">${esc(it.badge)}</span>` : "";
    return `<article class="card${it.off ? " off" : ""}" data-open="${it.id}" data-g="${groupOf[it.id].id}" tabindex="0" aria-label="${esc(it.name)}">
      <div class="art">${art(it)}${badge}</div>
      <div class="c-body">
        <h3 class="c-name">${esc(it.name)}</h3>
        <p class="c-desc">${esc(it.desc)}</p>
        <div class="c-buy"><span class="c-price">${price(it)}</span><span data-ctl="${it.id}">${ctl(it.id)}</span></div>
      </div>
    </article>`;
  }

  function comboCard(c) {
    const key = "combo:" + c.id, save = D.comboFull(c) - c.price;
    return `<article class="card combo" data-open="${key}" data-g="combo" tabindex="0" aria-label="Комбо ${esc(c.name)}">
      <div class="art">${art(c)}${save > 0 ? `<span class="badge sale">−${cart.rub(save)}</span>` : ""}</div>
      <div class="c-body">
        <h3 class="c-name">Комбо «${esc(c.name)}»</h3>
        <p class="c-desc">${esc(contents(c))}</p>
        <div class="c-buy"><span class="c-price">${price(c)}</span><span data-ctl="${key}">${ctl(key)}</span></div>
      </div>
    </article>`;
  }

  const sections = [];
  function section(id, title, note, cards) {
    sections.push({ id, title });
    return `
      <section class="group" id="g-${id}" aria-labelledby="h-${id}">
        <div class="group-head"><h2 id="h-${id}">${esc(title)}</h2>${note ? `<p>${esc(note)}</p>` : ""}</div>
        <div class="grid">${cards}</div>
      </section>`;
  }

  function render() {
    $("promo").innerHTML = `
      ${hero.photo ? `<img class="promo-photo" src="${esc(hero.photo)}" alt="" fetchpriority="high">` : ""}
      <div class="promo-text">
        <p class="promo-kicker">🔥 Фирменное блюдо</p>
        <h1>${esc(hero.name)}</h1>
        <p class="promo-meta">${esc(hero.desc)}</p>
      </div>
      <div class="promo-buy"><span class="promo-price">${price(hero)}</span><span data-ctl="${hero.id}" data-big="1">${ctl(hero.id, true)}</span></div>
      <a class="promo-rating" href="${esc(C.mapUrl)}" target="_blank" rel="noopener">★ ${esc(C.rating)} · ${esc(C.ratingCount)} на Яндекс Картах</a>`;

    // Акции: полоса карточек под главной
    const banners = D.banners();
    $("offers").hidden = !banners.length;
    $("offers").innerHTML = banners.map((b, i) => `
      <button type="button" class="offer o${i % 3}" ${b.target ? `data-target="${esc(b.target)}"` : "data-target-none"}>
        ${b.tag ? `<span class="offer-tag">${esc(b.tag)}</span>` : ""}
        <b>${esc(b.title)}</b><span>${esc(b.text)}</span>
        ${b.until ? `<small>До ${esc(b.until.split("-").reverse().join("."))}</small>` : ""}
      </button>`).join("");

    const combos = D.combos(), hits = D.hits();
    let html = "";
    if (combos.length) html += section("combo", "Комбо", "Набор выгоднее, чем по отдельности.", combos.map(comboCard).join(""));
    if (hits.length) html += section("hits", "Хиты", "Это заказывают чаще всего.", hits.map(card).join(""));
    M.forEach((g) => { if (g.items.length) html += section(g.id, g.title, g.note, g.items.map(card).join("")); });
    $("groups").innerHTML = html;
    $("chipsTrack").insertAdjacentHTML("beforeend", sections.map((s) => `<button class="chip" type="button" data-cat="${s.id}">${esc(s.title)}</button>`).join(""));

    document.querySelectorAll("#groups .grid").forEach((grid) => [...grid.children].forEach(observe));
    $("demoNote").hidden = !C.demo;
    setupChips();
  }

  // Полоса разделов: подложка едет к текущему разделу
  function setupChips() {
    const track = $("chipsTrack"), pill = $("chipsPill");
    const chips = [...track.querySelectorAll(".chip")];
    if (!chips.length) return;
    let current = sections[0].id, lock = 0;

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
      let id = sections[0].id;
      for (const s of sections) if ($("g-" + s.id).getBoundingClientRect().top <= line) id = s.id;
      if (id !== current) place(id, true);
    }
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", () => place(current, false));
    document.fonts.ready.then(() => place(current, false));
  }

  // Окно блюда или комбо. key: "plov" или "combo:family"
  let openKey = null, openId = null, opt = 0;

  function fill() {
    const it = cart.byId[openId];
    const hasOpts = it.options && it.options.length;
    openKey = hasOpts ? `${openId}@${opt}` : openId;
    const base = D.optPrice(it, hasOpts ? opt : undefined), now = D.cut(base, it.discount);
    $("dPrice").innerHTML = `${cart.rub(now)}${now < base ? ` <s>${cart.rub(base)}</s>` : ""}`;
    $("dOpts").innerHTML = hasOpts ? it.options.map((o, i) => `<button type="button" data-opt="${i}" aria-pressed="${i === opt}">${esc(o.name)}<small>${cart.rub(D.cut(o.price, it.discount))}</small></button>`).join("") : "";
    $("dOpts").hidden = !hasOpts;
    $("dCtl").innerHTML = ctl(openKey, true);
  }

  function openDish(key) {
    const sheetArt = $("sheet").querySelector(".d-art");
    $("dList").innerHTML = "";
    if (key.startsWith("combo:")) {
      const c = D.combo(key.slice(6));
      if (!c) return;
      openKey = key; openId = null;
      sheetArt.dataset.g = "combo";
      $("dArt").innerHTML = art(c, true);
      const save = D.comboFull(c) - c.price;
      $("dMeta").textContent = save > 0 ? `Комбо · выгода ${cart.rub(save)}` : "Комбо";
      $("dName").textContent = `Комбо «${c.name}»`;
      $("dDesc").textContent = c.desc || "";
      $("dList").innerHTML = c.items.map((x) => {
        const it = cart.byId[x.id];
        const o = it.options && it.options[x.opt] ? ` (${it.options[x.opt].name.toLowerCase()})` : "";
        return `<li><span class="art" data-g="${groupOf[it.id].id}">${art(it)}</span><b>${esc(it.name + o)}</b><span>× ${x.qty || 1}</span></li>`;
      }).join("");
      $("dOpts").hidden = true;
      $("dPrice").innerHTML = price(c).replace("<b>", "").replace("</b>", " ");
      $("dCtl").innerHTML = ctl(key, true);
    } else {
      const it = cart.byId[key];
      openId = key; opt = 0;
      sheetArt.dataset.g = groupOf[key].id;
      $("dArt").innerHTML = art(it, true);
      $("dMeta").textContent = groupOf[key].title + (it.off ? " · нет в наличии" : "");
      $("dName").textContent = it.name;
      $("dDesc").textContent = it.desc;
      fill();
    }
    openSheet($("sheet"));
  }

  $("dOpts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-opt]");
    if (b && openId) { opt = Number(b.dataset.opt); fill(); }
  });

  return { render, card, openDish, openKey: () => openKey, refreshChips: () => window.dispatchEvent(new Event("resize")) };
})();
