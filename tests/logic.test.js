// Проверка логики без браузера: данные меню, корзина, скидки, комбо, текст заказа для WhatsApp.
// Запуск: node tests/logic.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const store = {};
const ctx = {
  window: {},
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
};
ctx.window.UI = { esc: (s) => s, ico: { wa: "", gift: "" }, art: () => "", ctl: () => "", toast: () => {} };
vm.createContext(ctx);
["data/menu.js", "js/data.js", "js/icons.js", "js/cart.js", "js/order.js", "js/admin-data.js"].forEach((f) =>
  vm.runInContext(`(function(){ ${fs.readFileSync(path.join(root, f), "utf8")} }).call(this)`, ctx));

const { Cart, OrderView, MENU, CAFE, ICONS, PROMOS, Data, AdminData, KATAR } = ctx.window;
const same = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
let ok = 0;
const test = (name, fn) => { fn(); ok++; console.log("ок  " + name); };
const num = (s) => s.replace(/\s/g, " ");

test("у каждого блюда есть рисунок, цена и уникальный номер", () => {
  const ids = new Set();
  MENU.forEach((g) => g.items.forEach((it) => {
    assert.ok(ICONS[it.icon], "нет рисунка " + it.icon);
    assert.ok(it.price > 0, "нет цены " + it.id);
    assert.ok(!ids.has(it.id), "повтор " + it.id);
    assert.ok(!/[@:]/.test(it.id), "в номере блюда нельзя @ и : " + it.id);
    ids.add(it.id);
  }));
  assert.strictEqual(MENU.flatMap((g) => g.items).filter((it) => it.hero).length, 1);
});

test("меню совпадает с бумажным: 35 блюд, 6 разделов", () => {
  assert.strictEqual(MENU.length, 6);
  assert.strictEqual(MENU.flatMap((g) => g.items).length, 35);
  assert.strictEqual(Data.dish["steak"].price, 850);
  same(Data.dish["kog-korti"].options.map((o) => o.price), [2300, 2500]);
});

test("у каждого фото есть файл", () => {
  MENU.forEach((g) => g.items.forEach((it) => {
    if (it.photo) assert.ok(fs.existsSync(path.join(root, it.photo)), "нет файла " + it.photo);
  }));
});

test("в текстах сайта нет длинного тире", () => {
  ["data/menu.js", "index.html", "admin.html", "js/admin.js", "js/install.js", "js/menu.js", "js/order.js", "js/app.js"].forEach((f) =>
    assert.ok(!/[—–]/.test(fs.readFileSync(path.join(root, f), "utf8")), "тире в " + f));
});

test("корзина считает количество и сумму", () => {
  Cart.clear();
  Cart.add("chicken@0"); Cart.add("lula"); Cart.add("lula");
  assert.strictEqual(Cart.count(), 3);
  assert.strictEqual(Cart.total(), 400 + 250 * 2);
  Cart.sub("lula");
  assert.strictEqual(Cart.qty("lula"), 1);
  Cart.sub("lula"); Cart.sub("lula");
  assert.strictEqual(Cart.qty("lula"), 0);
  assert.strictEqual(Cart.lines().length, 1);
});

test("корзина сохраняется в браузере", () => {
  same(JSON.parse(store["katar-cart"]), { "chicken@0": 1 });
});

test("блюдо с вариантами: без варианта не добавить, варианты считаются вместе", () => {
  Cart.clear();
  Cart.add("chicken");
  assert.strictEqual(Cart.count(), 0);
  Cart.add("chicken@1"); Cart.add("chicken@0");
  assert.strictEqual(Cart.qtyDish("chicken"), 2);
  assert.strictEqual(Cart.total(), 1250 + 400);
  assert.strictEqual(Cart.info("chicken@1").name, "Курица на углях (Целая курица)");
});

test("скидка на блюдо в процентах", () => {
  Cart.clear(); Cart.add("thai");
  assert.strictEqual(Cart.info("thai").full, 450);
  assert.strictEqual(Cart.total(), 405);
});

test("комбо: своя цена и выгода", () => {
  const c = Data.combo("family");
  assert.strictEqual(Data.comboFull(c), 1250 + 150 * 2 + 250);
  Cart.clear(); Cart.add("combo:family");
  assert.strictEqual(Cart.total(), 1590);
});

test("скидка на заказ от суммы", () => {
  Cart.clear();
  Cart.add("steak"); Cart.add("steak"); Cart.add("steak");
  let s = Cart.summary();
  assert.strictEqual(s.sum, 2550);
  assert.strictEqual(s.discount, 0);
  assert.strictEqual(s.need, 450);
  Cart.add("steak");
  s = Cart.summary();
  assert.strictEqual(s.discount, 340);
  assert.strictEqual(s.total, 3060);
});

test("сумма пишется по-русски с пробелом", () => {
  assert.strictEqual(num(Cart.rub(1350)), "1 350 ₽");
});

test("текст заказа: блюда, комбо, скидка", () => {
  Cart.clear(); Cart.add("chicken@1"); Cart.add("tea-cherry"); Cart.add("combo:lunch");
  let msg = num(OrderView.message());
  assert.ok(msg.startsWith("Здравствуйте! Заказ в зале."));
  assert.ok(msg.includes("• Курица на углях (Целая курица) × 1 = 1 250 ₽"));
  assert.ok(msg.includes("Комбо «Обед» × 1 = 790 ₽"));
  assert.ok(msg.includes("Шурпа, Плов узбекский, Чепалг"));
  assert.ok(msg.includes("Итого: 2 290 ₽"));
  Cart.add("steak");
  msg = num(OrderView.message());
  assert.ok(msg.includes("Скидка 10%: −314 ₽"));
  assert.ok(msg.includes("Итого: 2 826 ₽"));
});

test("номера телефонов для ссылок только из цифр", () => {
  assert.ok(/^7\d{10}$/.test(CAFE.phone));
  assert.ok(/^7\d{10}$/.test(CAFE.phone2));
});

test("акция с прошедшим сроком скрыта", () => {
  assert.ok(Data.live({ active: true, until: "2999-01-01" }));
  assert.ok(!Data.live({ active: true, until: "2000-01-01" }));
  assert.ok(!Data.live({ active: false }));
  assert.ok(Data.banners().length >= 1);
});

test("админка: файл меню собирается и читается обратно", () => {
  const text = AdminData.toFile(KATAR);
  const back = AdminData.fromFile(text);
  same(back, KATAR);
  assert.ok(text.includes("window.KATAR = {"));
  assert.ok(!/[—–]/.test(text));
});

test("админка: проверка данных находит ошибки", () => {
  const bad = JSON.parse(JSON.stringify(KATAR));
  same(AdminData.check(bad), []);
  bad.menu[0].items[1].price = 0;
  bad.menu[0].items[2].name = " ";
  bad.promos.combos[0].items.push({ id: "nope", qty: 1 });
  const errs = AdminData.check(bad);
  assert.strictEqual(errs.length, 3);
});

test("админка: новый номер блюда из названия", () => {
  assert.strictEqual(AdminData.slug("Жижиг-галнаш с мясом", new Set()), "zhizhig-galnash-s-myasom");
  assert.strictEqual(AdminData.slug("Плов", new Set(["plov"])), "plov-2");
  assert.strictEqual(AdminData.slug("!!!", new Set()), "dish");
});

console.log(`\nПройдено: ${ok}`);
