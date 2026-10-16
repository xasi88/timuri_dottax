// Проверка логики без браузера: корзина, суммы, текст заказа для WhatsApp.
// Запуск: node tests/logic.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const store = {};
const ctx = {
  window: {},
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
};
ctx.window.UI = { esc: (s) => s, ico: { wa: "" }, ctl: () => "", toast: () => {} };
vm.createContext(ctx);
["data/menu.js", "js/icons.js", "js/cart.js", "js/order.js"].forEach((f) =>
  vm.runInContext(`(function(){ ${fs.readFileSync(path.join(__dirname, "..", f), "utf8")} }).call(this)`, ctx));

const { Cart, OrderView, MENU, CAFE, ICONS } = ctx.window;
let ok = 0;
const test = (name, fn) => { fn(); ok++; console.log("ок  " + name); };

test("у каждого блюда есть рисунок, цена и уникальный номер", () => {
  const ids = new Set();
  MENU.forEach((g) => g.items.forEach((it) => {
    assert.ok(ICONS[it.icon], "нет рисунка " + it.icon);
    assert.ok(it.price > 0, "нет цены " + it.id);
    assert.ok(!ids.has(it.id), "повтор " + it.id);
    ids.add(it.id);
  }));
  assert.strictEqual(MENU.flatMap((g) => g.items).filter((it) => it.hero).length, 1);
});

test("в текстах меню нет длинного тире", () => {
  const text = fs.readFileSync(path.join(__dirname, "..", "data/menu.js"), "utf8") + fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.ok(!/[—–]/.test(text));
});

test("корзина считает количество и сумму", () => {
  Cart.clear();
  Cart.add("chicken"); Cart.add("lula"); Cart.add("lula");
  assert.strictEqual(Cart.count(), 3);
  assert.strictEqual(Cart.total(), 650 + 350 * 2);
  Cart.sub("lula");
  assert.strictEqual(Cart.qty("lula"), 1);
  Cart.sub("lula"); Cart.sub("lula");
  assert.strictEqual(Cart.qty("lula"), 0);
  assert.strictEqual(Cart.lines().length, 1);
});

test("корзина сохраняется в браузере", () => {
  assert.deepStrictEqual(JSON.parse(store["katar-cart"]), { chicken: 1 });
});

test("сумма пишется по-русски с пробелом", () => {
  assert.strictEqual(Cart.rub(1350).replace(/\s/g, " "), "1 350 ₽");
});

test("текст заказа в зале", () => {
  Cart.clear(); Cart.add("chicken"); Cart.add("tea");
  const msg = OrderView.message();
  assert.ok(msg.startsWith("Здравствуйте! Заказ в зале."));
  assert.ok(msg.includes("• Курица на углях × 1 = 650"));
  assert.ok(msg.includes("Итого: 800"));
});

test("номер телефона для WhatsApp только из цифр", () => {
  assert.ok(/^7\d{10}$/.test(CAFE.phone));
});

console.log(`\nПройдено: ${ok}`);
