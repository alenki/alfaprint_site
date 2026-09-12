import type { Metadata } from 'next';
import { Raschet } from '@/components/sections/Raschet';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';
import { RASCHET } from '@/content/raschet';

/**
 * СТРАНИЦА ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА.
 *
 * ОТДЕЛЬНАЯ ПОЛОСА, А НЕ РАЗДЕЛ ГЛАВНОЙ. Главная держит закон плотности:
 * одно заявление, один абзац, не больше двух волосяных на раздел. Девять
 * параметров с их вариантами этот закон ломают в любой раскладке, а §03 уже
 * несёт единственное разрешённое исключение.
 *
 * КОНЧАЕТСЯ ВЫХОДНЫМИ ДАННЫМИ, как и главная, и довод не «так принято»:
 * выходные данные это то, чем кончается любой печатный лист.
 */
export const metadata: Metadata = {
  title: RASCHET.title,
  description: RASCHET.metaDescription,
  alternates: { canonical: '/raschet' },
  openGraph: {
    title: `${RASCHET.title} · Альфа Принт`,
    description: RASCHET.metaDescription,
  },
};

export default function RaschetPage() {
  return (
    <main id="main">
      <Raschet />
      <VykhodnyeDannye />
    </main>
  );
}
