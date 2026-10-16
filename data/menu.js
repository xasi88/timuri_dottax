// Всё содержимое меню. Чтобы поменять цену или блюдо, правьте только этот файл.
// photo: фото блюда из img/food (с Instagram @cafe_katar). Без фото показывается рисунок icon из js/icons.js.
// badge: подпись на карточке. weight: подпись под ценой, необязательна.
// Блюда собраны из Instagram кафе, Яндекс Карт, 2ГИС и отзывов (docs/клиент.md).
// Цены примерные: настоящих цен в открытых источниках нет. Узнать у владельца.

window.CAFE = {
  name: "Katar",
  tagline: "Шашлык на углях · Гриль",
  place: "Грозный, ул. Мира, 46",
  hours: "Каждый день 9:00 - 00:00",
  phone: "79639802878", // WhatsApp кафе из шапки @cafe_katar, тот же номер на Яндекс Картах
  phoneText: "+7 (963) 980-28-78",
  instagram: "cafe_katar",
  rating: "4,4",
  ratingCount: "173 оценки",
  mapUrl: "https://yandex.ru/maps/org/katar/132186666741/",
  open: 9, // час открытия по Москве
  close: 24, // час закрытия
  features: ["Доставка по Грозному", "Еда с собой", "Wi-Fi", "Намазхана", "Парковка", "Летняя веранда"],
  demo: true,
};

window.MENU = [
  {
    id: "coal",
    title: "На углях",
    note: "Жарим на живом огне. Подаём горячим.",
    items: [
      { id: "chicken", name: "Курица на углях", desc: "Фирменное блюдо. Курица в маринаде, жарится на углях до золотой корочки. Сочная внутри.", price: 650, weight: "целая", icon: "chicken", photo: "img/food/chicken.webp", badge: "Хит", hero: true },
      { id: "lula", name: "Люля-кебаб", desc: "Рубленое мясо со специями на шампуре, с мангала.", price: 350, icon: "skewer", photo: "img/food/lula.webp", badge: "Любят" },
      { id: "shashlik", name: "Шашлык", desc: "Мясо в маринаде, на углях.", price: 450, icon: "skewer", photo: "img/food/grill.webp" },
      { id: "steak", name: "Стейк", desc: "Жарим на огне до нужной прожарки. Скажите, как любите.", price: 750, icon: "steak", photo: "img/food/steak.webp" },
    ],
  },
  {
    id: "east",
    title: "Восток",
    note: "Плов, манты и лагман по-узбекски.",
    items: [
      { id: "plov", name: "Узбекский плов", desc: "Рис, мясо и морковь. Порция большая.", price: 350, icon: "plov", photo: "img/food/plov.webp", badge: "Хит" },
      { id: "manty", name: "Манты", desc: "Сочные, с рубленым мясом и луком.", price: 400, icon: "manty", photo: "img/food/manty.webp", badge: "Любят" },
      { id: "lagman", name: "Лагман", desc: "Лапша, мясо, овощи и густой бульон.", price: 350, icon: "lagman", photo: "img/food/lagman.webp" },
      { id: "turkish", name: "Мясо по-турецки", desc: "Говядина с овощами и картофелем фри.", price: 450, icon: "pot", photo: "img/food/turkish.webp" },
      { id: "zharkoe", name: "Жаркое", desc: "Мясо с картофелем, по-домашнему.", price: 400, icon: "pot" },
    ],
  },
  {
    id: "street",
    title: "Фастфуд",
    note: "Удобно взять с собой.",
    items: [
      { id: "doner", name: "Донар", desc: "Мясо с гриля, овощи и соус в лаваше.", price: 280, icon: "wrap" },
      { id: "shawarma", name: "Шаурма", desc: "Мясо, свежие овощи и соус в лаваше.", price: 250, icon: "wrap" },
      { id: "gyros", name: "Гирос", desc: "Мясо с гриля в пите.", price: 300, icon: "wrap" },
      { id: "burger", name: "Бургер", desc: "Котлета на гриле, овощи, соус.", price: 330, icon: "burger" },
      { id: "pizza", name: "Пицца", desc: "Горячая, из печи.", price: 550, icon: "pizza" },
      { id: "fries", name: "Картофель фри", desc: "Золотистый, к мясу и курице.", price: 150, icon: "plate", photo: "img/food/fries.webp" },
    ],
  },
  {
    id: "soup",
    title: "Супы и обеды",
    note: "Обед как дома.",
    items: [
      { id: "borsch", name: "Красный борщ", desc: "На мясном бульоне. Со сметаной.", price: 250, icon: "soup" },
      { id: "chicken-soup", name: "Куриный суп", desc: "Лёгкий бульон с курицей.", price: 220, icon: "soup" },
      { id: "cutlet", name: "Котлета с гречкой", desc: "Домашняя котлета и рассыпчатая гречка.", price: 300, icon: "plate" },
      { id: "fettuccine", name: "Фетучини с курицей", desc: "Паста в сливочном соусе.", price: 380, icon: "pasta" },
    ],
  },
  {
    id: "drinks",
    title: "Чай и выпечка",
    note: "Гости хвалят наши чаи.",
    items: [
      { id: "tea", name: "Чай в чайнике", desc: "Горячий, на компанию.", price: 150, icon: "tea" },
      { id: "kompot", name: "Компот", desc: "Домашний.", price: 100, icon: "glass" },
      { id: "bun", name: "Булочка с повидлом", desc: "Свежая, мягкая.", price: 60, icon: "bun" },
      { id: "lavash", name: "Лаваш", desc: "Тёплый, к курице и люля.", price: 40, icon: "bun" },
      { id: "sauce", name: "Соус", desc: "К курице и мясу.", price: 50, icon: "sauce" },
    ],
  },
];
