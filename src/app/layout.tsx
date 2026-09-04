import type { Metadata, Viewport } from 'next';
import { MotionConfig } from 'motion/react';
import './globals.css';
import { fontVariables } from '@/app/fonts';
import { PlateProvider, type SectionMeta } from '@/components/chrome/PlateProvider';
import { TopBar } from '@/components/chrome/TopBar';
import { ControlStrip } from '@/components/chrome/ControlStrip';
import { MobileCta } from '@/components/chrome/MobileCta';
import { Filters } from '@/components/print/Filters';
import { NaryadProvider } from '@/state/NaryadContext';
import { localBusinessSchema } from '@/lib/schema';
import { SECTIONS } from '@/content/site';

const SITE_URL = 'https://alfaprint07.ru';

/** Грунт и усиление ухода приводки: у хвоста листа она держится хуже. */
const GROUNDS: Record<string, { ground: string; gain: number }> = {
  '01': { ground: 'paper', gain: 0.6 },
  '02': { ground: 'paper', gain: 0.8 },
  '03': { ground: 'ink', gain: 1.0 },
  '04': { ground: 'paper-hi', gain: 1.0 },
  '05': { ground: 'ink', gain: 1.25 },
  '06': { ground: 'paper', gain: 1.0 },
  '07': { ground: 'rubine', gain: 1.4 },
  '08': { ground: 'ink', gain: 0.5 },
};

const SECTION_META: SectionMeta[] = SECTIONS.map((s) => ({
  id: s.id,
  n: s.n,
  title: s.title,
  ...GROUNDS[s.n],
}));

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Альфа Принт — типография и рекламное агентство в Нальчике',
    template: '%s · Альфа Принт',
  },
  description:
    'Оперативная полиграфия, широкоформатная и УФ-печать, лазерная резка, гравировка, вышивка и сувениры в Нальчике. Тираж от одного экземпляра — часто в тот же день. Тарчокова, 29.',
  keywords: [
    'типография Нальчик',
    'полиграфия Нальчик',
    'печать визиток Нальчик',
    'баннеры Нальчик',
    'лазерная резка Нальчик',
    'гравировка Нальчик',
    'рекламное агентство Нальчик',
    'УФ-печать КБР',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Альфа Принт',
    title: 'Альфа Принт — печатаем в Нальчике с 2014 года',
    description:
      'Визитки, баннеры, наклейки, гравировка, лазерная резка, печать по акрилу, дереву, ткани и шоколаду. Срочный тираж — часто в тот же день.',
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#121110',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontVariables} data-ground="paper">
      <body>
        <a href="#main" className="skip-link t-label">
          К содержанию
        </a>

        {/* Без JS ракель не проходит — значит, маску надо снять, иначе набор
            останется под ней. Каталог при этом показывает обе формы стопкой. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                [data-reveal]{clip-path:none!important;opacity:1!important}
                .catalogue-panel{grid-column:1!important;grid-row:auto!important;position:static!important}
                .catalogue-panel li{transform:none!important;opacity:1!important}
                .catalogue-panel.is-idle{display:block!important}
                .catalogue-panel.is-idle .t-h3,.catalogue-panel.is-idle span{color:inherit!important}
              `,
            }}
          />
        </noscript>

        <MotionConfig reducedMotion="user">
          <NaryadProvider>
            <PlateProvider sections={SECTION_META} />
            <Filters />
            <TopBar />
            {children}
            <ControlStrip />
            <MobileCta />
          </NaryadProvider>
        </MotionConfig>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(SITE_URL)) }}
        />
      </body>
    </html>
  );
}
