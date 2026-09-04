import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from './fonts';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { Motion } from '@/components/providers/Motion';
import { Cursor } from '@/components/ui/Cursor';
import { SushkaLayer } from '@/components/ui/Sushka';
import { COMPANY, CONTACTS } from '@/content/site';

const SITE = 'https://alfaprint07.ru';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Альфа Принт — типография и рекламное агентство в Нальчике',
    template: '%s · Альфа Принт',
  },
  description:
    'Печатаем то, с чем не справляются другие типографии города. Оперативная полиграфия, УФ-печать, лазерная резка, гравировка, широкоформатная печать. Нальчик, ул. Тарчокова, 29. С 2014 года.',
  keywords: [
    'типография Нальчик',
    'полиграфия Нальчик',
    'печать визиток Нальчик',
    'УФ-печать',
    'лазерная резка Нальчик',
    'гравировка',
    'широкоформатная печать',
    'рекламное агентство Нальчик',
    'Альфа Принт',
  ],
  authors: [{ name: COMPANY.name }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE,
    siteName: COMPANY.name,
    title: 'Альфа Принт — типография и рекламное агентство в Нальчике',
    description:
      'Печатаем то, с чем не справляются другие типографии города. С 2014 года. 4,8 на Яндекс.Картах.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = {
  themeColor: '#efeae0',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#organization`,
  name: COMPANY.name,
  alternateName: COMPANY.latin,
  description:
    'Типография и рекламное агентство полного цикла: оперативная полиграфия, интерьерная и широкоформатная печать, УФ-печать, гравировка, лазерная резка, сувенирная продукция.',
  url: SITE,
  telephone: '+79674257979',
  foundingDate: '2014',
  priceRange: '₽₽',
  image: `${SITE}/og.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.address,
    addressLocality: COMPANY.city,
    addressRegion: COMPANY.region,
    addressCountry: 'RU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: COMPANY.coords.lat,
    longitude: COMPANY.coords.lng,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: COMPANY.rating,
    reviewCount: COMPANY.reviewCount,
    bestRating: 5,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '15:00',
    },
  ],
  sameAs: [CONTACTS.instagram, CONTACTS.vk, CONTACTS.telegram, CONTACTS.maps],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={fontVariables}>
      <body>
        <a
          href="#main"
          className="t-meta sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[200] focus-visible:bg-ink focus-visible:px-4 focus-visible:py-3 focus-visible:text-paper"
        >
          К содержанию
        </a>
        <Motion>
          <SmoothScroll />
          <Cursor />
          <SushkaLayer />
          {children}
        </Motion>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
