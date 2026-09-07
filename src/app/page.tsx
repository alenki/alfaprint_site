import { PervyiProgon } from '@/components/sections/PervyiProgon';
import { Dopusk } from '@/components/sections/Dopusk';
import { DveFormy } from '@/components/sections/DveFormy';
import { Rastr } from '@/components/sections/Rastr';
import { ZaOdinDen } from '@/components/sections/ZaOdinDen';
import { PodpisnoiList } from '@/components/sections/PodpisnoiList';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';

/**
 * ГЛАВНАЯ ПОЛОСА.
 *
 * Ритм грунтов: бумага · бумага · чёрный · бумага-hi · чёрный · бумага ·
 * чёрный. Сплошной заливки на листе больше нет: полоса «В печать» снята
 * целиком, а с ней ушло и единственное красное поле.
 *
 * Остальные страницы ещё не собраны; пункты меню ведут в разделы этой.
 */
export default function Home() {
  return (
    <main id="main">
      {/* Лента чужих знаков больше не отдельный узел листа: она ушла внутрь
          §01 и стоит нижней кромкой первого экрана. См. `PervyiProgon`. */}
      <PervyiProgon />
      <Dopusk />
      <DveFormy />
      <Rastr />
      <ZaOdinDen />
      <PodpisnoiList />
      <VykhodnyeDannye />
    </main>
  );
}
