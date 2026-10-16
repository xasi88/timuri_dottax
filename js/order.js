// Заказ: список блюд, способ получения, отправка в WhatsApp.
// Один и тот же заказ показан на экране «Заказ» и в боковой панели большого экрана.

window.OrderView = (function () {
  const { esc, ico, art, ctl, toast } = window.UI;
  const C = window.CAFE, cart = window.Cart;
  const MODES = [["hall", "В зале"], ["pickup", "С собой"], ["delivery", "Доставка"]];
  const state = { mode: "hall", table: "", time: "", addr: "", note: "" };
  const mounts = [];
  const groupOf = {};
  window.MENU.forEach((g) => g.items.forEach((it) => { groupOf[it.id] = g.id; }));

  function field(f, label, ph, extra) {
    return `<label class="field" data-for="${f}"><span class="o-label">${label}</span><input data-f="${f}" placeholder="${ph}" ${extra || ""}></label>`;
  }

  function skeleton(side) {
    return `
      <h1 class="page-title">Ваш заказ</h1>
      <div class="blank" data-empty>
        <div class="blank-art">${window.ICONS.chicken}</div>
        <h2>Пока пусто</h2>
        <p>Добавьте блюда кнопкой «+». Заказ уйдёт в WhatsApp готовым сообщением.</p>
        ${side ? "" : '<a class="btn btn-primary" href="#menu">Открыть меню</a>'}
      </div>
      <div data-full hidden>
        <ul class="o-list" data-list></ul>
        <div class="o-section">
          <span class="o-label">Как получить</span>
          <div class="seg" role="radiogroup" aria-label="Как получить"><span class="seg-pill"></span>
            ${MODES.map(([m, t]) => `<button type="button" role="radio" data-mode="${m}" aria-checked="false">${t}</button>`).join("")}
          </div>
          ${field("table", "Номер стола", "Например, 7", 'inputmode="numeric" maxlength="3"')}
          ${field("time", "Когда заберёте", "Например, через 30 минут", 'maxlength="60"')}
          ${field("addr", "Адрес доставки", "Улица, дом, подъезд", 'autocomplete="street-address" maxlength="120"')}
          ${field("note", "Пожелания", "Например, без острого", 'maxlength="140"')}
        </div>
        <div class="o-total"><span>Итого</span><b data-total></b></div>
        <a class="btn btn-wa btn-wide" data-send target="_blank" rel="noopener">${ico.wa}Отправить в WhatsApp</a>
        <p class="o-hint">Откроется WhatsApp с готовым текстом. Останется нажать «Отправить».</p>
        <button class="o-clear" type="button" data-clear>Очистить заказ</button>
      </div>`;
  }

  function mount(el, side) {
    el.innerHTML = skeleton(side);
    mounts.push(el);
    el.addEventListener("click", (e) => {
      const m = e.target.closest("[data-mode]");
      if (m) { state.mode = m.dataset.mode; update(); return; }
      if (e.target.closest("[data-clear]")) { cart.clear(); toast("Заказ очищен"); return; }
      const send = e.target.closest("[data-send]");
      if (send && state.mode === "delivery" && !state.addr.trim()) {
        e.preventDefault();
        const input = el.querySelector('[data-f="addr"]');
        input.classList.remove("invalid"); void input.offsetWidth; input.classList.add("invalid");
        input.focus();
        toast("Укажите адрес доставки");
      }
    });
    el.addEventListener("input", (e) => {
      const f = e.target.dataset.f;
      if (!f) return;
      if (f === "table") e.target.value = e.target.value.replace(/\D/g, "");
      state[f] = e.target.value;
      e.target.classList.remove("invalid");
      mounts.forEach((m) => { const x = m.querySelector(`[data-f="${f}"]`); if (x !== e.target) x.value = state[f]; });
      link();
    });
    update();
  }

  function message() {
    const head = {
      hall: `Заказ в зале${state.table ? `, стол ${state.table}` : ""}`,
      pickup: `Заберу с собой${state.time.trim() ? `, ${state.time.trim()}` : ""}`,
      delivery: "Доставка",
    }[state.mode];
    const rows = cart.lines().map(({ item, qty }) => `• ${item.name} × ${qty} = ${cart.rub(item.price * qty)}`);
    const out = [`Здравствуйте! ${head}.`, "", ...rows, "", `Итого: ${cart.rub(cart.total())}`];
    if (state.mode === "delivery" && state.addr.trim()) out.push(`Адрес: ${state.addr.trim()}`);
    if (state.note.trim()) out.push(`Пожелания: ${state.note.trim()}`);
    return out.join("\n");
  }

  function link() {
    const href = `https://wa.me/${C.phone}?text=${encodeURIComponent(message())}`;
    mounts.forEach((m) => { m.querySelector("[data-send]").href = href; });
  }

  function update() {
    const lines = cart.lines();
    const idx = MODES.findIndex(([m]) => m === state.mode);
    mounts.forEach((el) => {
      el.querySelector("[data-empty]").hidden = lines.length > 0;
      el.querySelector("[data-full]").hidden = !lines.length;
      el.querySelector("[data-list]").innerHTML = lines.map(({ item, qty }) => `
        <li class="o-line"><span class="art" data-g="${groupOf[item.id]}">${art(item)}</span>
          <div><b>${esc(item.name)}</b><span>${cart.rub(item.price)} × ${qty} = ${cart.rub(item.price * qty)}</span></div>
          <span data-ctl="${item.id}">${ctl(item.id)}</span></li>`).join("");
      el.querySelector("[data-total]").textContent = cart.rub(cart.total());
      el.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === state.mode)));
      el.querySelector(".seg-pill").style.transform = `translateX(${idx * 100}%)`;
      el.querySelector('[data-for="table"]').hidden = state.mode !== "hall";
      el.querySelector('[data-for="time"]').hidden = state.mode !== "pickup";
      el.querySelector('[data-for="addr"]').hidden = state.mode !== "delivery";
      el.querySelectorAll("[data-f]").forEach((x) => { if (document.activeElement !== x) x.value = state[x.dataset.f]; });
    });
    link();
  }

  return { mount, update, message };
})();
