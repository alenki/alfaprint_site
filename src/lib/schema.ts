import { COMPANY, CONTACTS } from '@/content/site';
import { CATALOGUE } from '@/content/catalogue';
import { HOURS_CONFIRMED } from '@/content/hours';

/**
 * Разметка LocalBusiness.
 *
 * В разметку попадает ТОЛЬКО то, что подтверждено: адрес, телефон, рейтинг
 * и каталог с сайта агентства. Часы уходят в разметку лишь после того, как
 * клиент их подтвердит (HOURS_CONFIRMED), реквизиты уйдут, когда пришлёт.
 * Поисковику нельзя отдавать данные, которых мы не знаем.
 */
export function localBusinessSchema(siteUrl: string) {
  const hours = HOURS_CONFIRMED
    ? [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '15:00' },
      ]
    : undefined;

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
