# -*- coding: utf-8 -*-
"""
ПРИВЕДЕНИЕ ЧУЖИХ ЗНАКОВ К ОДНОЙ ФОРМЕ.

Готовит содержимое /public/logos для ленты `ClientMarks`.

Каждый чужой логотип приходит своим: цветным, на своей подложке, со своими
полями и своим оптическим весом. На этом листе красок ровно две, и чужой знак
может стоять только на форме K. Поэтому знак не «вставляется», а НАБИРАЕТСЯ:

  1. растрируется в PNG С СОХРАНЁННОЙ ПРОЗРАЧНОСТЬЮ (любой формат исходника:
     svg, png, jpg, webp), см. «Растрирование исходников» ниже;
  2. переводится в альфа-маску: краска там, где темно, а у выворотки,
     там, где непрозрачно;
  3. обрезается по краске: своих полей у знака больше нет;
  4. приводится по ОПТИЧЕСКОМУ ВЕСУ, а не по высоте: широкий словесный знак
     и компактная монограмма обязаны класть на лист одинаковое количество
     краски, иначе строка прыгает;
  5. кладётся в канву фиксированной высоты 300 px по общей оптической оси.

На выходе PNG-маска высотой ровно CANVAS. В CSS она красится currentColor,
то есть буквально печатается формой K, ничего не знает о грунте под собой и
на чёрном выворачивается сама.

    ЗАПУСК
      python scripts/marks.py sources.json
    где sources.json это [{ "slug", "name", "raster", "seen", "nudge"? }, …],
    а `raster` лежит в --src (по умолчанию build/marks-raster).

    ВЫВОД
      public/logos/<slug>.png     маски
      build/marks.json            строки для src/content/clients.ts

Поля-поправки (нужны редко, `ar` руками не правится никогда):
  `nudge` это множитель высоты. Знак со слоганом мелким кеглем или марка с очень
            тонким штрихом иногда садится не туда, куда садится глаз.
  `crop`   это доля поля, срезаемая с каждой стороны ДО обрезки по краске.
            Рамку локапа снимает `deframe` сам; `crop` стоит на случай, когда в
            исходнике вокруг знака стоит чужая графика.
  `invert`: исходник снят с ТЁМНОЙ подложки (аватарка сообщества, шапка
            канала), краска в нём там, где светло. Ставится ГЛАЗОМ, а не
            эвристикой: марка, которая сама является плашкой с вывороткой
            (круг «Истоков», флаг «Нацпроектов»), для любой автоматики
            выглядит так же, а переворачивать её нельзя.

РАСТРИРОВАНИЕ ИСХОДНИКОВ. Скрипт ждёт PNG. Привести к нему что угодно (svg,
jpg, webp) можно любым растеризатором, лишь бы он СОХРАНЯЛ ПРОЗРАЧНОСТЬ:
иначе выворотка склеится с бумагой и знак пропадёт. Проверено на sharp:

    sharp(buf, { density }).resize({ height: 700, fit: 'inside' }).png()
"""

import argparse
import json
import math
import os

from PIL import Image, ImageChops, ImageOps

CANVAS = 300           # высота канвы маски, px
BASE = 168             # опорная высота знака внутри канвы
# Доля выравнивания по ПЛОЩАДИ: 0 это все знаки одной высоты, 1 это все одной
# площади краски. Чистая площадь глазу не годится: словесный знак растекается
# вширь и садится так низко, что читается мельче соседей, глаз меряет
# набор по росту литеры, а не по количеству краски. Половина держит обе
# правды: «росмолодёжь» и ромб «Динамо» стоят в одну силу.
K = 0.50
H_MIN, H_MAX = 0.58, 1.40   # предохранители в долях BASE
W_MAX = 6.1            # потолок ширины в высотах BASE


def alpha_from(im, crop=0.0, invert=False):
    """Альфа = краска.

    Считается по САМОМУ ТЁМНОМУ каналу, а не по яркости: жёлтый знак
    «росмолодёжь» (#DAEF14) по яркости почти бумага, а краски на лист кладёт
    столько же, сколько чёрный. `255 - min(R, G, B)` это и есть покрытие
    краской, ровно как в CMY.

    Отдельный случай это ВЫВОРОТКА: знак, отрисованный белым по прозрачному
    (так лежит половина пресс-китовых PNG). На белой бумаге от него не
    осталось бы ничего, поэтому, если по краске выходит пусто, а по
    прозрачности нет, силуэтом становится сам альфа-канал исходника.
    """
    im = im.convert('RGBA')
    src_a = im.split()[3]
    if crop:
        w, h = im.size
        dx, dy = int(w * crop), int(h * crop)
        im = im.crop((dx, dy, w - dx, h - dy))
        src_a = src_a.crop((dx, dy, w - dx, h - dy))

    flat = Image.alpha_composite(
        Image.new('RGBA', im.size, (255, 255, 255, 255)), im
    ).convert('RGB')
    r, g, b = flat.split()
    ink = ImageOps.invert(ImageChops.darker(ImageChops.darker(r, g), b))

    def mean(ch):
        h = ch.histogram()
        return sum(i * n for i, n in enumerate(h)) / float(max(1, sum(h)))

    # Проверка на прозрачность обязана стоять ПЕРВОЙ. У исходника без
    # альфа-канала она сплошь непрозрачна, и без этого условия любой светлый
    # знак на белом (словесный «LE RUCCI», 6 % краски на лист) считался бы
    # вывороткой: силуэтом становился бы весь кадр, и в ленте вставала бы
    # чёрная плашка вместо марки.
    if src_a.getextrema()[0] < 250 and mean(ink) < 0.25 * mean(src_a):
        ink = src_a

    # Знак, снятый с ТЁМНОЙ подложки (аватарка сообщества, шапка канала):
    # краска там, где светло. Автоматике это доверять нельзя: марка, которая
    # САМА является плашкой с вывороткой (круг «Истоков», флаг «Нацпроектов»),
    # выглядит для любой эвристики точно так же, а переворачивать её нельзя.
    # Поэтому решение принимает глаз и записывает `invert` в списке знаков.
    if invert:
        ink = ImageOps.invert(ink)

    # Мягкий порог, а не линейная кривая. Чужой знак приходит одноцветной
    # СИЛУЭТНОЙ маской: серая буква фирменного локапа (#9C9C9C) обязана лечь
    # такой же плотной краской, что и чёрная, иначе в ленте один знак выйдет
    # полупрозрачным. Переход шириной 60 единиц оставляет антиалиасинг живым,
    # а шум JPEG у самой бумаги срезает начисто.
    def smooth(v):
        t = (v - 40) / 60.0
        t = 0.0 if t < 0 else (1.0 if t > 1 else t)
        return int(round(255 * t * t * (3 - 2 * t)))

    return ink.point([smooth(v) for v in range(256)])


def deframe(a, rounds=40):
    """Снимает рамку локапа.

    Некоторые знаки живут внутри волосяного прямоугольника (так набран
    KIBERone). В одну краску рамка становится плашкой и в ленте читается
    как ошибка вёрстки. Признак рамки это сплошная краска по всему периметру.
    """
    for _ in range(rounds):
        w, h = a.size
        if w < 40 or h < 40:
            break
        px = a.load()

        def full(pts):
            vals = [px[x, y] for x, y in pts]
            return sum(1 for v in vals if v > 120) / float(len(vals)) > 0.9

        sx, sy = max(1, w // 200), max(1, h // 200)
        if not (full([(x, 0) for x in range(0, w, sx)])
                and full([(x, h - 1) for x in range(0, w, sx)])
                and full([(0, y) for y in range(0, h, sy)])
                and full([(w - 1, y) for y in range(0, h, sy)])):
            break
        a = trim(a.crop((2, 2, w - 2, h - 2)))
    return a


def trim(a):
    box = a.getbbox()
    return a.crop(box) if box else a


def ink_area(a):
    return sum(a.convert('L').tobytes()) / 255.0


def build(items, src_dir, out_dir, json_out):
    os.makedirs(out_dir, exist_ok=True)

    stage = []
    for it in items:
        path = os.path.join(src_dir, it['raster'])
        if not os.path.exists(path):
            print('НЕТ ИСХОДНИКА', path)
            continue
        a = deframe(trim(alpha_from(Image.open(path), it.get('crop', 0.0), it.get('invert', False))))
        w, h = a.size
        if w < 8 or h < 4:
            print('СЛИШКОМ МАЛО', it['slug'], a.size)
            continue
        stage.append(dict(it, img=a, w=w, h=h, cov=ink_area(a) / float(w * h)))

    if not stage:
        raise SystemExit('нечего набирать')

    # Опорная площадь это медиана площадей, посчитанных при высоте BASE.
    areas = sorted(s['cov'] * BASE * BASE * (s['w'] / s['h']) for s in stage)
    target = areas[len(areas) // 2]

    out = []
    for s in stage:
        ar = s['w'] / s['h']
        h_area = math.sqrt(target / max(s['cov'] * ar, 1e-6))
        h = (BASE ** (1 - K)) * (h_area ** K) * s.get('nudge', 1.0)
        h = max(BASE * H_MIN, min(BASE * H_MAX, h))
        if h * ar > BASE * W_MAX:
            h = BASE * W_MAX / ar
        h = int(round(h))
        w = max(1, int(round(h * ar)))

        canvas = Image.new('L', (w, CANVAS), 0)
        canvas.paste(s['img'].resize((w, h), Image.LANCZOS), (0, (CANVAS - h) // 2))
        Image.merge('RGBA', [Image.new('L', canvas.size, 0)] * 3 + [canvas]).save(
            os.path.join(out_dir, s['slug'] + '.png'), optimize=True
        )

        out.append({
            'slug': s['slug'],
            'name': s['name'],
            'ar': round(w / float(CANVAS), 4),
            'seen': s.get('seen', ''),
        })
        print(f"{s['slug']:<24} {w:>4}×{h:<4}  краска {s['cov']:.3f}  ar {w / CANVAS:.4f}")

    os.makedirs(os.path.dirname(json_out) or '.', exist_ok=True)
    with open(json_out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f'\n{len(out)} знаков → {out_dir}\nстроки для clients.ts → {json_out}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('sources', help='JSON со списком знаков')
    ap.add_argument('--src', default=os.path.join('build', 'marks-raster'))
    ap.add_argument('--out', default=os.path.join('public', 'logos'))
    ap.add_argument('--json', default=os.path.join('build', 'marks.json'))
    a = ap.parse_args()
    with open(a.sources, encoding='utf-8') as f:
        build(json.load(f), a.src, a.out, a.json)
