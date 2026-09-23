import type { Dictionary } from "../types";
import type { LocaleCode } from "../locales";
import { en } from "./en";

function deepMerge<T extends Record<string, unknown>>(base: T, patch: DeepPartial<T>): T {
  const out = { ...base } as T;
  for (const key of Object.keys(patch) as Array<keyof T>) {
    const value = patch[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(
        (base[key] as Record<string, unknown>) ?? {},
        value as Record<string, unknown>,
      ) as T[keyof T];
    } else if (value !== undefined) {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const fr = deepMerge(en, {
  nav: {
    about: "À propos",
    experience: "Expérience",
    menu: "Carte",
    gallery: "Galerie",
    music: "Musique",
    blog: "Blog",
    visit: "Venir",
  },
  hero: {
    headlineTop: "NUITS PRESTIGIEUSES",
    headlineBottom: "& ÉNERGIE VIP",
    paragraphs: [
      "X Pub est le QG nightlife de Girne — salles stylées, verres froids et une foule qui sait célébrer du premier verre au dernier track.",
      "DJs live chaque soir, coins VIP, promos hebdo et piste ouverte jusqu’à 4 h. Venez pour la musique. Restez pour la nuit.",
    ],
    cta: "Explorer",
  },
  about: {
    eyebrow: "Notre histoire",
    titleTop: "À propos",
    paragraphs: [
      "Au cœur de la vie nocturne de Girne, X Pub est un lieu prestigieux et élégant pour des nuits qui durent. Atmosphère exclusive, salons VIP, boissons froides et une foule qui sait célébrer.",
      "Du premier verre au dernier morceau, chaque soirée est pensée pour l’énergie — DJs live sept jours sur sept, sets invités et soirées à thème jusqu’à 4 h.",
      "Que ce soit pour les promos cocktails, les bières froides ou une session tardive entre amis, X Pub est votre QG à Chypre du Nord.",
    ],
    rating: "4,4 sur Google · 9+ avis",
  },
  experiences: {
    eyebrow: "Quatre ambiances, une maison",
    titleTop: "La nuit",
    titleBottom: "jusqu’à l’aube",
    items: [
      {
        id: "vip",
        icon: "◆",
        time: "Toute la nuit",
        title: "Salons VIP",
        body: "Tables privées et coins exclusifs pour anniversaires, self service et nuits hors piste.",
        bullets: ["Atmosphère exclusive", "Places VIP", "Self service", "Célébrations privées"],
      },
      {
        id: "dj",
        icon: "♪",
        time: "7 jours / 7",
        title: "DJs live",
        body: "DJs résidents et invités font bouger Girne chaque soir — dont des sets marquants comme DJ Mete.",
        bullets: ["Sets quotidiens", "Artistes invités", "Soirées à thème", "Énergie peak-hour"],
      },
      {
        id: "offers",
        icon: "★",
        time: "Promos hebdo",
        title: "Promotions",
        body: "Événements hebdomadaires avec promos cocktails et bières froides — lundi et vendredi notamment.",
        bullets: ["Spéciales lundi", "Promos vendredi", "Offres cocktails", "Bières froides"],
      },
      {
        id: "social",
        icon: "◎",
        time: "Ouvert jusqu’à 4 h",
        title: "Spot social",
        body: "Une salle spacieuse et stylée pour les groupes — chiens bienvenus, tables aérées, équipe accueillante.",
        bullets: ["Chiens admis", "Espace généreux", "Service chaleureux", "Fermeture tardive"],
      },
    ],
  },
  menu: {
    eyebrow: "Ce que l’on verse",
    titleTop: "La",
    titleBottom: "Carte",
    tabs: [
      { id: "cocktails", label: "Cocktails" },
      { id: "beer", label: "Bières & Soft" },
      { id: "nights", label: "Soirées" },
    ],
    note: "Demandez à l’équipe les spéciales et le lineup DJ du soir.",
  },
  gallery: { eyebrow: "Sur la piste", titleTop: "La", titleBottom: "Galerie" },
  music: {
    eyebrow: "Des soirées sélection, toute l’énergie",
    titleTop: "Musique",
    titleBottom: "live",
    lead: "DJs sept jours sur sept — plus des performances invitées et des soirées à thème. Suivez nos réseaux pour le lineup.",
  },
  blog: {
    eyebrow: "Actus",
    titleTop: "Depuis",
    titleBottom: "la piste",
  },
  reviews: {
    eyebrow: "Ce que disent les clients",
    titleTop: "Avis",
    summary: "9+ avis Google · Cuisine · Service · Ambiance",
  },
  visit: {
    eyebrow: "Nous trouver",
    titleTop: "Venir",
    lead: "Prêt pour la nightlife de Girne comme il faut ? Venez nous voir.",
    hours: "Ouvert tous les jours · Ferme à 4 h",
    dogs: "Chiens admis",
    mapsLabel: "Google Maps",
  },
  footer: {
    nightlife: "Nightlife à Girne",
    legal: "Mentions légales",
    visit: "Venir",
    explore: "Explorer",
    follow: "Suivre",
  },
  ui: {
    language: "Langue",
    playMusic: "Lancer la musique",
    pauseMusic: "Mettre en pause",
    nowPlaying: "En lecture",
    tapToPlay: "Appuyer pour jouer",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    backToTop: "Haut de page",
    whatsapp: "Discuter sur WhatsApp",
  },
});

const tr = deepMerge(en, {
  nav: {
    about: "Hakkımızda",
    experience: "Deneyim",
    menu: "Menü",
    gallery: "Galeri",
    music: "Müzik",
    blog: "Blog",
    visit: "Ziyaret",
  },
  hero: {
    headlineTop: "PRESTİJLİ GECELER",
    headlineBottom: "& VIP ENERJİ",
    paragraphs: [
      "X Pub, Girne’nin gece hayatı üssü — şık salonlar, soğuk içkiler ve kutlamayı bilen bir kalabalık.",
      "Her gece canlı DJ’ler, VIP köşeler, haftalık promosyonlar ve 04:00’e kadar açık piste. Müzik için gelin. Gece için kalın.",
    ],
    cta: "Keşfet",
  },
  about: {
    eyebrow: "Hikayemiz",
    titleTop: "Hakkımızda",
    paragraphs: [
      "Girne’nin gece hayatı kalbinde yer alan X Pub; kalıcı geceler için prestijli ve şık bir buluşma noktası. Özel atmosfer, VIP odalar, soğuk içkiler ve kutlamayı bilen bir kalabalık.",
      "İlk bardaktan son parçaya kadar her akşam enerji için kurulur — haftanın yedi günü canlı DJ’ler, konuk setler ve sahneyi 04:00’e kadar hareketli tutan temalı geceler.",
      "Kokteyl promosyonları, soğuk bira fırsatları ya da arkadaşlarla geç bir oturum için X Pub, Kuzey Kıbrıs’taki adresiniz.",
    ],
    rating: "Google’da 4,4 · 9+ yorum",
  },
  experiences: {
    eyebrow: "Dört ruh hali, bir ev",
    titleTop: "Gece",
    titleBottom: "şafağa",
    items: [
      {
        id: "vip",
        icon: "◆",
        time: "Tüm gece",
        title: "VIP Odalar",
        body: "Doğum günleri, self service ve ana salondan uzak geceler için özel masalar.",
        bullets: ["Özel atmosfer", "VIP oturma", "Self service", "Özel kutlamalar"],
      },
      {
        id: "dj",
        icon: "♪",
        time: "Haftanın 7 günü",
        title: "Canlı DJ’ler",
        body: "Yerleşik ve konuk DJ’ler Girne’yi her gece hareket ettirir — DJ Mete gibi unutulmaz setler dahil.",
        bullets: ["Günlük setler", "Konuk sanatçılar", "Temalı geceler", "Yoğun saat enerjisi"],
      },
      {
        id: "offers",
        icon: "★",
        time: "Haftalık fırsatlar",
        title: "Promosyonlar",
        body: "Önemli gecelerde kokteyl ve soğuk bira promosyonları — Pazartesi ve Cuma dahil.",
        bullets: ["Pazartesi özel", "Cuma promoları", "Kokteyl fırsatları", "Soğuk bira"],
      },
      {
        id: "social",
        icon: "◎",
        time: "04:00’e kadar açık",
        title: "Sosyal Mekân",
        body: "Gruplar için ferah ve şık bir salon — köpekler kabul, ferah masalar, sıcak servis.",
        bullets: ["Köpek dostu", "Geniş düzen", "Sıcak servis", "Geç kapanış"],
      },
    ],
  },
  menu: {
    eyebrow: "Ne sunuyoruz",
    titleTop: "Menü",
    titleBottom: "",
    tabs: [
      { id: "cocktails", label: "Kokteyller" },
      { id: "beer", label: "Bira & Soğuk" },
      { id: "nights", label: "Geceler" },
    ],
    note: "Bu geceki özel menü ve DJ programı için ekibimize sorun.",
  },
  gallery: { eyebrow: "Salondan", titleTop: "Galeri", titleBottom: "" },
  music: {
    eyebrow: "Seçili geceler, tam enerji",
    titleTop: "Canlı",
    titleBottom: "Müzik",
    lead: "Haftanın yedi günü DJ’ler — konuk performanslar ve temalı geceler. Güncel program için sosyal medyayı takip edin.",
  },
  blog: { eyebrow: "Güncellemeler", titleTop: "Salondan", titleBottom: "notlar" },
  reviews: {
    eyebrow: "Misafirler ne diyor",
    titleTop: "Yorumlar",
    summary: "9+ Google yorumu · Yemek · Servis · Atmosfer",
  },
  visit: {
    eyebrow: "Bizi bulun",
    titleTop: "Ziyaret",
    lead: "Girne gecesine hazır mısınız? Gelin bizi bulun.",
    hours: "Her gün açık · 04:00’te kapanış",
    dogs: "Köpekler kabul edilir",
    mapsLabel: "Google Haritalar",
  },
  footer: {
    nightlife: "Girne gece hayatı",
    legal: "Yasal bildirim",
    visit: "Ziyaret",
    explore: "Keşfet",
    follow: "Takip et",
  },
  ui: {
    language: "Dil",
    playMusic: "Müziği çal",
    pauseMusic: "Müziği duraklat",
    nowPlaying: "Çalıyor",
    tapToPlay: "Çalmak için dokun",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    backToTop: "Başa dön",
    whatsapp: "WhatsApp ile yazın",
  },
});

const ru = deepMerge(en, {
  nav: {
    about: "О нас",
    experience: "Атмосфера",
    menu: "Меню",
    gallery: "Галерея",
    music: "Музыка",
    blog: "Блог",
    visit: "Визит",
  },
  hero: {
    headlineTop: "ПРЕСТИЖНЫЕ НОЧИ",
    headlineBottom: "& VIP ЭНЕРГИЯ",
    paragraphs: [
      "X Pub — штаб ночной жизни Гирне: стильные залы, холодные напитки и публика, которая умеет праздновать.",
      "Живые DJ каждую ночь, VIP-уголки, еженедельные акции и танцпол до 4 утра. Приходите за музыкой. Оставайтесь на всю ночь.",
    ],
    cta: "Смотреть",
  },
  about: {
    eyebrow: "Наша история",
    titleTop: "О нас",
    paragraphs: [
      "В сердце ночной жизни Гирне X Pub — стильное место для долгих ночей. Эксклюзивная атмосфера, VIP-залы, холодные напитки и публика, которая умеет праздновать.",
      "От первого бокала до последнего трека каждый вечер про энергию — живые DJ семь дней в неделю, гостевые сеты и тематические ночи до 4 утра.",
      "Промо на коктейли, холодное пиво или поздняя встреча с друзьями — X Pub ваш штаб на Северном Кипре.",
    ],
    rating: "4,4 в Google · 9+ отзывов",
  },
  experiences: {
    eyebrow: "Четыре настроения, один дом",
    titleTop: "Ночь",
    titleBottom: "до рассвета",
    items: [
      {
        id: "vip",
        icon: "◆",
        time: "Всю ночь",
        title: "VIP-залы",
        body: "Приватные столы для дней рождения, self service и ночей вне общего зала.",
        bullets: ["Эксклюзив", "VIP места", "Self service", "Частные праздники"],
      },
      {
        id: "dj",
        icon: "♪",
        time: "7 дней в неделю",
        title: "Живые DJ",
        body: "Резиденты и гости двигают Гирне каждую ночь — включая яркие сеты DJ Mete.",
        bullets: ["Ежедневные сеты", "Гости", "Тематические ночи", "Пиковая энергия"],
      },
      {
        id: "offers",
        icon: "★",
        time: "Еженедельно",
        title: "Акции",
        body: "Промо на коктейли и холодное пиво в ключевые дни — в том числе понедельник и пятница.",
        bullets: ["Понедельник", "Пятница", "Коктейли", "Холодное пиво"],
      },
      {
        id: "social",
        icon: "◎",
        time: "До 4 утра",
        title: "Соцпространство",
        body: "Просторный стильный зал для компаний — можно с собаками, свободные столы, тёплый сервис.",
        bullets: ["С собаками", "Много места", "Тёплый сервис", "Позднее закрытие"],
      },
    ],
  },
  menu: {
    eyebrow: "Что наливаем",
    titleTop: "Меню",
    titleBottom: "",
    tabs: [
      { id: "cocktails", label: "Коктейли" },
      { id: "beer", label: "Пиво и холодное" },
      { id: "nights", label: "Ночи" },
    ],
    note: "Спросите команду о спецпредложениях и DJ-лайнапа на сегодня.",
  },
  gallery: { eyebrow: "С танцпола", titleTop: "Галерея", titleBottom: "" },
  music: {
    eyebrow: "Отборные ночи, полная энергия",
    titleTop: "Живая",
    titleBottom: "музыка",
    lead: "DJ семь дней в неделю — плюс гости и тематические вечера. Следите за соцсетями за актуальным лайнапом.",
  },
  blog: { eyebrow: "Обновления", titleTop: "С", titleBottom: "танцпола" },
  reviews: {
    eyebrow: "Что говорят гости",
    titleTop: "Отзывы",
    summary: "9+ отзывов Google · Еда · Сервис · Атмосфера",
  },
  visit: {
    eyebrow: "Как нас найти",
    titleTop: "Визит",
    lead: "Готовы к ночной жизни Гирне по-настоящему? Приходите.",
    hours: "Ежедневно · Закрытие в 4:00",
    dogs: "Можно с собаками",
    mapsLabel: "Google Карты",
  },
  footer: {
    nightlife: "Ночная жизнь Гирне",
    legal: "Правовая информация",
    visit: "Визит",
    explore: "Разделы",
    follow: "Соцсети",
  },
  ui: {
    language: "Язык",
    playMusic: "Включить музыку",
    pauseMusic: "Пауза",
    nowPlaying: "Играет",
    tapToPlay: "Нажмите, чтобы играть",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    backToTop: "Наверх",
    whatsapp: "Написать в WhatsApp",
  },
});

const de = deepMerge(en, {
  nav: { about: "Über uns", experience: "Erlebnis", menu: "Menü", gallery: "Galerie", music: "Musik", blog: "Blog", visit: "Besuch" },
  hero: { cta: "Entdecken" },
  about: { eyebrow: "Unsere Geschichte", titleTop: "Über" },
  visit: { eyebrow: "Finde uns", titleTop: "Besuch", hours: "Täglich geöffnet · Bis 4 Uhr", dogs: "Hunde erlaubt", mapsLabel: "Google Maps" },
  ui: { language: "Sprache", tapToPlay: "Tippen zum Abspielen", nowPlaying: "Läuft jetzt", openMenu: "Menü öffnen", closeMenu: "Menü schließen", backToTop: "Nach oben", whatsapp: "Über WhatsApp schreiben" },
  footer: { nightlife: "Girne Nachtleben", legal: "Impressum", visit: "Besuch", explore: "Entdecken", follow: "Folgen" },
});

const es = deepMerge(en, {
  nav: { about: "Nosotros", experience: "Experiencia", menu: "Carta", gallery: "Galería", music: "Música", blog: "Blog", visit: "Visita" },
  hero: { cta: "Explorar" },
  about: { eyebrow: "Nuestra historia", titleTop: "Sobre" },
  visit: { eyebrow: "Encuéntranos", titleTop: "Visita", hours: "Abierto diario · Cierra a las 4 AM", dogs: "Se admiten perros", mapsLabel: "Google Maps" },
  ui: { language: "Idioma", tapToPlay: "Toca para reproducir", nowPlaying: "Reproduciendo", openMenu: "Abrir menú", closeMenu: "Cerrar menú", backToTop: "Volver arriba", whatsapp: "Escribir por WhatsApp" },
  footer: { nightlife: "Vida nocturna en Girne", legal: "Aviso legal", visit: "Visita", explore: "Explorar", follow: "Seguir" },
});

const it = deepMerge(en, {
  nav: { about: "Chi siamo", experience: "Esperienza", menu: "Menu", gallery: "Galleria", music: "Musica", blog: "Blog", visit: "Visita" },
  hero: { cta: "Esplora" },
  about: { eyebrow: "La nostra storia", titleTop: "Su" },
  visit: { eyebrow: "Trovarci", titleTop: "Visita", hours: "Aperti ogni giorno · Chiude alle 4", dogs: "Cani ammessi", mapsLabel: "Google Maps" },
  ui: { language: "Lingua", tapToPlay: "Tocca per riprodurre", nowPlaying: "In riproduzione", openMenu: "Apri menu", closeMenu: "Chiudi menu", backToTop: "Torna su", whatsapp: "Scrivici su WhatsApp" },
  footer: { nightlife: "Nightlife a Girne", legal: "Note legali", visit: "Visita", explore: "Esplora", follow: "Segui" },
});

const ar = deepMerge(en, {
  nav: { about: "من نحن", experience: "التجربة", menu: "القائمة", gallery: "المعرض", music: "الموسيقى", blog: "المدونة", visit: "الزيارة" },
  hero: { cta: "استكشف" },
  about: { eyebrow: "قصتنا", titleTop: "حول" },
  visit: { eyebrow: "اعثر علينا", titleTop: "زيارة", hours: "مفتوح يومياً · يغلق الساعة 4 صباحاً", dogs: "يُسمح بالكلاب", mapsLabel: "خرائط Google" },
  ui: { language: "اللغة", tapToPlay: "اضغط للتشغيل", nowPlaying: "يعمل الآن", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", backToTop: "إلى الأعلى", whatsapp: "تواصل معنا على واتساب" },
  footer: { nightlife: "سهرات غيرنه", legal: "إشعار قانوني", visit: "الزيارة", explore: "استكشف", follow: "تابعنا" },
});

const el = deepMerge(en, {
  nav: { about: "Σχετικά", experience: "Εμπειρία", menu: "Μενού", gallery: "Γκαλερί", music: "Μουσική", blog: "Blog", visit: "Επίσκεψη" },
  hero: { cta: "Εξερεύνηση" },
  visit: { eyebrow: "Βρείτε μας", titleTop: "Επίσκεψη", hours: "Ανοιχτά καθημερινά · Κλείνει 4 π.μ.", dogs: "Επιτρέπονται σκύλοι" },
  ui: { language: "Γλώσσα", tapToPlay: "Πατήστε για αναπαραγωγή", nowPlaying: "Παίζει τώρα", backToTop: "Επιστροφή στην αρχή", whatsapp: "Συνομιλήστε στο WhatsApp" },
  footer: { nightlife: "Νυχτερινή ζωή Girne", legal: "Νομική σημείωση", visit: "Επίσκεψη", explore: "Εξερεύνηση", follow: "Ακολουθήστε" },
});

const zh = deepMerge(en, {
  nav: { about: "关于", experience: "体验", menu: "菜单", gallery: "图库", music: "音乐", blog: "博客", visit: "到访" },
  hero: { cta: "探索" },
  about: { eyebrow: "我们的故事", titleTop: "关于" },
  visit: { eyebrow: "找到我们", titleTop: "到访", hours: "每日营业 · 凌晨4点打烊", dogs: "可携犬", mapsLabel: "谷歌地图" },
  ui: { language: "语言", tapToPlay: "点击播放", nowPlaying: "正在播放", openMenu: "打开菜单", closeMenu: "关闭菜单", backToTop: "返回顶部", whatsapp: "通过 WhatsApp 联系" },
  footer: { nightlife: "Girne 夜生活", legal: "法律声明", visit: "到访", explore: "探索", follow: "关注" },
});

const pt = deepMerge(en, {
  nav: { about: "Sobre", experience: "Experiência", menu: "Cardápio", gallery: "Galeria", music: "Música", blog: "Blog", visit: "Visita" },
  hero: { cta: "Explorar" },
  visit: { eyebrow: "Encontre-nos", titleTop: "Visita", hours: "Aberto diariamente · Fecha às 4h", dogs: "Cães permitidos" },
  ui: { language: "Idioma", tapToPlay: "Toque para tocar", nowPlaying: "A tocar", backToTop: "Voltar ao topo", whatsapp: "Falar no WhatsApp" },
  footer: { nightlife: "Vida noturna em Girne", legal: "Aviso legal", visit: "Visita", explore: "Explorar", follow: "Seguir" },
});

const pl = deepMerge(en, {
  nav: { about: "O nas", experience: "Doświadczenie", menu: "Menu", gallery: "Galeria", music: "Muzyka", blog: "Blog", visit: "Wizyta" },
  hero: { cta: "Odkryj" },
  visit: { eyebrow: "Znajdź nas", titleTop: "Wizyta", hours: "Codziennie · Do 4:00", dogs: "Psy dozwolone" },
  ui: { language: "Język", tapToPlay: "Dotknij, by odtworzyć", nowPlaying: "Odtwarzanie", backToTop: "Na górę", whatsapp: "Napisz na WhatsApp" },
  footer: { nightlife: "Nocne życie Girne", legal: "Nota prawna", visit: "Wizyta", explore: "Odkrywaj", follow: "Obserwuj" },
});

const uk = deepMerge(en, {
  nav: { about: "Про нас", experience: "Атмосфера", menu: "Меню", gallery: "Галерея", music: "Музика", blog: "Блог", visit: "Візит" },
  hero: { cta: "Дивитись" },
  visit: { eyebrow: "Знайдіть нас", titleTop: "Візит", hours: "Щодня · До 4:00", dogs: "Можна з собаками" },
  ui: { language: "Мова", tapToPlay: "Натисніть, щоб грати", nowPlaying: "Грає", backToTop: "Догори", whatsapp: "Написати у WhatsApp" },
  footer: { nightlife: "Нічне життя Гірне", legal: "Права", visit: "Візит", explore: "Розділи", follow: "Соцмережі" },
});

const nl = deepMerge(en, {
  nav: { about: "Over ons", experience: "Beleving", menu: "Menu", gallery: "Galerij", music: "Muziek", blog: "Blog", visit: "Bezoek" },
  hero: { cta: "Ontdek" },
  visit: { eyebrow: "Vind ons", titleTop: "Bezoek", hours: "Dagelijks open · Sluit om 4 uur", dogs: "Honden welkom" },
  ui: { language: "Taal", tapToPlay: "Tik om af te spelen", nowPlaying: "Speelt nu", backToTop: "Naar boven", whatsapp: "Chat via WhatsApp" },
  footer: { nightlife: "Girne nachtleven", legal: "Juridische info", visit: "Bezoek", explore: "Ontdek", follow: "Volgen" },
});

const ja = deepMerge(en, {
  nav: { about: "私たちについて", experience: "体験", menu: "メニュー", gallery: "ギャラリー", music: "ミュージック", blog: "ブログ", visit: "アクセス" },
  hero: { cta: "見る" },
  about: { eyebrow: "ストーリー", titleTop: "について" },
  visit: { eyebrow: "アクセス", titleTop: "訪れる", hours: "毎日営業 · 午前4時閉店", dogs: "犬同伴可", mapsLabel: "Googleマップ" },
  ui: { language: "言語", tapToPlay: "タップして再生", nowPlaying: "再生中", openMenu: "メニューを開く", closeMenu: "メニューを閉じる", backToTop: "トップへ戻る", whatsapp: "WhatsAppで連絡" },
  footer: { nightlife: "ギルネのナイトライフ", legal: "法的情報", visit: "アクセス", explore: "探索", follow: "フォロー" },
});

export const dictionaries: Record<LocaleCode, Dictionary> = {
  en,
  fr,
  tr,
  ru,
  de,
  es,
  it,
  ar,
  el,
  zh,
  pt,
  pl,
  uk,
  nl,
  ja,
};
