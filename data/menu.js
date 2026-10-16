// Всё содержимое меню: кафе, блюда, акции и комбо. Файл пишет админка (admin.html).
// Внутри window.KATAR = { ... } строгий JSON: двойные кавычки, без комментариев и запятых в конце.
// Блюда и цены взяты с бумажного меню кафе (фото от 2026-10-16).
// Фото: img/food. Свои фото кафе из Instagram, остальные с Unsplash (docs/фото.md).
// options: варианты блюда со своей ценой. discount: скидка на блюдо в процентах.
// off: нет в наличии. hit: показать в «Хитах». hero: главное блюдо на первом экране.
window.KATAR = {
  "cafe": {
    "name": "Катар",
    "tagline": "Куры на углях",
    "place": "Грозный, ул. Мира, 46",
    "hours": "Каждый день 9:00 - 00:00",
    "open": 9,
    "close": 24,
    "phone": "79639802878",
    "phoneText": "+7 (963) 980-28-78",
    "phone2": "79388902970",
    "phone2Text": "+7 (938) 890-29-70",
    "instagram": "kafe_katar",
    "rating": "4,4",
    "ratingCount": "173 оценки",
    "mapUrl": "https://yandex.ru/maps/org/katar/132186666741/",
    "features": ["Доставка по Грозному", "Еда с собой", "Национальная кухня", "Wi-Fi", "Намазхана"],
    "demo": true
  },
  "menu": [
    {
      "id": "mangal",
      "title": "Мангал",
      "note": "Жарим на живом огне. Подаём горячим.",
      "items": [
        { "id": "chicken", "name": "Курица на углях", "desc": "Фирменное блюдо. Курица в маринаде, жарится на углях до золотой корочки.", "price": 400, "options": [{ "name": "Порция", "price": 400 }, { "name": "Целая курица", "price": 1250 }], "icon": "chicken", "photo": "img/food/chicken.webp", "badge": "Хит", "hero": true, "hit": true },
        { "id": "lula", "name": "Люля-кебаб из говядины", "desc": "Рубленая говядина со специями на шампуре.", "price": 250, "icon": "skewer", "photo": "img/food/lula.webp", "hit": true },
        { "id": "shashlik", "name": "Шашлык из баранины", "desc": "Баранина в маринаде, на углях.", "price": 700, "icon": "skewer", "photo": "img/food/grill.webp" },
        { "id": "steak", "name": "Стейк рибай", "desc": "Говядина на огне. Скажите, какую прожарку любите.", "price": 850, "icon": "steak", "photo": "img/food/steak.webp", "badge": "Премиум" }
      ]
    },
    {
      "id": "national",
      "title": "Национальная кухня",
      "note": "Чеченская кухня по домашним рецептам.",
      "items": [
        { "id": "kotam", "name": "Котам-галнаш", "desc": "Курица, галушки, бульон и чесночный соус.", "price": 650, "icon": "pot", "photo": "img/food/kotam.webp" },
        { "id": "zhizhig", "name": "Жижиг-галнаш", "desc": "Отварное мясо, галушки, бульон и чесночный соус.", "price": 700, "icon": "pot", "photo": "img/food/zhizhig.webp", "badge": "Любят", "hit": true },
        { "id": "dakyin", "name": "Дакъин жижиг-галнаш", "desc": "Галушки с вяленым мясом, бульон и чесночный соус.", "price": 750, "icon": "pot", "photo": "img/food/dakyin.webp" },
        { "id": "baar", "name": "Баар-галнаш", "desc": "Галушки с мясом по-чеченски, с бульоном.", "price": 700, "icon": "pot", "photo": "img/food/baar.webp" },
        { "id": "kog-korti", "name": "Ког-корти", "desc": "Традиционное блюдо из баранины. Большое, на компанию.", "price": 2300, "options": [{ "name": "Средний", "price": 2300 }, { "name": "Большой", "price": 2500 }], "icon": "pot", "photo": "img/food/kog-korta.webp" },
        { "id": "chepalg", "name": "Чепалг", "desc": "Тонкая лепёшка с творогом, с топлёным маслом.", "price": 150, "icon": "bun", "photo": "img/food/chepalg.webp" },
        { "id": "khingal", "name": "Хингал", "desc": "Тонкая лепёшка с тыквой, с топлёным маслом.", "price": 150, "icon": "bun", "photo": "img/food/khingal.webp" }
      ]
    },
    {
      "id": "kitchen",
      "title": "Кухня",
      "note": "Горячие блюда на каждый день.",
      "items": [
        { "id": "plov", "name": "Плов узбекский", "desc": "Рис, мясо и морковь. Порция большая.", "price": 400, "icon": "plov", "photo": "img/food/plov.webp", "badge": "Хит", "hit": true },
        { "id": "manty", "name": "Манты узбекские", "desc": "Сочные, с рубленым мясом и луком.", "price": 400, "icon": "manty", "photo": "img/food/manty.webp" },
        { "id": "cream", "name": "Курица в сметане", "desc": "Нежная курица в сметанном соусе.", "price": 400, "icon": "pot", "photo": "img/food/cream.webp" },
        { "id": "thai", "name": "Мясо по-тайски с фри", "desc": "Мясо с овощами в соусе, картофель фри.", "price": 450, "discount": 10, "icon": "pot", "photo": "img/food/thai.webp" },
        { "id": "turkish", "name": "Мясо по-турецки с фри", "desc": "Мясо с овощами, картофель фри.", "price": 450, "icon": "pot", "photo": "img/food/turkish.webp" },
        { "id": "fettuccine", "name": "Фетучини", "desc": "Паста в сливочном соусе.", "price": 400, "icon": "pasta", "photo": "img/food/fettuccine.webp" },
        { "id": "gyro", "name": "Гиро на тарелке", "desc": "Мясо с гриля, овощи, соус и картофель.", "price": 400, "icon": "plate", "photo": "img/food/gyro.webp" },
        { "id": "fries", "name": "Картошка фри", "desc": "Золотистая, к мясу и курице.", "price": 150, "icon": "plate", "photo": "img/food/fries.webp" },
        { "id": "wedges", "name": "Картошка по-деревенски", "desc": "Дольки с кожурой, со специями.", "price": 150, "icon": "plate", "photo": "img/food/wedges.webp" }
      ]
    },
    {
      "id": "soup",
      "title": "Супы",
      "note": "Горячие и сытные.",
      "items": [
        { "id": "shurpa", "name": "Шурпа", "desc": "Наваристый суп из баранины с овощами.", "price": 350, "icon": "soup", "photo": "img/food/shurpa.webp" },
        { "id": "tefteli", "name": "Суп с тефтелями", "desc": "Домашние тефтели в бульоне.", "price": 350, "icon": "soup", "photo": "img/food/tefteli.webp" },
        { "id": "borsch", "name": "Борщ", "desc": "На мясном бульоне, со сметаной.", "price": 300, "icon": "soup", "photo": "img/food/borsch.webp" },
        { "id": "lagman", "name": "Лагман", "desc": "Лапша, мясо, овощи и густой бульон.", "price": 400, "icon": "lagman", "photo": "img/food/lagman.webp" }
      ]
    },
    {
      "id": "tea",
      "title": "Заварочные чаи",
      "note": "Чай в чайнике, на компанию.",
      "items": [
        { "id": "tea-cherry", "name": "Дикая вишня", "desc": "Чай с ягодами вишни.", "price": 250, "icon": "tea", "photo": "img/food/tea-cherry.webp" },
        { "id": "tea-peach", "name": "Айва-персик", "desc": "Фруктовый чай с айвой и персиком.", "price": 250, "icon": "tea", "photo": "img/food/tea-peach.webp" },
        { "id": "tea-mango", "name": "Манго-маракуйя", "desc": "Тропический фруктовый чай.", "price": 250, "icon": "tea", "photo": "img/food/tea-mango.webp" },
        { "id": "tea-earl", "name": "Граф Орлов", "desc": "Чёрный чай с бергамотом.", "price": 250, "icon": "tea", "photo": "img/food/tea-earl.webp" },
        { "id": "tea-thyme", "name": "С чебрецом", "desc": "Чёрный чай с чебрецом.", "price": 250, "icon": "tea", "photo": "img/food/tea-thyme.webp" },
        { "id": "tea-lev", "name": "Лев", "desc": "Крепкий чёрный чай.", "price": 250, "icon": "tea", "photo": "img/food/tea-lev.webp" },
        { "id": "tea-assam", "name": "Ассам", "desc": "Индийский чёрный чай.", "price": 250, "icon": "tea", "photo": "img/food/tea-assam.webp" }
      ]
    },
    {
      "id": "jam",
      "title": "Варенье",
      "note": "К чаю.",
      "items": [
        { "id": "jam-cherry", "name": "Белая черешня", "desc": "Варенье из белой черешни.", "price": 200, "icon": "sauce", "photo": "img/food/jam-cherry.webp" },
        { "id": "jam-raspberry", "name": "Малина", "desc": "Малиновое варенье.", "price": 200, "icon": "sauce", "photo": "img/food/jam-raspberry.webp" },
        { "id": "jam-honey", "name": "Мёд с орехами", "desc": "Мёд с грецкими орехами.", "price": 250, "icon": "sauce", "photo": "img/food/jam-honey.webp" },
        { "id": "jam-coconut", "name": "Кокосовое", "desc": "Кокосовое варенье.", "price": 200, "icon": "sauce", "photo": "img/food/jam-coconut.webp" }
      ]
    }
  ],
  "promos": {
    "banners": [
      { "id": "b-combo", "title": "Семейное комбо", "text": "Целая курица, две картошки и чай. Выгоднее, чем по отдельности.", "tag": "Выгода", "target": "combo:family", "active": true, "until": "" },
      { "id": "b-bonus", "title": "Скидка 10% от 3000 ₽", "text": "На весь заказ. Корзина посчитает скидку сама.", "tag": "Акция", "target": "", "active": true, "until": "" }
    ],
    "combos": [
      { "id": "family", "name": "Семейное", "desc": "На 3-4 человек.", "items": [{ "id": "chicken", "opt": 1, "qty": 1 }, { "id": "fries", "qty": 2 }, { "id": "tea-thyme", "qty": 1 }], "price": 1590, "active": true },
      { "id": "lunch", "name": "Обед", "desc": "Суп, горячее и лепёшка.", "items": [{ "id": "shurpa", "qty": 1 }, { "id": "plov", "qty": 1 }, { "id": "chepalg", "qty": 1 }], "price": 790, "active": true }
    ],
    "bonus": { "active": true, "min": 3000, "percent": 10 }
  }
};
