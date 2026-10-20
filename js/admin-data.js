// Админка: файл меню и проверка данных. Без интерфейса, поэтому проверяется в tests/logic.test.js.

window.AdminData = (function () {
  const MARK = "window.KATAR = ";
  const HEAD = [
    "// Всё содержимое меню: кафе, блюда, акции и комбо. Файл пишет админка (admin.html).",
    "// Внутри window.KATAR = { ... } строгий JSON: двойные кавычки, без комментариев и запятых в конце.",
    "// options: варианты блюда со своей ценой. discount: скидка на блюдо в процентах.",
    "// off: нет в наличии. hit: показать в «Хитах». hero: главное блюдо на первом экране.",
  ].join("\n");

  // Объект меню → текст файла data/menu.js
  const toFile = (data) => `${HEAD}\n${MARK}${JSON.stringify(data, null, 2)};\n`;

  // Текст файла data/menu.js → объект меню
  function fromFile(text) {
    const i = text.search(/^window\.KATAR = /m);
    if (i < 0) throw new Error("В файле меню нет window.KATAR");
    return JSON.parse(text.slice(i + MARK.length).trim().replace(/;\s*$/, ""));
  }

  // Ошибки, из-за которых публиковать нельзя. Пустой список: всё в порядке.
  function check(data) {
    const errs = [], ids = new Set();
    const money = (n) => Number.isInteger(n) && n > 0 && n < 1000000;
    data.menu.forEach((g) => {
      if (!String(g.title || "").trim()) errs.push("У раздела нет названия");
      g.items.forEach((it) => {
        const name = String(it.name || "").trim();
        const who = name || "Блюдо без названия";
        if (!name) errs.push(`${who}: впишите название`);
        if (ids.has(it.id)) errs.push(`${who}: повтор номера ${it.id}`);
        ids.add(it.id);
        if (!money(it.price)) errs.push(`${who}: цена должна быть целым числом больше нуля`);
        (it.options || []).forEach((o) => {
          if (!String(o.name || "").trim() || !money(o.price)) errs.push(`${who}: у варианта нужны название и цена`);
        });
        if (it.discount !== undefined && !(Number.isInteger(it.discount) && it.discount >= 0 && it.discount <= 90)) errs.push(`${who}: скидка от 0 до 90%`);
      });
    });
    (data.promos.combos || []).forEach((c) => {
      const who = `Комбо «${c.name || "без названия"}»`;
      if (!String(c.name || "").trim()) errs.push(`${who}: впишите название`);
      if (!money(c.price)) errs.push(`${who}: цена должна быть целым числом больше нуля`);
      if (!c.items.length) errs.push(`${who}: добавьте блюда`);
      c.items.forEach((x) => { if (!ids.has(x.id)) errs.push(`${who}: блюдо ${x.id} удалено из меню`); });
    });
    (data.promos.banners || []).forEach((b) => {
      if (!String(b.title || "").trim()) errs.push("У акции нет заголовка");
    });
    if (!/^7\d{10}$/.test(data.cafe.phone)) errs.push("WhatsApp: номер из 11 цифр, начинается с 7");
    return errs;
  }

  // Номер блюда из названия: латиница, цифры и дефис
  const TR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
  function slug(name, taken) {
    let s = String(name).toLowerCase().split("").map((ch) => (TR[ch] !== undefined ? TR[ch] : ch)).join("")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "dish";
    if (!taken.has(s)) return s;
    let n = 2;
    while (taken.has(`${s}-${n}`)) n++;
    return `${s}-${n}`;
  }

  return { toFile, fromFile, check, slug };
})();
