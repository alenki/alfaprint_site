import type { Metadata } from 'next';
import './raschet.css';
import { SITE_URL } from '@/app/layout';
import { ROUTES } from '@/lib/base';
import { Raschet } from '@/components/sections/Raschet';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';
import { RASCHET } from '@/content/raschet';

/**
 * СТРАНИЦА ЗАКАЗА.
 *
 * ОТДЕЛЬНАЯ ПОЛОСА, А НЕ РАЗДЕЛ ГЛАВНОЙ. Главная держит закон плотности:
 * одно заявление, один абзац, не больше двух волосяных на раздел. Пять
 * параметров наряда с их вариантами этот закон ломают в любой раскладке, а
 * §03 уже несёт единственное разрешённое исключение.
 *
 * КОНЧАЕТСЯ ВЫХОДНЫМИ ДАННЫМИ, как и главная, и довод не «так принято»:
 * выходные данные это то, чем кончается любой печатный лист.
 */
export const metadata: Metadata = {
  title: RASCHET.title,
  description: RASCHET.metaDescription,
  /* Адрес абсолютный и собран из двух источников: площадка из раскладки, путь
     из таблицы адресов. Относительный сюда писать нельзя: `metadataBase` уже
     несёт подкаталог площадки, и путь от корня его бы затёр. Тем же способом
     собран канонический адрес листа «Контакты». */
  alternates: { canonical: `${SITE_URL}${ROUTES.raschet}` },
  openGraph: {
    title: `${RASCHET.title} | Legko`,
    description: RASCHET.metaDescription,
  },
};

export default function RaschetPage() {
  return (
    <main id="main">
      {/* БЕЗ СКРИПТОВ ВАРИАНТЫ ВСЁ РАВНО ПРОЧИТАНЫ, И ЭТО НЕ УКРАШЕНИЕ:
          сборка статическая, а панели лежат в разметке закрытыми меткой
          `data-open`. Раскрыть то, чего в документе нет, нельзя, а прочитать
          имена вариантов обязан и тот, у кого скрипты сняты.

          СНИМАТЬ ЗДЕСЬ ПРИХОДИТСЯ ЧЕТЫРЕ ОБЪЯВЛЕНИЯ, А НЕ ОДНО. Панель
          закрыта краской, `visibility` и резом (разбор при `.rs-panel` в
          `raschet.css`), и все три обязаны отпустить её разом; четвёртое,
          `pointer-events`, возвращает набору право быть выделенным мышью.
          Ходов при этом не заводится ни одного: показать сразу всё это не
          переход, а раскладка.

          НИ ОДНОГО `!important` ЗДЕСЬ НЕТ, И ЭТО УСЛОВИЕ, А НЕ ОПРЯТНОСТЬ.
          Стиль в `<noscript>` всегда вне слоёв, а у ВАЖНЫХ объявлений
          порядок слоёв перевёрнут: важное вне слоёв слабее важного из слоя
          `base`, где preflight Tailwind держит `[hidden]{display:none
          !important}`. Обычное объявление вне слоёв, наоборот, бьёт любой
          слой. Поэтому панель закрыта обычными правилами из
          `@layer components`, а не атрибутом `hidden`; подробный разбор в
          `RaschetField.tsx`.

          Стиль стоит ЗДЕСЬ, а не в `<noscript>` макета: там живёт тот же
          приём для §03, но лист обязан уметь сниматься с сайта целиком, а
          правка чужого файла этому мешает. Без скриптов резерв не нужен
          (двигать нечего), поэтому панели встают в поток стопкой, а список
          услуг из накрывающей плашки становится обычной полосой в конце:
          накрывать собой наряд он вправе только тогда, когда его можно
          закрыть. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .rs-slot{height:auto;display:block}
              .rs-panel{position:static;visibility:visible;opacity:1;
                clip-path:none;pointer-events:auto}
              .rs-field{transform:none}
              .rs-tail{display:none}
              .rs-products{position:static;inset:auto;visibility:visible;
                opacity:1;clip-path:none;pointer-events:auto;
                margin-top:clamp(26px,4vw,44px)}
            `,
          }}
        />
      </noscript>

      <Raschet />
      <VykhodnyeDannye />
    </main>
  );
}
