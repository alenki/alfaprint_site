import { PervyiProgon } from '@/components/sections/PervyiProgon';
import { Dopusk } from '@/components/sections/Dopusk';
import { DveFormy } from '@/components/sections/DveFormy';
import { Rastr } from '@/components/sections/Rastr';
import { ZaOdinDen } from '@/components/sections/ZaOdinDen';
import { PodpisnoiList } from '@/components/sections/PodpisnoiList';
import { VPechat } from '@/components/sections/VPechat';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';

/**
 * ГЛАВНАЯ ПОЛОСА.
 *
 * Ритм грунтов: бумага · бумага · чёрный · бумага-hi · чёрный · бумага ·
 * РУБИН · чёрный. Красное поле — одно на весь сайт, и стоит оно ровно там,
 * где заказ подписывают в печать.
 *
 * Остальные страницы ещё не собраны; пункты меню ведут в разделы этой.
 */
export default function Home() {
  return (
    <main id="main">
      <PervyiProgon />
      <Dopusk />
      <DveFormy />
      <Rastr />
      <ZaOdinDen />
      <PodpisnoiList />
      <VPechat />
      <VykhodnyeDannye />
    </main>
  );
}
