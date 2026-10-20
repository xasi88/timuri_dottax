// Админка кафе: блюда, цены, фото, наличие, акции, комбо, данные кафе.
// Изменения копятся в черновике на этом устройстве. «Опубликовать» отправляет их на сайт через GitHub.

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const rub = (n) => Number(n || 0).toLocaleString("ru-RU") + " ₽";
  const cut = window.Data.cut;
  const TOKEN_KEY = "katar-admin-token";
  const DRAFT_KEY = window.Data.DRAFT_KEY;
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* нечего удалять */ } },
  };

  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    up: svg('<path d="m6 15 6-6 6 6"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>'),
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    photo: svg('<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>'),
    eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    send: svg('<path d="M4 12 20 4l-4 16-4-6z"/><path d="m12 14 8-10"/>'),
  };
  const TABS = [["dishes", "Блюда"], ["promos", "Акции"], ["combos", "Комбо"], ["cafe", "Кафе"], ["access", "Доступ"]];
  const BADGES = ["Хит", "Новинка", "Острое", "Любят", "Премиум", "Сезон"];

  let base = clone(window.KATAR); // то, что сейчас на сайте
  let data = null; // черновик
  let token = ls.get(TOKEN_KEY);
  let online = false;
  let tab = (location.hash || "").slice(1) || "dishes";
  if (!TABS.some(([t]) => t === tab)) tab = "dishes";
  let ed = null; // что открыто в редакторе
  let busy = false;

  // Подсказка снизу
  let toastTimer;
  function toast(text, long) {
    const t = $("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), long ? 4200 : 2200);
  }

  const dirty = () => JSON.stringify(data) !== JSON.stringify(base);
  function save() {
    if (dirty()) {
      if (!ls.set(DRAFT_KEY, JSON.stringify(data))) toast("Мало места на устройстве. Опубликуйте изменения.", true);
    } else ls.del(DRAFT_KEY);
    renderDock();
  }

  const allItems = () => data.menu.flatMap((g) => g.items);
  const findItem = (id) => allItems().find((it) => it.id === id);
  const thumb = (o) => (o && o.photo ? `<img src="${esc(o.photo)}" alt="" loading="lazy">` : (window.ICONS[o && o.icon] || window.ICONS.plate));
  const comboFull = (c) => c.items.reduce((s, x) => {
    const it = findItem(x.id);
    if (!it) return s;
    const p = it.options && it.options[x.opt] ? it.options[x.opt].price : it.price;
    return s + p * (x.qty || 1);
  }, 0);
  const itemName = (x) => {
    const it = findItem(x.id);
    if (!it) return "Удалённое блюдо";
    return it.options && it.options[x.opt] ? `${it.name} (${it.options[x.opt].name.toLowerCase()})` : it.name;
  };
  function priceText(it) {
    const min = it.options && it.options.length ? Math.min(...it.options.map((o) => o.price)) : it.price;
    const from = it.options && it.options.length > 1 ? "от " : "";
    return it.discount > 0 ? `${from}${rub(cut(min, it.discount))} <s>${rub(min)}</s> −${it.discount}%` : `${from}${rub(min)}`;
  }

  // ---------- Вкладки ----------

  function render() {
    $("tabs").innerHTML = TABS.map(([t, name]) => `<button type="button" data-tab="${t}" aria-current="${t === tab ? "page" : "false"}">${name}</button>`).join("");
    $("mode").className = "adm-mode" + (online ? " on" : "");
    $("mode").textContent = online ? "GitHub подключён" : "Без публикации";
    const views = { dishes, promos, combos, cafe, access };
    $("main").innerHTML = views[tab]();
    renderDock();
  }

  function renderDock() {
    const d = data && dirty();
    $("dock").innerHTML = `
      <div class="adm-dock-in">
        <span class="adm-state${d ? " is-dirty" : ""}">${d ? "Есть изменения. Гости их пока не видят." : "Всё опубликовано"}</span>
        ${d ? `<button type="button" class="adm-link" data-act="reset">Отменить всё</button>` : ""}
        <a class="btn btn-soft adm-dock-btn" href="index.html?preview" target="_blank" rel="noopener">${I.eye}<span>Просмотр</span></a>
        <button type="button" class="btn btn-primary adm-dock-btn" data-act="publish" ${!d || busy ? "disabled" : ""}>${I.send}<span>${busy ? "Отправляю…" : "Опубликовать"}</span></button>
      </div>`;
  }

  function dishes() {
    return `
      <div class="adm-head"><h1>Блюда</h1><p>Нажмите на блюдо, чтобы поменять название, цену, фото или скидку. Переключатель справа: блюдо есть в наличии.</p></div>
      ${data.menu.map((g, gi) => `
        <section class="adm-group">
          <div class="adm-ghead">
            <h2>${esc(g.title)} <small>${g.items.length}</small></h2>
            <button type="button" class="adm-icon" data-act="g-up" data-g="${gi}" aria-label="Раздел выше" ${gi === 0 ? "disabled" : ""}>${I.up}</button>
            <button type="button" class="adm-icon" data-act="g-down" data-g="${gi}" aria-label="Раздел ниже" ${gi === data.menu.length - 1 ? "disabled" : ""}>${I.down}</button>
            <button type="button" class="adm-icon" data-act="g-edit" data-g="${gi}" aria-label="Изменить раздел">${I.edit}</button>
          </div>
          <ul class="adm-list">${g.items.map((it, ii) => `
            <li class="adm-row${it.off ? " is-off" : ""}">
              <button type="button" class="adm-row-main" data-act="dish-edit" data-g="${gi}" data-i="${ii}">
                <span class="adm-thumb">${thumb(it)}</span>
                <span class="adm-row-text"><b>${esc(it.name) || "Без названия"}</b><small>${priceText(it)}${it.hit ? " · хит" : ""}${it.hero ? " · главное" : ""}${it.off ? " · нет в наличии" : ""}</small></span>
              </button>
              <label class="adm-switch" aria-label="${esc(it.name)}: есть в наличии"><input type="checkbox" data-act="dish-avail" data-g="${gi}" data-i="${ii}" ${it.off ? "" : "checked"}><i></i></label>
            </li>`).join("")}
          </ul>
          <button type="button" class="adm-add" data-act="dish-new" data-g="${gi}">${I.plus}Добавить блюдо в «${esc(g.title)}»</button>
        </section>`).join("")}
      <button type="button" class="btn btn-soft btn-wide" data-act="g-new">${I.plus}Новый раздел меню</button>`;
  }

  function promos() {
    const P = data.promos, b = P.bonus;
    const discounted = allItems().filter((it) => it.discount > 0);
    return `
      <div class="adm-head"><h1>Акции</h1><p>Всё, что привлекает гостей: скидка на заказ, карточки акций на главной, хиты и скидки на блюда.</p></div>

      <section class="adm-card">
        <div class="adm-card-head"><div><h2>Скидка на весь заказ</h2><p>Гость набирает сумму и получает скидку. Корзина сама подсказывает, сколько осталось.</p></div>
          <label class="adm-switch" aria-label="Скидка на заказ включена"><input type="checkbox" data-act="bonus-on" ${b.active ? "checked" : ""}><i></i></label></div>
        <div class="adm-two">
          <label class="adm-field"><span>От суммы, ₽</span><input type="number" inputmode="numeric" min="0" step="100" data-act="bonus-min" value="${b.min}"></label>
          <label class="adm-field"><span>Скидка, %</span><input type="number" inputmode="numeric" min="1" max="50" data-act="bonus-pct" value="${b.percent}"></label>
        </div>
        <p class="adm-note">Гость увидит: «Добавьте ещё на 500 ₽, и будет скидка ${b.percent}% на весь заказ».</p>
      </section>

      <section class="adm-card">
        <div class="adm-card-head"><div><h2>Карточки акций</h2><p>Яркие карточки под главным блюдом. Можно поставить срок: после него карточка пропадёт сама.</p></div></div>
        <ul class="adm-list">${P.banners.map((x, i) => `
          <li class="adm-row${x.active === false ? " is-off" : ""}">
            <button type="button" class="adm-row-main" data-act="ban-edit" data-i="${i}">
              <span class="adm-thumb adm-fire">🔥</span>
              <span class="adm-row-text"><b>${esc(x.title) || "Без заголовка"}</b><small>${esc(x.text)}${x.until ? ` · до ${esc(x.until.split("-").reverse().join("."))}` : ""}</small></span>
            </button>
            <label class="adm-switch" aria-label="Акция включена"><input type="checkbox" data-act="ban-on" data-i="${i}" ${x.active === false ? "" : "checked"}><i></i></label>
          </li>`).join("") || `<li class="adm-empty">Акций пока нет.</li>`}
        </ul>
        <button type="button" class="adm-add" data-act="ban-new">${I.plus}Новая акция</button>
      </section>

      <section class="adm-card">
        <div class="adm-card-head"><div><h2>Хиты</h2><p>Блюда, которые хотите продавать чаще. Они стоят отдельным разделом в начале меню.</p></div></div>
        <div class="adm-chips">${allItems().map((it) => `<button type="button" data-act="hit" data-id="${esc(it.id)}" aria-pressed="${!!it.hit}">${esc(it.name)}</button>`).join("")}</div>
      </section>

      <section class="adm-card">
        <div class="adm-card-head"><div><h2>Главное блюдо</h2><p>Большое фото на первом экране меню.</p></div></div>
        <label class="adm-field"><span>Блюдо</span><select data-act="hero">${allItems().map((it) => `<option value="${esc(it.id)}" ${it.hero ? "selected" : ""}>${esc(it.name)}</option>`).join("")}</select></label>
      </section>

      <section class="adm-card">
        <div class="adm-card-head"><div><h2>Скидки на блюда</h2><p>Скидку ставьте в карточке блюда: поле «Скидка, %». Гость видит старую цену зачёркнутой.</p></div></div>
        <ul class="adm-list">${discounted.map((it) => {
          const gi = data.menu.findIndex((g) => g.items.includes(it)), ii = data.menu[gi].items.indexOf(it);
          return `<li class="adm-row"><button type="button" class="adm-row-main" data-act="dish-edit" data-g="${gi}" data-i="${ii}"><span class="adm-thumb">${thumb(it)}</span><span class="adm-row-text"><b>${esc(it.name)}</b><small>${priceText(it)}</small></span></button></li>`;
        }).join("") || `<li class="adm-empty">Скидок на блюда сейчас нет.</li>`}
        </ul>
      </section>`;
  }

  function combos() {
    return `
      <div class="adm-head"><h1>Комбо</h1><p>Набор блюд по цене ниже, чем по отдельности. Гость видит выгоду в рублях.</p></div>
      <ul class="adm-list adm-list-big">${data.promos.combos.map((c, i) => {
        const full = comboFull(c);
        return `<li class="adm-row${c.active === false ? " is-off" : ""}">
          <button type="button" class="adm-row-main" data-act="combo-edit" data-i="${i}">
            <span class="adm-thumb">${c.photo ? thumb(c) : thumb(findItem((c.items[0] || {}).id))}</span>
            <span class="adm-row-text"><b>Комбо «${esc(c.name) || "без названия"}»</b><small>${rub(c.price)}${full > c.price ? ` · выгода ${rub(full - c.price)}` : ""} · ${esc(c.items.map(itemName).join(", "))}</small></span>
          </button>
          <label class="adm-switch" aria-label="Комбо включено"><input type="checkbox" data-act="combo-on" data-i="${i}" ${c.active === false ? "" : "checked"}><i></i></label>
        </li>`;
      }).join("") || `<li class="adm-empty">Комбо пока нет.</li>`}
      </ul>
      <button type="button" class="btn btn-primary btn-wide" data-act="combo-new">${I.plus}Новое комбо</button>`;
  }

  function cafe() {
    const C = data.cafe;
    const f = (key, label, extra, hint) => `<label class="adm-field"><span>${label}</span><input data-cafe="${key}" value="${esc(C[key])}" ${extra || ""}>${hint ? `<small>${hint}</small>` : ""}</label>`;
    return `
      <div class="adm-head"><h1>Кафе</h1><p>Название, адрес, телефоны и часы работы. Видно на экране «Кафе» и в заказе.</p></div>
      <section class="adm-card">
        ${f("name", "Название")}
        ${f("tagline", "Подпись под названием")}
        ${f("place", "Адрес")}
        ${f("hours", "Часы работы (текст)")}
        <div class="adm-two">
          <label class="adm-field"><span>Открываемся, час</span><input type="number" min="0" max="23" data-cafe="open" value="${C.open}"></label>
          <label class="adm-field"><span>Закрываемся, час</span><input type="number" min="1" max="24" data-cafe="close" value="${C.close}"><small>24 значит полночь</small></label>
        </div>
      </section>
      <section class="adm-card">
        ${f("phone", "WhatsApp для заказов (цифры)", 'inputmode="numeric" maxlength="11"', "11 цифр, начиная с 7. Сюда приходят заказы.")}
        ${f("phoneText", "Этот номер, как показать гостю")}
        ${f("phone2", "Второй телефон (цифры)", 'inputmode="numeric" maxlength="11"')}
        ${f("phone2Text", "Второй телефон, как показать гостю")}
        ${f("instagram", "Instagram (без @)")}
        ${f("mapUrl", "Ссылка на карту", 'inputmode="url"')}
        <label class="adm-field"><span>Удобства (через запятую)</span><input data-cafe="features" value="${esc((C.features || []).join(", "))}"></label>
        <label class="adm-check"><input type="checkbox" data-cafe="demo" ${C.demo ? "checked" : ""}><span>Показывать пометку «Бета-версия» внизу меню</span></label>
      </section>`;
  }

  function access() {
    const r = window.GH.repo();
    return `
      <div class="adm-head"><h1>Доступ</h1><p>Чтобы изменения попали на сайт, админка сохраняет их на GitHub. Там лежит сайт, и он бесплатный.</p></div>
      <section class="adm-card">
        ${token ? `
          <p class="adm-ok">${online ? "Подключено" : "Ключ сохранён, но GitHub не ответил"}: хранилище <b>${esc(r.owner)}/${esc(r.name)}</b>.</p>
          <p class="adm-note">Ключ хранится только на этом устройстве. На другом телефоне его нужно ввести заново.</p>
          <button type="button" class="btn btn-soft btn-wide" data-act="logout">Отключить это устройство</button>` : `
          <label class="adm-field"><span>Ключ доступа GitHub</span><input type="password" id="tokenIn" autocomplete="off" placeholder="github_pat_…"></label>
          <button type="button" class="btn btn-primary btn-wide" data-act="login">Подключить</button>
          <p class="adm-note">Без ключа админка работает как черновик: всё можно менять и смотреть в «Просмотре» на этом устройстве, но гости изменений не увидят.</p>`}
      </section>
      <section class="adm-card">
        <h2>Как получить ключ (один раз)</h2>
        <ol class="adm-steps">
          <li>Войдите в GitHub под владельцем сайта.</li>
          <li>Откройте <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Settings → Fine-grained tokens → Generate new token</a>.</li>
          <li>Repository access: <b>Only select repositories</b> → <b>${esc(r.name)}</b>.</li>
          <li>Permissions → Repository permissions → <b>Contents: Read and write</b>.</li>
          <li>Срок: 1 год. Нажмите <b>Generate token</b>, скопируйте ключ и вставьте выше.</li>
        </ol>
      </section>`;
  }

  // ---------- Редактор (окно снизу) ----------

  function openEd(state) {
    ed = state;
    drawEd();
    const sheet = $("ed");
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => sheet.querySelector(".sheet-card").focus({ preventScroll: true }), 50);
  }
  function closeEd() {
    ed = null;
    const sheet = $("ed");
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  const field = (f, label, value, extra, hint) => `<label class="adm-field"><span>${label}</span><input data-f="${f}" value="${esc(value)}" ${extra || ""}>${hint ? `<small>${hint}</small>` : ""}</label>`;
  const photoBox = (o) => `
    <div class="adm-photo">
      <span class="adm-photo-img">${thumb(o)}</span>
      <div class="adm-photo-btns">
        <label class="btn btn-soft adm-upload">${I.photo}<span>${o.photo ? "Заменить фото" : "Загрузить фото"}</span><input type="file" accept="image/*" data-act="photo" hidden></label>
        ${o.photo ? `<button type="button" class="adm-link" data-act="photo-del">Убрать фото</button>` : ""}
      </div>
    </div>`;

  function drawEd() {
    const o = ed.obj;
    let html = "";
    if (ed.kind === "dish") {
      const opts = o.options || [];
      const base0 = opts.length ? Math.min(...opts.map((x) => Number(x.price) || 0)) : Number(o.price) || 0;
      html = `
        <h2 class="adm-ed-title">${ed.isNew ? "Новое блюдо" : "Блюдо"}</h2>
        ${photoBox(o)}
        ${field("name", "Название", o.name, 'maxlength="60" required')}
        <label class="adm-field"><span>Описание</span><textarea data-f="desc" rows="2" maxlength="160">${esc(o.desc)}</textarea></label>
        <label class="adm-field"><span>Раздел</span><select data-f="group">${data.menu.map((g, gi) => `<option value="${gi}" ${gi === ed.g ? "selected" : ""}>${esc(g.title)}</option>`).join("")}</select></label>
        <div class="adm-two">
          ${opts.length ? `<label class="adm-field"><span>Цена, ₽</span><input value="по вариантам" disabled></label>` : field("price", "Цена, ₽", o.price || "", 'type="number" inputmode="numeric" min="1"')}
          ${field("discount", "Скидка, %", o.discount || "", 'type="number" inputmode="numeric" min="0" max="90" placeholder="0"')}
        </div>
        ${o.discount > 0 && base0 ? `<p class="adm-note">Гость увидит: <b>${rub(cut(base0, o.discount))}</b> вместо <s>${rub(base0)}</s>.</p>` : ""}
        <div class="adm-sub">
          <span class="adm-sub-title">Варианты <small>например, «Порция» и «Целая»</small></span>
          ${opts.map((x, k) => `
            <div class="adm-opt">
              <input data-f="opt-name" data-k="${k}" value="${esc(x.name)}" placeholder="Название" aria-label="Название варианта">
              <input data-f="opt-price" data-k="${k}" value="${esc(x.price)}" type="number" inputmode="numeric" placeholder="Цена" aria-label="Цена варианта">
              <button type="button" class="adm-icon" data-act="opt-del" data-k="${k}" aria-label="Убрать вариант">${I.trash}</button>
            </div>`).join("")}
          <button type="button" class="adm-add" data-act="opt-new">${I.plus}Добавить вариант</button>
        </div>
        <label class="adm-field"><span>Подпись на фото</span><input data-f="badge" value="${esc(o.badge)}" list="badges" maxlength="14" placeholder="Нет"><datalist id="badges">${BADGES.map((b) => `<option value="${b}">`).join("")}</datalist></label>
        <label class="adm-check"><input type="checkbox" data-f="hit" ${o.hit ? "checked" : ""}><span>Показать в «Хитах»</span></label>
        <label class="adm-check"><input type="checkbox" data-f="hero" ${o.hero ? "checked" : ""}><span>Главное блюдо на первом экране</span></label>
        <label class="adm-check"><input type="checkbox" data-f="off" ${o.off ? "checked" : ""}><span>Нет в наличии (блюдо видно, но заказать нельзя)</span></label>
        ${ed.isNew ? "" : `<div class="adm-move"><button type="button" class="btn btn-soft" data-act="dish-up">${I.up}Выше</button><button type="button" class="btn btn-soft" data-act="dish-down">${I.down}Ниже</button></div>`}
        <div class="adm-ed-btns">
          <button type="button" class="btn btn-primary btn-wide" data-act="ed-ok">Готово</button>
          ${ed.isNew ? "" : `<button type="button" class="adm-danger" data-act="dish-del">${I.trash}Удалить блюдо</button>`}
        </div>`;
    } else if (ed.kind === "group") {
      html = `
        <h2 class="adm-ed-title">${ed.isNew ? "Новый раздел" : "Раздел меню"}</h2>
        ${field("title", "Название раздела", o.title, 'maxlength="30"')}
        ${field("note", "Подпись под названием", o.note, 'maxlength="80"')}
        <div class="adm-ed-btns">
          <button type="button" class="btn btn-primary btn-wide" data-act="ed-ok">Готово</button>
          ${ed.isNew ? "" : `<button type="button" class="adm-danger" data-act="g-del">${I.trash}Удалить раздел</button>`}
        </div>`;
    } else if (ed.kind === "banner") {
      html = `
        <h2 class="adm-ed-title">${ed.isNew ? "Новая акция" : "Акция"}</h2>
        ${field("title", "Заголовок", o.title, 'maxlength="40" placeholder="Например, Скидка 20% на чай"')}
        <label class="adm-field"><span>Текст</span><textarea data-f="text" rows="2" maxlength="120">${esc(o.text)}</textarea></label>
        <div class="adm-two">
          ${field("tag", "Ярлык", o.tag, 'list="tags" maxlength="12"')}
          ${field("until", "Действует до", o.until, 'type="date"', "Пусто: без срока")}
        </div>
        <datalist id="tags"><option value="Акция"><option value="Выгода"><option value="Новинка"><option value="Хит"></datalist>
        <label class="adm-field"><span>Что открыть по нажатию</span><select data-f="target">
          <option value="">Ничего</option>
          ${data.promos.combos.map((c) => `<option value="combo:${esc(c.id)}" ${o.target === "combo:" + c.id ? "selected" : ""}>Комбо «${esc(c.name)}»</option>`).join("")}
          ${allItems().map((it) => `<option value="${esc(it.id)}" ${o.target === it.id ? "selected" : ""}>${esc(it.name)}</option>`).join("")}
        </select></label>
        <label class="adm-check"><input type="checkbox" data-f="active" ${o.active === false ? "" : "checked"}><span>Показывать гостям</span></label>
        <div class="adm-ed-btns">
          <button type="button" class="btn btn-primary btn-wide" data-act="ed-ok">Готово</button>
          ${ed.isNew ? "" : `<button type="button" class="adm-danger" data-act="ban-del">${I.trash}Удалить акцию</button>`}
        </div>`;
    } else if (ed.kind === "combo") {
      const full = comboFull(o);
      const choices = allItems().flatMap((it) => (it.options && it.options.length ? it.options.map((x, k) => [`${it.id}@${k}`, `${it.name} (${x.name.toLowerCase()})`]) : [[it.id, it.name]]));
      html = `
        <h2 class="adm-ed-title">${ed.isNew ? "Новое комбо" : "Комбо"}</h2>
        ${photoBox(o)}
        <p class="adm-note">Без фото гость увидит коллаж из фото блюд.</p>
        ${field("name", "Название", o.name, 'maxlength="30" placeholder="Например, Семейное"')}
        ${field("desc", "Описание", o.desc, 'maxlength="80"')}
        <div class="adm-sub">
          <span class="adm-sub-title">Что входит</span>
          ${o.items.map((x, k) => `
            <div class="adm-opt">
              <select data-f="ci-id" data-k="${k}" aria-label="Блюдо">${choices.map(([v, n]) => `<option value="${esc(v)}" ${v === (x.opt !== undefined ? `${x.id}@${x.opt}` : x.id) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
              <input data-f="ci-qty" data-k="${k}" value="${x.qty || 1}" type="number" inputmode="numeric" min="1" max="20" aria-label="Количество">
              <button type="button" class="adm-icon" data-act="ci-del" data-k="${k}" aria-label="Убрать блюдо">${I.trash}</button>
            </div>`).join("")}
          <button type="button" class="adm-add" data-act="ci-new">${I.plus}Добавить блюдо</button>
        </div>
        <p class="adm-note">По отдельности: <b>${rub(full)}</b>.${o.price && full > o.price ? ` Выгода гостя: <b>${rub(full - o.price)}</b> (${Math.round(((full - o.price) / full) * 100)}%).` : ""}</p>
        <div class="adm-two">
          ${field("price", "Цена комбо, ₽", o.price || "", 'type="number" inputmode="numeric" min="1"')}
          <div class="adm-quick"><span>Быстро</span><div>${[10, 15, 20].map((p) => `<button type="button" data-act="ci-pct" data-p="${p}">−${p}%</button>`).join("")}</div></div>
        </div>
        <label class="adm-check"><input type="checkbox" data-f="active" ${o.active === false ? "" : "checked"}><span>Показывать гостям</span></label>
        <div class="adm-ed-btns">
          <button type="button" class="btn btn-primary btn-wide" data-act="ed-ok">Готово</button>
          ${ed.isNew ? "" : `<button type="button" class="adm-danger" data-act="combo-del">${I.trash}Удалить комбо</button>`}
        </div>`;
    }
    $("edBody").innerHTML = html;
  }

  // Поле редактора изменилось
  function edInput(el) {
    const o = ed.obj, f = el.dataset.f, k = Number(el.dataset.k);
    const n = (v) => (v === "" ? 0 : Math.round(Number(v)));
    if (f === "opt-name") o.options[k].name = el.value;
    else if (f === "opt-price") o.options[k].price = n(el.value);
    else if (f === "ci-id") { const [id, opt] = el.value.split("@"); o.items[k] = { id, qty: o.items[k].qty || 1 }; if (opt !== undefined) o.items[k].opt = Number(opt); }
    else if (f === "ci-qty") o.items[k].qty = Math.max(1, n(el.value));
    else if (f === "group") ed.g = Number(el.value);
    else if (["hit", "hero", "off"].includes(f)) o[f] = el.checked;
    else if (f === "active") o.active = el.checked;
    else if (["price", "discount"].includes(f)) o[f] = n(el.value);
    else o[f] = el.value;
    // Перерисовать подсказки с суммами, не сбивая ввод
    if (["discount", "price", "opt-price", "ci-id", "ci-qty"].includes(f) || el.tagName === "SELECT") {
      const pos = el.selectionStart, sel = `[data-f="${f}"]${el.dataset.k !== undefined ? `[data-k="${k}"]` : ""}`;
      drawEd();
      const again = $("edBody").querySelector(sel);
      if (again && el.tagName !== "SELECT") { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { /* поле числа без курсора */ } }
    }
  }

  // Сохранить то, что в редакторе, в черновик
  function edOk() {
    const o = ed.obj;
    if (ed.kind === "dish") {
      o.name = o.name.trim();
      if (!o.name) return toast("Впишите название блюда");
      if (o.options && o.options.length) {
        o.options = o.options.filter((x) => String(x.name).trim() && x.price > 0);
        if (!o.options.length) delete o.options;
        else o.price = Math.min(...o.options.map((x) => x.price));
      }
      if (!(o.price > 0)) return toast("Укажите цену");
      ["badge", "discount", "hit", "hero", "off", "photo"].forEach((key) => { if (!o[key]) delete o[key]; });
      if (o.badge) o.badge = o.badge.trim();
      if (o.hero) allItems().forEach((it) => { delete it.hero; });
      if (ed.isNew) {
        o.id = window.AdminData.slug(o.name, new Set(allItems().map((it) => it.id)));
        data.menu[ed.g].items.push(o);
      } else if (ed.g !== ed.g0) {
        data.menu[ed.g0].items.splice(ed.i, 1);
        data.menu[ed.g].items.push(o);
      } else data.menu[ed.g].items[ed.i] = o;
      if (!allItems().some((it) => it.hero)) allItems()[0].hero = true;
    } else if (ed.kind === "group") {
      o.title = o.title.trim();
      if (!o.title) return toast("Впишите название раздела");
      if (ed.isNew) {
        o.id = window.AdminData.slug(o.title, new Set(data.menu.map((g) => g.id)));
        data.menu.push(o);
      } else data.menu[ed.g] = o;
    } else if (ed.kind === "banner") {
      if (!o.title.trim()) return toast("Впишите заголовок");
      if (ed.isNew) data.promos.banners.push(o); else data.promos.banners[ed.i] = o;
    } else if (ed.kind === "combo") {
      if (!o.name.trim()) return toast("Впишите название комбо");
      if (!o.items.length) return toast("Добавьте блюда в комбо");
      if (!(o.price > 0)) return toast("Укажите цену комбо");
      if (!o.photo) delete o.photo;
      if (ed.isNew) {
        o.id = window.AdminData.slug(o.name, new Set(data.promos.combos.map((c) => c.id)));
        data.promos.combos.push(o);
      } else data.promos.combos[ed.i] = o;
    }
    closeEd();
    save();
    render();
    toast("Сохранено в черновик");
  }

  // Фото с телефона: квадрат 720×720, сжатое
  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const size = Math.min(720, side);
        const c = document.createElement("canvas");
        c.width = c.height = size;
        c.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(url);
        let out = c.toDataURL("image/webp", 0.8);
        if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", 0.85);
        resolve(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Не удалось открыть фото")); };
      img.src = url;
    });
  }

  // ---------- Публикация ----------

  async function publish() {
    if (!token) { tab = "access"; render(); toast("Сначала подключите GitHub", true); return; }
    const errs = window.AdminData.check(data);
    if (errs.length) { alert("Исправьте перед публикацией:\n\n" + errs.slice(0, 8).join("\n")); return; }
    if (!confirm("Опубликовать изменения? Гости увидят новое меню через несколько минут.")) return;
    busy = true;
    renderDock();
    try {
      const out = clone(data), files = [], stamp = Date.now().toString(36);
      const put = (o, name) => {
        if (!o.photo || !o.photo.startsWith("data:")) return;
        const [head, b64] = o.photo.split(",");
        const path = `img/food/u-${name}-${stamp}${files.length}.${head.includes("webp") ? "webp" : "jpg"}`;
        files.push({ path, base64: b64 });
        o.photo = path;
      };
      out.menu.forEach((g) => g.items.forEach((it) => put(it, it.id)));
      out.promos.combos.forEach((c) => put(c, "combo-" + c.id));
      files.push({ path: "data/menu.js", text: window.AdminData.toFile(out) });
      await window.GH.commit(token, files, "Меню: изменения из админки");
      base = out;
      data = clone(out);
      busy = false;
      save();
      render();
      toast("Опубликовано. Сайт обновится через несколько минут.", true);
    } catch (e) {
      busy = false;
      renderDock();
      toast(e.message || "Не получилось. Проверьте интернет.", true);
    }
  }

  // ---------- Нажатия и ввод ----------

  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };

  document.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-tab]");
    if (t) { tab = t.dataset.tab; history.replaceState(null, "", "#" + tab); render(); scrollTo(0, 0); return; }
    if (e.target.closest("[data-close]") && e.target.closest("#ed")) { closeEd(); return; }
    const a = e.target.closest("[data-act]");
    if (!a || a.tagName === "INPUT" || a.tagName === "SELECT") return;
    const act = a.dataset.act, g = Number(a.dataset.g), i = Number(a.dataset.i), k = Number(a.dataset.k);
    switch (act) {
      case "publish": publish(); return;
      case "reset":
        if (confirm("Отменить все изменения и вернуть меню как на сайте?")) { data = clone(base); save(); render(); toast("Черновик отменён"); }
        return;
      case "g-up": case "g-down": if (move(data.menu, g, act === "g-up" ? -1 : 1)) { save(); render(); } return;
      case "g-edit": openEd({ kind: "group", g, obj: clone(data.menu[g]) }); return;
      case "g-new": openEd({ kind: "group", isNew: true, obj: { id: "", title: "", note: "", items: [] } }); return;
      case "g-del":
        if (data.menu[ed.g].items.length) { toast("Сначала перенесите или удалите блюда раздела", true); return; }
        if (confirm(`Удалить раздел «${data.menu[ed.g].title}»?`)) { data.menu.splice(ed.g, 1); closeEd(); save(); render(); }
        return;
      case "dish-edit": openEd({ kind: "dish", g, g0: g, i, obj: clone(data.menu[g].items[i]) }); return;
      case "dish-new": {
        const icon = (data.menu[g].items[0] || {}).icon || "plate";
        openEd({ kind: "dish", isNew: true, g, obj: { id: "", name: "", desc: "", price: 0, icon } });
        return;
      }
      case "dish-up": case "dish-down":
        if (ed.g === ed.g0 && move(data.menu[ed.g].items, ed.i, act === "dish-up" ? -1 : 1)) { ed.i += act === "dish-up" ? -1 : 1; save(); render(); toast("Порядок изменён"); }
        return;
      case "dish-del": {
        const it = data.menu[ed.g0].items[ed.i];
        const inCombo = data.promos.combos.filter((c) => c.items.some((x) => x.id === it.id));
        if (inCombo.length) { toast(`Блюдо входит в комбо «${inCombo[0].name}». Сначала уберите его оттуда.`, true); return; }
        if (confirm(`Удалить «${it.name}» из меню?`)) {
          data.menu[ed.g0].items.splice(ed.i, 1);
          data.promos.banners.forEach((b) => { if (b.target === it.id) b.target = ""; });
          if (it.hero && allItems()[0]) allItems()[0].hero = true;
          closeEd(); save(); render(); toast("Блюдо удалено");
        }
        return;
      }
      case "opt-new":
        ed.obj.options = ed.obj.options || [];
        if (!ed.obj.options.length) ed.obj.options.push({ name: "Порция", price: ed.obj.price || 0 });
        ed.obj.options.push({ name: "", price: 0 });
        drawEd(); return;
      case "opt-del": ed.obj.options.splice(k, 1); drawEd(); return;
      case "photo-del": delete ed.obj.photo; drawEd(); return;
      case "ban-edit": openEd({ kind: "banner", i, obj: clone(data.promos.banners[i]) }); return;
      case "ban-new": openEd({ kind: "banner", isNew: true, obj: { id: "b-" + Date.now().toString(36), title: "", text: "", tag: "Акция", target: "", active: true, until: "" } }); return;
      case "ban-del": if (confirm("Удалить акцию?")) { data.promos.banners.splice(ed.i, 1); closeEd(); save(); render(); } return;
      case "hit": { const it = findItem(a.dataset.id); if (it.hit) delete it.hit; else it.hit = true; a.setAttribute("aria-pressed", String(!!it.hit)); save(); return; }
      case "combo-edit": openEd({ kind: "combo", i, obj: clone(data.promos.combos[i]) }); return;
      case "combo-new": {
        const first = allItems().filter((it) => !it.off).slice(0, 2).map((it) => (it.options && it.options.length ? { id: it.id, opt: 0, qty: 1 } : { id: it.id, qty: 1 }));
        openEd({ kind: "combo", isNew: true, obj: { id: "", name: "", desc: "", items: first, price: 0, active: true } });
        return;
      }
      case "combo-del":
        if (confirm(`Удалить комбо «${data.promos.combos[ed.i].name}»?`)) {
          const id = data.promos.combos[ed.i].id;
          data.promos.combos.splice(ed.i, 1);
          data.promos.banners.forEach((b) => { if (b.target === "combo:" + id) b.target = ""; });
          closeEd(); save(); render();
        }
        return;
      case "ci-new": {
        const it = allItems()[0];
        ed.obj.items.push(it.options && it.options.length ? { id: it.id, opt: 0, qty: 1 } : { id: it.id, qty: 1 });
        drawEd(); return;
      }
      case "ci-del": ed.obj.items.splice(k, 1); drawEd(); return;
      case "ci-pct": ed.obj.price = Math.round((comboFull(ed.obj) * (100 - Number(a.dataset.p))) / 1000) * 10; drawEd(); return;
      case "ed-ok": edOk(); return;
      case "login": {
        const v = ($("tokenIn").value || "").trim();
        if (!v) { toast("Вставьте ключ"); return; }
        a.disabled = true;
        try {
          const name = await window.GH.check(v);
          token = v; ls.set(TOKEN_KEY, v); online = true;
          toast(`Подключено: ${name}`);
          await loadLive();
        } catch (err) { toast(err.message, true); }
        render();
        return;
      }
      case "logout":
        if (confirm("Отключить это устройство? Ключ удалится из браузера.")) { token = null; online = false; ls.del(TOKEN_KEY); render(); }
        return;
    }
  });

  document.addEventListener("change", async (e) => {
    const el = e.target, act = el.dataset.act;
    if (act === "photo" && el.files && el.files[0]) {
      try { ed.obj.photo = await readPhoto(el.files[0]); drawEd(); toast("Фото добавлено"); } catch (err) { toast(err.message); }
      return;
    }
    const i = Number(el.dataset.i), g = Number(el.dataset.g);
    if (act === "dish-avail") { const it = data.menu[g].items[i]; if (el.checked) delete it.off; else it.off = true; save(); render(); return; }
    if (act === "ban-on") { data.promos.banners[i].active = el.checked; save(); render(); return; }
    if (act === "combo-on") { data.promos.combos[i].active = el.checked; save(); render(); return; }
    if (act === "bonus-on") { data.promos.bonus.active = el.checked; save(); return; }
    if (act === "hero") { allItems().forEach((it) => { delete it.hero; }); findItem(el.value).hero = true; save(); return; }
    if (el.closest("#edBody") && el.dataset.f && (el.type === "checkbox" || el.tagName === "SELECT")) edInput(el);
  });

  document.addEventListener("input", (e) => {
    const el = e.target, act = el.dataset.act;
    if (el.closest("#edBody") && el.dataset.f && el.type !== "checkbox" && el.tagName !== "SELECT") { edInput(el); return; }
    if (act === "bonus-min") { data.promos.bonus.min = Math.max(0, Math.round(Number(el.value) || 0)); save(); return; }
    if (act === "bonus-pct") { data.promos.bonus.percent = Math.min(90, Math.max(0, Math.round(Number(el.value) || 0))); save(); return; }
    const key = el.dataset.cafe;
    if (key) {
      const C = data.cafe;
      if (key === "features") C.features = el.value.split(",").map((s) => s.trim()).filter(Boolean);
      else if (key === "demo") C.demo = el.checked;
      else if (key === "open" || key === "close") C[key] = Math.round(Number(el.value) || 0);
      else if (key === "phone" || key === "phone2") C[key] = el.value.replace(/\D/g, "");
      else C[key] = el.value;
      save();
    }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ed) closeEd(); });
  addEventListener("beforeunload", (e) => { if (busy) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- Запуск ----------

  // С ключом берём свежее меню прямо из GitHub: сайт обновляется с задержкой
  async function loadLive() {
    try {
      base = window.AdminData.fromFile(await window.GH.readFile(token, "data/menu.js"));
      online = true;
    } catch (e) {
      online = false;
      toast(e.message, true);
    }
  }

  (async function start() {
    if (token) await loadLive();
    let draft = null;
    try { draft = JSON.parse(ls.get(DRAFT_KEY)); } catch (e) { draft = null; }
    data = draft && draft.menu ? draft : clone(base);
    data.promos = Object.assign({ banners: [], combos: [], bonus: { active: false, min: 3000, percent: 10 } }, data.promos);
    render();
    if (draft && dirty()) toast("Открыт ваш черновик. Он ещё не опубликован.", true);
  })();
})();
