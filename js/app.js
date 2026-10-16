// Сборка страницы: первый экран, разделы, карточки, окна блюда и заказа.

(function () {
  const C = window.CAFE, M = window.MENU, I = window.ICONS, cart = window.Cart;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const hero = M.flatMap((g) => g.items).find((it) => it.hero);

  // Первый экран
  $("rating").innerHTML = `<i>★</i> ${C.rating}`;
  $("place").textContent = C.place;
  $("heroPrice").textContent = cart.rub(hero.price);
  $("heroIcon").innerHTML = I[hero.icon];
  $("facts").innerHTML = [C.hours, "В зале, с собой, доставка", `★ ${C.rating} · ${C.ratingCount}`].map((f) => `<li>${esc(f)}</li>`).join("");
  $("footInfo").innerHTML = `${esc(C.place)}<br>${esc(C.hours)}<br><a href="tel:+${C.phone}">${esc(C.phoneText)}</a> · <a href="https://instagram.com/${C.instagram}" target="_blank" rel="noopener">@${esc(C.instagram)}</a>`;
  $("demoNote").hidden = !C.demo;

  // Заголовок появляется по буквам, слово «углях» горит
  const title = $("title");
  let n = 0;
  title.innerHTML = title.innerHTML.split("<br>").map((line, li) =>
    [...line].map((ch) => `<span class="ch${li ? " fire" : ""}" style="animation-delay:${0.05 + n++ * 0.04}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("")
  ).join("<br>");

  // Кнопка «+», которая становится счётчиком
  function control(id, big) {
    const q = cart.qty(id);
    if (!q) return `<div class="ctl"><button class="add" type="button" data-add="${id}">${big ? "Добавить" : "+"}</button></div>`;
    return `<div class="ctl has"><button type="button" data-sub="${id}" aria-label="Убрать одну">−</button><output>${q}</output><button type="button" data-add="${id}" aria-label="Добавить ещё">+</button></div>`;
  }

  // Разделы и карточки
  $("menu").innerHTML = M.map((g) => `
    <section class="group" id="g-${g.id}">
      <div class="group-head"><h2>${esc(g.title)}</h2><p>${esc(g.note)}</p></div>
      <div class="grid">${g.items.map((it) => `
        <article class="card" data-open="${it.id}">
          <div class="art">${I[it.icon]}${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ""}</div>
          <div class="info">
            <h3>${esc(it.name)}</h3>
            <p>${esc(it.desc)}</p>
            <div class="buy"><span class="price">${cart.rub(it.price)}<small>${esc(it.weight)}</small></span><span data-ctl="${it.id}">${control(it.id)}</span></div>
          </div>
        </article>`).join("")}
      </div>
    </section>`).join("");

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".grid").forEach((grid) =>
    [...grid.children].forEach((card, i) => { card.style.transitionDelay = `${(i % 3) * 70}ms`; reveal.observe(card); })
  );

  // Полоса разделов с бегущей подложкой
  const track = $("catsTrack"), pill = $("catsPill");
  track.insertAdjacentHTML("beforeend", M.map((g) => `<a href="#g-${g.id}" data-cat="${g.id}">${esc(g.title)}</a>`).join(""));
  const links = [...track.querySelectorAll("a")];
  function setCat(id) {
    const a = links.find((l) => l.dataset.cat === id) || links[0];
    links.forEach((l) => l.classList.toggle("on", l === a));
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
    track.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
  }
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setCat(e.target.id.slice(2)); });
  }, { rootMargin: "-30% 0px -65% 0px" });
  document.querySelectorAll(".group").forEach((s) => spy.observe(s));
  document.fonts.ready.then(() => setCat(M[0].id));
  addEventListener("resize", () => setCat((links.find((l) => l.classList.contains("on")) || links[0]).dataset.cat));

  // Шапка темнеет после первого экрана
  const top = $("top");
  addEventListener("scroll", () => top.classList.toggle("solid", scrollY > 40), { passive: true });

  // Окна
  function openSheet(el) { el.classList.add("open"); el.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeSheet(el) { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  document.querySelectorAll(".sheet").forEach((s) => s.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(s); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".sheet.open").forEach(closeSheet); });

  let dishId = null;
  function openDish(id) {
    const it = cart.byId[id];
    dishId = id;
    $("dishArt").innerHTML = I[it.icon];
    $("dishWeight").textContent = it.weight;
    $("dishName").textContent = it.name;
    $("dishDesc").textContent = it.desc;
    $("dishPrice").textContent = cart.rub(it.price);
    $("dishControl").innerHTML = control(id, true);
    openSheet($("dishSheet"));
  }

  // Точка летит от кнопки к корзине
  function fly(from) {
    const bar = $("cartbar");
    if (!bar.classList.contains("show") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = from.getBoundingClientRect(), b = bar.getBoundingClientRect();
    const f = $("flyer");
    const x0 = a.left + a.width / 2 - 9, y0 = a.top + a.height / 2 - 9;
    const x1 = b.left + 30 - 9, y1 = b.top + b.height / 2 - 9;
    f.animate([
      { transform: `translate(${x0}px,${y0}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 120}px) scale(1.3)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${x1}px,${y1}px) scale(0.4)`, opacity: 0.2 },
    ], { duration: 650, easing: "cubic-bezier(.5,0,.5,1)" });
  }

  // Нажатия
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]"), sub = e.target.closest("[data-sub]");
    if (add) { e.stopPropagation(); cart.add(add.dataset.add); fly(add); return; }
    if (sub) { e.stopPropagation(); cart.sub(sub.dataset.sub); return; }
    const card = e.target.closest("[data-open]");
    if (card) openDish(card.dataset.open);
  });
  $("heroAdd").addEventListener("click", (e) => { cart.add(hero.id); fly(e.currentTarget); });
  $("cartbar").addEventListener("click", () => { renderCart(); openSheet($("cartSheet")); });

  // Форма заказа
  let mode = "hall";
  $("mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b) return;
    mode = b.dataset.mode;
    [...$("mode").children].forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    $("fieldTable").hidden = mode !== "hall";
    $("fieldTime").hidden = mode !== "pickup";
    $("fieldAddr").hidden = mode !== "delivery";
    updateLink();
  });
  ["inTable", "inTime", "inAddr", "inNote"].forEach((id) => $(id).addEventListener("input", updateLink));

  function updateLink() {
    const text = cart.message({ mode, table: $("inTable").value.trim(), time: $("inTime").value.trim(), addr: $("inAddr").value.trim(), note: $("inNote").value.trim() });
    $("sendWa").href = `https://wa.me/${C.phone}?text=${encodeURIComponent(text)}`;
  }

  function renderCart() {
    const lines = cart.lines();
    $("cartList").innerHTML = lines.map(({ item, qty }) => `
      <li><span class="mini">${I[item.icon]}</span><div><b>${esc(item.name)}</b><span>${cart.rub(item.price)} × ${qty}</span></div>${control(item.id)}</li>`).join("");
    $("cartEmpty").hidden = lines.length > 0;
    $("cartForm").hidden = !lines.length;
    $("cartTotal").textContent = cart.rub(cart.total());
    updateLink();
  }

  function sync() {
    document.querySelectorAll("[data-ctl]").forEach((el) => {
      const q = cart.qty(el.dataset.ctl);
      if (el.dataset.q !== String(q)) { el.innerHTML = control(el.dataset.ctl); el.dataset.q = q; }
    });
    if (dishId) $("dishControl").innerHTML = control(dishId, true);
    const bar = $("cartbar"), count = cart.count();
    $("cartCount").textContent = count;
    $("cartSum").textContent = cart.rub(cart.total());
    bar.classList.toggle("show", count > 0);
    bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump");
    if ($("cartSheet").classList.contains("open")) renderCart();
  }
  cart.onChange(sync);
  document.querySelectorAll("[data-ctl]").forEach((el) => { el.dataset.q = cart.qty(el.dataset.ctl); });
  $("cartbar").classList.toggle("show", cart.count() > 0);
  $("cartCount").textContent = cart.count();
  $("cartSum").textContent = cart.rub(cart.total());
})();
