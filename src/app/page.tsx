import { PervyiProgon } from '@/components/sections/PervyiProgon';
import { Dopusk } from '@/components/sections/Dopusk';
import { DveFormy } from '@/components/sections/DveFormy';
import { Rastr } from '@/components/sections/Rastr';
import { Srok } from '@/components/sections/Srok';
import { PodpisnoiList } from '@/components/sections/PodpisnoiList';
import { Marshrut } from '@/components/sections/Marshrut';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';

/**
 * ГЛАВНАЯ ПОЛОСА.
 *
 * Ритм грунтов: бумага · бумага · чёрный · бумага-hi · чёрный · бумага ·
 * бумага · чёрный. Сплошной заливки на листе больше нет: полоса «В печать»
 * снята целиком, а с ней ушло и единственное красное поле.
 *
 * ДВЕ БУМАГИ ПОДРЯД В КОНЦЕ ЭТО РЕШЕНИЕ, А НЕ ПРОПУСК. Номер снятой полосы
 * занял «Маршрут», и отбивает он себя сам: полоса фотографий во весь формат
 * весит на листе тяжелее любого грунта, а чёрный встал бы вплотную к
 * чёрному §08.
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
      <Srok />
      <PodpisnoiList />
      <Marshrut />
      <VykhodnyeDannye />
    </main>
  );
}
