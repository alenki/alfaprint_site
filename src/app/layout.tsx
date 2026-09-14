import type { Metadata, Viewport } from 'next';
import { MotionConfig } from 'motion/react';
import './globals.css';
import { fontVariables } from '@/app/fonts';
import { PlateProvider, type SectionMeta } from '@/components/chrome/PlateProvider';
import { Priladka } from '@/components/chrome/Priladka';
import { TopBar } from '@/components/chrome/TopBar';
import { ControlStrip } from '@/components/chrome/ControlStrip';
import { MobileCta } from '@/components/chrome/MobileCta';
import { CursorTrail } from '@/components/chrome/CursorTrail';
import { NaryadProvider } from '@/state/NaryadContext';
import { localBusinessSchema } from '@/lib/schema';
import { SECTIONS } from '@/content/site';
import { K_SECTIONS } from '@/content/kontakty';

/**
 * АДРЕС ЛИСТА. Сайт стоит в подкаталоге: lumako.ru/alfaprint, см. `next.config.ts`.
 * Отсюда его берут и канонический адрес, и Open Graph, и разметка организации:
 * все три обязаны указывать ТУДА, ГДЕ ЛИСТ ЛЕЖИТ НА САМОМ ДЕЛЕ. Когда клиент
 * заведёт собственный домен, правится эта строка и `basePath` в конфиге.
 */
export const SITE_URL = 'https://lumako.ru/alfaprint';

/**
 * РЕЕСТР НОМЕРОВ, И БОЛЬШЕ НИЧЕГО.
 *
 * Здесь стояла ещё и таблица грунтов: ground и gain на каждый номер главной.
 * Это была ВТОРАЯ запись тех же сведений. Первая стоит там, где полоса и
 * набрана: `Section` пишет грунт и усиление на сам узел, и `PlateProvider`
 * читает теперь только их. Второй записи хватило ровно на два листа из
 * четырёх: «Расчёт» и «Согласие» свои первые полосы сюда не отдали, и хрома
 * на них застревала вывернутой по краске до перезагрузки.
 *
 * Реестр остался ровно тем, чего в разметке нет: НОМЕРОМ полосы. Нужен он
 * одному указателю разделов в верхней полосе; номера принадлежат главной, и
 * на листе, которого здесь нет, текущего раздела просто нет.
 *
 * Номера листов не пересекаются по построению: у главной «01»…«08», у
 * контактов «K1»…«K4», см. `content/kontakty.ts`.
 */
const SECTION_META: SectionMeta[] = [
  ...SECTIONS.map((s) => ({ id: s.id, n: s.n })),
  ...K_SECTIONS.map((s) => ({ id: s.id, n: s.n })),
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Альфа Принт',
    template: '%s | Альфа Принт',
  },
  description:
    'Рекламное агентство полного цикла в Нальчике: визитки, наклейки, бирки, одежда с принтом, кружки, сувениры, упаковка, гравировка и лазерная резка. Часто в тот же день. Тарчокова, 29.',
  keywords: [
    'рекламное агентство Нальчик',
    'типография Нальчик',
    'полиграфия Нальчик',
    'печать визиток Нальчик',
    'наклейки на заказ Нальчик',
    'бирки для одежды Нальчик',
    'печать на футболках Нальчик',
    'кружки с логотипом Нальчик',
    'сувениры с логотипом Нальчик',
    'баннеры Нальчик',
    'лазерная резка Нальчик',
    'гравировка Нальчик',
    'УФ-печать КБР',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Альфа Принт',
    title: 'Альфа Принт · рекламное агентство в Нальчике с 2014 года',
    description:
      'Визитки, наклейки, бирки, одежда с принтом, кружки, сувениры и упаковка. Баннеры, гравировка, лазерная резка, печать по акрилу, дереву, ткани и шоколаду. Срочный тираж часто в тот же день.',
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#121110',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* ГРУНТОВ НА КОРНЕ ТРИ, И ЭТО РАЗНЫЕ СВЕДЕНИЯ. `data-ground` это раздел,
     который ЧИТАЮТ: его считает черта по середине окна, и с него живут
     указатель разделов и усиление ухода приводки. Два других это лист ПОД
     хромой: `data-bar-ground` под верхней полосой у верхнего реза,
     `data-strip-ground` под контрольной шкалой у нижнего, и обе стоят на
     полэкрана в стороне от середины, см. `PlateProvider`.

     Написаны бумажными потому, что до первой прокрутки под чертой полосы нет
     ни одного раздела: первый начинается ровно под нею. */
  return (
    <html
      lang="ru"
      className={fontVariables}
      /* `data-press` ставит на корень приладочный лист, и ставит РАНЬШЕ
         гидратации: React видит на узле атрибут, которого сам не рисовал, и
         без этой пометки пишет в консоль расхождение разметки. Значение при
         этом верное, React его не трогает, см. `Priladka.tsx`. */
      suppressHydrationWarning
      data-ground="paper"
      data-bar-ground="paper"
      data-strip-ground="paper"
    >
      <body>
        <a href="#main" className="skip-link t-label">
          К содержанию
        </a>

        {/* Без JS ракель не проходит, значит, маску надо снять, иначе набор
            останется под ней. Оттиски §03 при этом ложатся стопкой: без JS
            форму не переключить, а прочитать надо все десять.

            Приладочный лист без JS снимается целиком, и первым правилом:
            считать на нём нечем, а накрывает он собой весь сайт. Паузы §01
            здесь снимать не надо, её ставит тот же скрипт, которого нет. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .mk{display:none!important}
                [data-reveal]{clip-path:none!important;opacity:1!important}
                .dv-sheet{position:static!important;display:block!important;
                  aspect-ratio:auto!important;max-height:none!important;overflow:visible!important}
                .dv-print{grid-area:auto!important;visibility:visible!important;
                  clip-path:none!important;opacity:1!important}
                .dv-print + .dv-print{margin-top:1.25rem}
                .dv-panel{position:static!important;height:auto!important;right:auto!important;
                  visibility:visible!important;clip-path:none!important;opacity:1!important}
                .dv-item{transform:none!important}
                .dv-plate[hidden]{display:block!important}
                .dv-mount::after{display:none!important}
                .dv-tail,.dv-toggle{display:none!important}
              `,
            }}
          />
        </noscript>

        {/* ПРИЛАДОЧНЫЙ ЛИСТ СТОИТ ВЫШЕ ВСЕГО ОСТАЛЬНОГО В РАЗМЕТКЕ, и место
            это не про порядок чтения, а про порядок РАЗБОРА. Внутри лежит
            голый скрипт, и выполниться он обязан раньше, чем браузер дойдёт
            до `<main>`: только тогда пауза §01 встаёт с первого её кадра.
            Ниже по дереву он опоздал бы ровно на ту анимацию, которую и
            заводится придержать. См. `Priladka.tsx`. */}
        <Priladka />

        <MotionConfig reducedMotion="user">
          <NaryadProvider>
            <PlateProvider sections={SECTION_META} />
            <TopBar />
            {children}
            <ControlStrip />
            <MobileCta />
            {/* Последним ребёнком листа намеренно: холст фиксированный, и
                внутри секции его заперло бы isolation, а внутри содержания
                срезал бы clip-path. Здесь же он не разрывает порядок чтения. */}
            <CursorTrail />
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
