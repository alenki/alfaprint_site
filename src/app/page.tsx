import { PervyiProgon } from '@/components/sections/PervyiProgon';
import { Dopusk } from '@/components/sections/Dopusk';
import { DveFormy } from '@/components/sections/DveFormy';
import { Rastr } from '@/components/sections/Rastr';
import { Srok } from '@/components/sections/Srok';
import { PodpisnoiList } from '@/components/sections/PodpisnoiList';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';

/**
 * ГЛАВНАЯ ПОЛОСА.
 *
 * Ритм грунтов: бумага · бумага · тёмно-синий · бумага-hi · тёмно-синий ·
 * бумага · тёмно-синий. Тёмный грунт это тёмно-синий цвет агентства; в
 * разметке он по-прежнему зовётся `ink`. Сплошной заливки второй краской на
 * листе нет: полоса «В печать» снята целиком.
 *
 * НОМЕРА §07 НЕТ. Его занимал «Маршрут» с прогоном фотографий до двери, и
 * 26.09 он снят целиком; выходные данные оставлены под своим §08.
 *
 * Остальные страницы ещё не собраны; пункты меню ведут в разделы этой.
 */
export default function Home() {
  return (
    <main id="main">
      {/* Лента услуг не отдельный узел листа: она стоит внутри §01 нижней
          кромкой первого экрана. См. `PervyiProgon`. */}
      <PervyiProgon />
      <Dopusk />
      <DveFormy />
      <Rastr />
      <Srok />
      <PodpisnoiList />
      <VykhodnyeDannye />
    </main>
  );
}
