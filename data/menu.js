// Всё содержимое меню. Чтобы поменять цену или блюдо, правьте только этот файл.
// icon: рисунок из js/icons.js. badge: подпись на карточке. weight: выход блюда.
// Цены примерные (демо). Настоящие цены узнать у владельца.

window.CAFE = {
  name: "Katar",
  signature: "Куры на углях",
  place: "Грозный, ул. Мира, 46",
  hours: "Каждый день 9:00 - 00:00",
  phone: "79388902970",
  phoneText: "+7 (938) 890-29-70",
  instagram: "timuri_dottax",
  rating: "4,4",
  ratingCount: "173 оценки на Яндекс Картах",
  demo: true,
};

window.MENU = [
  {
    id: "coal",
    title: "На углях",
    note: "Жарим на живом огне. Подаём горячим.",
    items: [
      { id: "chicken", name: "Курица на углях", desc: "Фирменное блюдо. Целая курица в маринаде, жарится на углях до золотой корочки. Сочная внутри.", price: 650, weight: "целая, ~1,2 кг", icon: "chicken", badge: "Хит", hero: true },
      { id: "chicken-half", name: "Половина курицы на углях", desc: "Та же курица, половинка. Порция на одного голодного.", price: 350, weight: "~600 г", icon: "chicken" },
      { id: "lula", name: "Люля-кебаб из говядины", desc: "Рубленое мясо со специями на шампуре. Гости пишут: «самые вкусные люля».", price: 350, weight: "250 г", icon: "skewer", badge: "Любят" },
      { id: "lula-chicken", name: "Люля-кебаб из курицы", desc: "Нежнее говяжьего. С луком и зеленью.", price: 300, weight: "250 г", icon: "skewer" },
      { id: "shashlik", name: "Шашлык из баранины", desc: "Мякоть молодой баранины, маринад на луке.", price: 480, weight: "250 г", icon: "skewer" },
      { id: "steak", name: "Стейк из говядины", desc: "Жарим до нужной прожарки. Скажите официанту, как любите.", price: 750, weight: "300 г", icon: "steak" },
    ],
  },
  {
    id: "east",
    title: "Восток",
    note: "Готовит наш повар из Узбекистана.",
    items: [
      { id: "plov", name: "Узбекский плов", desc: "Рис, говядина, морковь, нут и чеснок. Порция большая.", price: 350, weight: "400 г", icon: "plov", badge: "Хит" },
      { id: "manty", name: "Манты", desc: "Сочные, с рубленым мясом и луком. Со сметаной.", price: 400, weight: "5 шт", icon: "manty", badge: "Любят" },
      { id: "lagman", name: "Лагман", desc: "Тянутая лапша, мясо, овощи и густой бульон.", price: 350, weight: "450 г", icon: "lagman" },
      { id: "turkish", name: "Мясо по-турецки", desc: "Говядина, тушённая с овощами и специями.", price: 450, weight: "350 г", icon: "pot" },
      { id: "zharkoe", name: "Жаркое", desc: "Мясо с картофелем, по-домашнему.", price: 400, weight: "400 г", icon: "pot" },
    ],
  },
  {
    id: "street",
    title: "С собой",
    note: "Удобно взять в дорогу.",
    items: [
      { id: "doner", name: "Донар", desc: "Мясо с гриля, овощи и соус в лаваше.", price: 280, weight: "350 г", icon: "wrap" },
      { id: "shawarma", name: "Шаурма с курицей", desc: "Курица, огурцы, помидоры, фирменный соус.", price: 250, weight: "350 г", icon: "wrap" },
      { id: "gyros", name: "Гирос", desc: "В пите, с картофелем фри и соусом дзадзики.", price: 300, weight: "350 г", icon: "wrap" },
      { id: "burger", name: "Бургер с говядиной", desc: "Котлета на гриле, сыр, овощи, соус.", price: 330, weight: "300 г", icon: "burger" },
      { id: "pizza", name: "Пицца с курицей", desc: "Тонкое тесто, курица, сыр, томаты.", price: 550, weight: "30 см", icon: "pizza" },
    ],
  },
  {
    id: "soup",
    title: "Супы и обеды",
    note: "Обед как дома.",
    items: [
      { id: "borsch", name: "Красный борщ", desc: "На говяжьем бульоне. Со сметаной.", price: 250, weight: "350 мл", icon: "soup" },
      { id: "chicken-soup", name: "Куриный суп", desc: "Лёгкий бульон с лапшой и курицей.", price: 220, weight: "350 мл", icon: "soup" },
      { id: "cutlet", name: "Котлета с гречкой", desc: "Домашняя котлета и рассыпчатая гречка.", price: 300, weight: "350 г", icon: "plate" },
      { id: "fettuccine", name: "Фетучини с курицей", desc: "Паста в сливочном соусе.", price: 380, weight: "300 г", icon: "pasta" },
    ],
  },
  {
    id: "drinks",
    title: "Чай и выпечка",
    note: "Гости хвалят наши чаи.",
    items: [
      { id: "tea", name: "Чай в чайнике", desc: "Чёрный или зелёный, с чабрецом или лимоном.", price: 150, weight: "800 мл", icon: "tea" },
      { id: "kompot", name: "Компот", desc: "Домашний, из сухофруктов.", price: 100, weight: "300 мл", icon: "glass" },
      { id: "bun", name: "Булочка с повидлом", desc: "Свежая, мягкая.", price: 60, weight: "1 шт", icon: "bun" },
      { id: "lavash", name: "Лаваш", desc: "Тёплый, к курице и люля.", price: 40, weight: "1 шт", icon: "bun" },
      { id: "sauce", name: "Фирменный соус", desc: "Чесночный или острый. К курице обязательно.", price: 50, weight: "50 г", icon: "sauce" },
    ],
  },
];
