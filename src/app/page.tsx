import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { OneDay } from '@/components/sections/OneDay';
import { Production } from '@/components/sections/Production';
import { Ladder } from '@/components/sections/Ladder';
import { Ottisk } from '@/components/sections/Ottisk';
import { Materials } from '@/components/sections/Materials';
import { Works } from '@/components/sections/Works';
import { Reviews } from '@/components/sections/Reviews';
import { Naryad } from '@/components/sections/Naryad';
import { Contacts } from '@/components/sections/Contacts';

/**
 * ГЛАВНАЯ ПОЛОСА
 *
 * Порядок листа: заявка → доказательство → производство → форматы → отделка →
 * материалы → работы → отзывы → наряд → цех. Каждая секция пронумерована так,
 * как нумеруют полосы в вёрстке: читатель всегда знает, где он на листе.
 *
 * Остальные страницы ещё не собраны — пункты меню пока ведут на разделы этой.
 */
export default function Home() {
  return (
    <>
      <div className="sheet-rules" aria-hidden />
      <Header />
      <main id="main" className="relative z-10">
        <Hero />
        <OneDay />
        <Production />
        <Ladder />
        <Ottisk />
        <Materials />
        <Works />
        <Reviews />
        <Naryad />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
