import { COMPANY, CONTACTS } from '@/content/site';
import { CATALOGUE } from '@/content/catalogue';
import { HOURS, HOURS_CONFIRMED, type WorkDay } from '@/content/hours';

/**
 * Разметка LocalBusiness.
 *
 * В разметку попадает ТОЛЬКО то, что подтверждено: адрес и точка входа,
 * телефон, почта и каналы, оценка, реквизиты из реестра юрлиц и перечень
 * услуг с листовок агентства и из карточки на Яндекс.Картах. Часы уходят в
 * разметку лишь тогда, когда клиент их подтвердил (HOURS_CONFIRMED).
 * Поисковику нельзя отдавать данные, которых мы не знаем.
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * ЧАСЫ ИЗ ГРАФИКА, А НЕ ВТОРОЙ ЗАПИСЬЮ. Рабочий день с перерывом это два
 * отрезка, и schema.org пишет их двумя спецификациями: 09:00…13:00 и
 * 14:00…18:00. Дни с одинаковыми отрезками склеиваются в одну спецификацию,
 * поэтому у будней их ровно две, а у выходных ни одной.
 */
function openingHours(week: readonly (WorkDay | null)[]) {
  const spans = new Map<string, { opens: string; closes: string; days: string[] }>();

  week.forEach((d, i) => {
    if (!d) return;
    const parts: [string, string][] = d.pause
      ? [
          [d.open, d.pause[0]],
          [d.pause[1], d.close],
        ]
      : [[d.open, d.close]];

    for (const [opens, closes] of parts) {
      const key = `${opens}-${closes}`;
      const span = spans.get(key) ?? { opens, closes, days: [] };
      span.days.push(DAY_NAMES[i]);
      spans.set(key, span);
    }
  });

  return [...spans.values()].map((s) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: s.days,
    opens: s.opens,
    closes: s.closes,
  }));
}

export function localBusinessSchema(siteUrl: string) {
  const hours = HOURS_CONFIRMED ? openingHours(HOURS) : undefined;

  return {
    '@context': 'https://schema.org',
    /* Просто LocalBusiness. «PrintShop» остался от типографии и в словаре
       schema.org не существует, а типа для рекламного агентства там нет. */
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#organization`,
    name: COMPANY.name,
    alternateName: ['Рекламное агентство Легко', 'Легко'],
    legalName: COMPANY.legalName,
    taxID: COMPANY.inn,
    url: siteUrl,
    telephone: CONTACTS.phoneHref.replace('tel:', ''),
    email: CONTACTS.email,
    foundingDate: String(COMPANY.since),
    description:
      'Рекламное агентство в Нальчике: полиграфия, наружная реклама, печать на текстиле, сублимационная и УФ-печать, сувенирная продукция, флаги, печати и штампы, широкоформатная и интерьерная печать.',
    address: {
      '@type': 'PostalAddress',
      /* Без «ул.»: тип улицы уже стоит в самом имени переулка. */
      streetAddress: COMPANY.street,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      postalCode: COMPANY.postalCode,
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(COMPANY.rating.replace(',', '.')),
      ratingCount: COMPANY.ratingCount,
      reviewCount: COMPANY.reviewCount,
      bestRating: 5,
    },
    sameAs: [CONTACTS.telegram, CONTACTS.vk, CONTACTS.maps],
    /**
     * СНИМКИ МЕСТА, А НЕ КАРТИНКИ ФИРМЫ. Оба с карточки агентства и оба
     * показывают, как выглядит адрес на местности: фасад с вывеской и вход
     * под ней. Ни логотипа, ни работ здесь быть не должно, это поле карточки
     * организации, а не витрины.
     *
     * Адрес абсолютный: siteUrl уже несёт подкаталог площадки, см.
     * `basePath` в `next.config.ts`.
     */
    image: [`${siteUrl}/route/01.webp`, `${siteUrl}/route/03.webp`],
    ...(hours ? { openingHoursSpecification: hours } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Услуги ${COMPANY.name}`,
      itemListElement: CATALOGUE.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.title,
        /* Строка без перечня изделий всё равно услуга: тогда в каталог
           уходит её собственное имя, а не пустой список. */
        itemListElement: (c.items.length ? c.items : [c.title]).map((item) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item },
        })),
      })),
    },
  };
}
