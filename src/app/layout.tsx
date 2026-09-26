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
import { COMPANY, SECTIONS } from '@/content/site';
import { K_SECTIONS } from '@/content/kontakty';

/**
 * АДРЕС ЛИСТА. Сайт стоит в подкаталоге: lumako.ru/legko, см. `next.config.ts`.
 * Отсюда его берут и канонический адрес, и Open Graph, и разметка организации:
 * все три обязаны указывать ТУДА, ГДЕ ЛИСТ ЛЕЖИТ НА САМОМ ДЕЛЕ. Своего домена
 * у агентства пока нет; когда он появится, правится эта строка и `basePath`
 * в конфиге.
 */
export const SITE_URL = 'https://lumako.ru/legko';

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
    default: 'Legko',
    template: '%s | Legko',
  },
  /* Услуги перечислены по листовке агентства, адрес по карточке. Ни срока,
     ни цены, ни тиража здесь нет: агентство их нигде не называет. */
  description:
    'Рекламное агентство Legko в Нальчике: полиграфия, наружная реклама, печать на текстиле, сублимационная и УФ-печать, сувенирная продукция, флаги, печати и штампы, широкоформатная и интерьерная печать. Кузнечный переулок, 4.',
  keywords: [
    'рекламное агентство Нальчик',
    'наружная реклама Нальчик',
    'полиграфия Нальчик',
    'печать на текстиле Нальчик',
    'сублимационная печать Нальчик',
    'сувенирная продукция Нальчик',
    'УФ-печать Нальчик',
    'изготовление флагов Нальчик',
    'печати и штампы Нальчик',
    'широкоформатная печать Нальчик',
    'интерьерная печать Нальчик',
    'печать баннеров Нальчик',
    'вывески и таблички Нальчик',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Legko',
    title: `Legko · рекламное агентство в Нальчике с ${COMPANY.since} года`,
    description:
      'Полиграфия, печать на текстиле, сувениры с логотипом, флаги, печати и штампы. Баннеры и самоклейка, стенды, вывески и таблички, широкоформатная и интерьерная печать.',
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

/* Цвет оснастки браузера это тёмно-синий грунт агентства (`--color-deep`):
   им же залиты все тёмные полосы листа. */
export const viewport: Viewport = {
  themeColor: '#092c6c',
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
