// Корзина: количество блюд, сумма, текст заказа для WhatsApp.
// Корзина хранится в браузере гостя, чтобы не пропасть при перезагрузке.

window.Cart = (function () {
  const KEY = "katar-cart";
  const byId = {};
  for (const g of window.MENU) for (const it of g.items) byId[it.id] = it;

  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  for (const id of Object.keys(state)) if (!byId[id]) delete state[id];

  const listeners = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* без хранилища корзина живёт до перезагрузки */ }
    listeners.forEach((fn) => fn());
  }

  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

  return {
    byId,
    rub,
    qty: (id) => state[id] || 0,
    add(id) { state[id] = (state[id] || 0) + 1; save(); },
    sub(id) { if (!state[id]) return; state[id] -= 1; if (!state[id]) delete state[id]; save(); },
    clear() { state = {}; save(); },
    lines: () => Object.keys(state).map((id) => ({ item: byId[id], qty: state[id] })),
    count: () => Object.values(state).reduce((a, b) => a + b, 0),
    total: () => Object.keys(state).reduce((sum, id) => sum + byId[id].price * state[id], 0),
    onChange(fn) { listeners.push(fn); },

    message({ mode, table, time, addr, note }) {
      const head = { hall: `Заказ в зале${table ? `, стол ${table}` : ""}`, pickup: `Заберу сам${time ? `, ${time}` : ""}`, delivery: "Доставка" }[mode];
      const rows = this.lines().map(({ item, qty }) => `• ${item.name} × ${qty} = ${rub(item.price * qty)}`);
      const out = [`Здравствуйте! ${head}.`, "", ...rows, "", `Итого: ${rub(this.total())}`];
      if (mode === "delivery" && addr) out.push(`Адрес: ${addr}`);
      if (note) out.push(`Пожелания: ${note}`);
      return out.join("\n");
    },
  };
})();
