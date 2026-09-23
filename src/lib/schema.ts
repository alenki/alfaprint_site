import { COMPANY, CONTACTS } from '@/content/site';
import { CATALOGUE } from '@/content/catalogue';
import { HOURS, HOURS_CONFIRMED, LUNCH } from '@/content/hours';

/** Порядок дней в schema.org совпадает с Date#getDay, индекс общий с HOURS. */
const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * ПЕРЕРЫВ В SCHEMA.ORG ЭТО ДВА ОКНА, А НЕ ПОЛЕ. Обеда в
 * OpeningHoursSpecification нет, и час с 13:00 закрывается единственным
 * честным способом: день отдаётся двумя отрезками, до перерыва и после.
 * Выходные не описываются вовсе: у дня без окна нет часов, и это ровно то,
 * что поисковик обязан прочитать.
 *
 * Сборка держится на том, что все рабочие дни идут по одному окну; появится
 * второе, и раскладывать придётся по дням.
 */
function openingHours() {
  const days = SCHEMA_DAYS.filter((_, i) => HOURS[i]);
  const shift = HOURS.find((h) => h);
  if (!shift || days.length === 0) return undefined;

  return [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: shift.open, closes: LUNCH.start },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: LUNCH.end, closes: shift.close },
  ];
}

/**
 * Разметка LocalBusiness.
 *
 * В разметку попадает ТОЛЬКО то, что подтверждено: адрес, телефон, рейтинг
 * и каталог с сайта агентства. Часы уходят в разметку лишь после того, как
 * клиент их подтвердит (HOURS_CONFIRMED), реквизиты уйдут, когда пришлёт.
 * Поисковику нельзя отдавать данные, которых мы не знаем.
 */
export function localBusinessSchema(siteUrl: string) {
  const hours = HOURS_CONFIRMED ? openingHours() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PrintShop'],
    '@id': `${siteUrl}#organization`,
    name: `${COMPANY.legalName}, ${COMPANY.name}`,
    alternateName: [COMPANY.name, 'ALFA PRINT'],
    url: siteUrl,
    telephone: '+79674257979',
    foundingDate: String(COMPANY.since),
    description:
      'Рекламное агентство полного цикла и типография в Нальчике: визитки, наклейки, бирки, одежда с принтом, кружки, сувениры и упаковка. Оперативная полиграфия, широкоформатная и УФ-печать, лазерная резка, гравировка и вышивка. Тираж от одного экземпляра, часто в тот же день.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `ул. ${COMPANY.street}`,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      addressCountry: 'RU',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: COMPANY.reviewCount,
      bestRating: 5,
    },
    sameAs: [CONTACTS.telegram, CONTACTS.max, CONTACTS.maps],
    /**
     * СНИМКИ МЕСТА, А НЕ КАРТИНКИ ФИРМЫ. Оба сняты с прежнего сайта и оба
     * показывают, как выглядит адрес на местности: крыльцо с вывеской и
     * ориентир на улице. Ни логотипа, ни работ здесь быть не должно, это
     * поле карточки организации, а не витрины.
     *
     * Адрес абсолютный: siteUrl уже несёт подкаталог площадки, см.
     * `basePath` в `next.config.ts`.
     */
    image: [`${siteUrl}/route/05.webp`, `${siteUrl}/route/01.webp`],
    ...(hours ? { openingHoursSpecification: hours } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Производство «Альфа Принт»',
      itemListElement: CATALOGUE.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.title,
        itemListElement: c.items.map((item) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item },
        })),
      })),
    },
  };
}
