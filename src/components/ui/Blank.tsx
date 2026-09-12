'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { K_BLANK } from '@/content/kontakty';
import { EMPTY_BLANK, hello, lines, text, waHref, type BlankState } from '@/lib/blank';
import { SEND_MODE, send } from '@/lib/send';
import { Soglasie } from '@/components/ui/Soglasie';
import { cn } from '@/lib/cn';

/**
 * БЛАНК И ОТТИСК.
 *
 * Слева НАБИРАЮТ, справа ПЕЧАТАЕТСЯ. Лист справа это не предпросмотр и не
 * украшение: `lib/blank.ts` собирает из него и то, что видно, и то, что
 * уходит в переписку, одним и тем же вызовом. Разойтись им негде, и потому
 * у этой формы нет того, что есть у всех прочих форм в сети: скрытой части.
 *
 * НИ ОДНОГО ОБЯЗАТЕЛЬНОГО ПОЛЯ И НИ ОДНОЙ ПРОВЕРКИ. Пустая строка остаётся
 * на листе НЕПРОПЕЧАТАННЫМ МЕСТОМ, волосяной на месте набора, и уходит из
 * сообщения сама. Ругаться на человека, который не знает срока, значит
 * требовать от него знать срок; он затем и пишет, чтобы ему сказали.
 *
 * ПОЛЯ БЕЗ РАМОК. Строки стоят на волосяных базовых линиях, как в настоящем
 * бланке наряда: рамка вокруг каждого поля превратила бы полосу в анкету, а
 * базовая линия оставляет её бланком. Волосяных здесь три, по одной на стык
 * полей, и это тот же случай, что гармошка §03: перечень полей И ЕСТЬ
 * содержание полосы, а не её оформление. Ряды чипов тоже без рамок: коробка
 * кнопок несла собственную нижнюю грань, и рядом с волосяной поля на месте
 * одной черты читались две.
 *
 * ЧЕТЫРЕ ПОЛЯ, И РЯД ЧИПОВ СРЕДИ НИХ ОДИН: имя, повод, что нужно, связь.
 * Порядок этот несущий. Срока на бланке нет вовсе: его называет и считает
 * `/raschet`, а здесь он спрашивал то, на что пишущий ещё не знает ответа.
 * Освободившееся первое место занято именем: два открытых поля по краям и
 * выбор с набором между ними читаются разговором, а не анкетой.
 *
 * КАКУЮ СТРОКУ НАБИРАЮТ, ТА И ОТМЕЧЕНА. Поле под курсором ставит рубиновую
 * метку у своей строки на листе, и метка эта единственная связь между
 * половинами разворота. Двигается она только на смене поля, а не на каждом
 * знаке: набор под рукой не должен мигать. Повод отмечает ПРИВЕТСТВИЕ, а не
 * строку списка, потому что печатается он именно туда.
 *
 * КТО ОТПРАВЛЯЕТ, РЕШАЕТ РЕЖИМ, А НЕ ЭТОТ ФАЙЛ, см. `lib/send.ts`. При
 * `messenger` кнопка открывает переписку с готовым текстом, и на этом её
 * работа кончается: подтверждать нечего, потому что страница ничего и не
 * отправляла. При `auto` отправляет страница, и тогда у листа появляются
 * состояния, которых у него никогда не было.
 *
 * ЧЕТЫРЕ СОСТОЯНИЯ, И ВСЕ ЧЕТЫРЕ ОДНОГО РОСТА. Подвал листа это всегда РОВНО
 * одна строка действия и одна строка оговорки: кнопка, кнопка в работе, штамп,
 * возврат в WhatsApp. Лист не имеет права подрасти под пальцем в тот миг,
 * когда по нему нажимают, а нажимают именно туда, поэтому у подвала свой
 * запас высоты, и ни одно состояние из него не выходит. На узкой мере рост
 * держит не запас, а РАСКЛАДКА: действие и ссылка стоят там столбцом всегда,
 * потому что иначе высоту подвала решала бы длина слова на кнопке рядом, и
 * лист прыгал бы на «Текст скопирован», см. `kb-sheet-foot` в `kontakty.css`.
 *
 * ШТАМП ЭТО НЕ «СПАСИБО ЗА ЗАЯВКУ». Уехавший лист в цеху не убирают со стола
 * и не закрывают галочкой на полэкрана: его ШТЕМПЕЛЮЮТ и оставляют лежать.
 * Поэтому отправленное обращение никуда не девается, остаётся читаемым
 * целиком, и получает рубиновый штамп со временем. Форма слева при этом
 * запирается: набирать в бланк, который уже уехал, значит набирать в никуда.
 *
 * УПАВШАЯ ОТПРАВКА ОПУСКАЕТСЯ ДО WHATSAPP, А НЕ ДО ИЗВИНЕНИЙ. Набранное
 * остаётся слово в слово, на месте кнопки встаёт та самая ссылка, которой лист
 * жил раньше, и буфер никуда не девается. Отказ связи не должен стоить
 * человеку минуты, которую он потратил на бланк.
 */

const FIELDS = ['name', 'kind', 'what', 'who'] as const;
type FieldKey = (typeof FIELDS)[number];

/**
 * СОСТОЯНИЕ ПОДВАЛА. `idle` при `messenger` не меняется никогда: там нечему
 * происходить, потому что страница ничего не отправляет.
 */
type Stage = 'idle' | 'sending' | 'sent' | 'failed';

/** Слова поводов. Строку письма при каждом держит `lib/blank.ts`. */
const KINDS = K_BLANK.kinds.map((k) => k.label);

/** Лид, надпись на кнопке и оговорка берутся по режиму, одним куском. */
const MODE = K_BLANK.modes[SEND_MODE];

export function Blank() {
  const [state, setState] = useState<BlankState>(EMPTY_BLANK);
  const [focused, setFocused] = useState<FieldKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [sentAt, setSentAt] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  /* Дата ставится ПОСЛЕ гидратации: на сервере её нет, и быть не может, иначе
     сервер и браузер разойдутся на первом же переходе через полночь. */
  useEffect(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    setToday(`${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`);
  }, []);

  useEffect(() => () => void (copyTimer.current && clearTimeout(copyTimer.current)), []);

  const set = useCallback(
    (key: FieldKey, value: string) => setState((s) => ({ ...s, [key]: value })),
    []
  );

  const mark = useCallback((key: FieldKey, on: boolean) => setFocused(on ? key : null), []);

  const copy = useCallback(async () => {
    const payload = text(state);
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      /* Буфер закрыт политикой или его нет вовсе: тот же текст кладём старым
         способом, через скрытое поле. Молча не падаем: оттиск обязан уехать
         в буфер и на школьном браузере в цеху. */
      const ta = document.createElement('textarea');
      ta.value = payload;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* Совсем никак. Тогда текст остаётся на листе, и его переписывают
           глазами: он для того там и напечатан целиком. */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2600);
  }, [state]);

  /**
   * ОТПРАВКА. Штамп получает время НАЖАТИЯ, а не ответа приёмщика: человек
   * запомнит, когда он написал, а не когда чужой сервер это подтвердил.
   */
  const submit = useCallback(async () => {
    setStage('sending');
    try {
      await send(state);
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      setSentAt(`${p(d.getHours())}:${p(d.getMinutes())}`);
      setStage('sent');
    } catch {
      /* Причину не печатаем. «Приёмщик ответил 502» человеку за бланком не
         говорит ничего и ничем ему не поможет; дорога, которая работает,
         говорит всё. Разбираться с причиной нам, а не ему. */
      setStage('failed');
    }
  }, [state]);

  /** Возврат к чистому бланку. Набранное стирается: лист уехал, начат новый. */
  const again = useCallback(() => {
    setState(EMPTY_BLANK);
    setSentAt('');
    setStage('idle');
  }, []);

  const sheet = lines(state);
  const locked = stage === 'sent';

  /* Оговорка под подвалом: одна строка, четыре повода её сменить. Порядок
     несущий, от самого свежего события к самому общему правилу. */
  const noContact = SEND_MODE === 'auto' && !state.who.trim() && !!state.what.trim();
  const note =
    stage === 'sent'
      ? K_BLANK.sentNote
      : stage === 'failed'
        ? K_BLANK.failNote
        : noContact
          ? K_BLANK.noContact
          : MODE.note;

  return (
    <div className="kb">
      {/* ── ФОРМА: то, что набирают ──────────────────────────────────────── */}
      <div
        className="kb-plate"
        role="group"
        aria-label={K_BLANK.sheetTitle}
        data-locked={locked ? 'true' : undefined}
      >
        {/* Имя идёт первым, потому что с него начинают разговор и в цеху:
            сначала человек называется, и только потом говорит, зачем пришёл. */}
        <Field
          id={`${id}-name`}
          label={K_BLANK.fields.name.label}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
        >
          <input
            id={`${id}-name`}
            type="text"
            autoComplete="name"
            value={state.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={K_BLANK.fields.name.hint}
            disabled={locked}
            className="kb-input"
          />
        </Field>

        {/* Повод вторым: назвавшись, пишущий решает, зачем пишет, и только
            потом что именно. */}
        <Field id={`${id}-kind`} label={K_BLANK.fields.kind.label} asGroup>
          <Chips
            options={KINDS}
            value={state.kind}
            onPick={(v) => set('kind', v)}
            onMark={(on) => mark('kind', on)}
            disabled={locked}
          />
        </Field>

        <Field
          id={`${id}-what`}
          label={K_BLANK.fields.what.label}
          onFocus={() => setFocused('what')}
          onBlur={() => setFocused(null)}
        >
          <textarea
            id={`${id}-what`}
            rows={2}
            value={state.what}
            onChange={(e) => set('what', e.target.value)}
            placeholder={K_BLANK.fields.what.hint}
            disabled={locked}
            className="kb-input kb-area"
          />
        </Field>

        <Field
          id={`${id}-who`}
          label={K_BLANK.fields.who.label}
          onFocus={() => setFocused('who')}
          onBlur={() => setFocused(null)}
          last
        >
          <input
            id={`${id}-who`}
            type="text"
            autoComplete="tel"
            value={state.who}
            onChange={(e) => set('who', e.target.value)}
            placeholder={K_BLANK.fields.who.hint}
            disabled={locked}
            className="kb-input"
          />
        </Field>
      </div>

      {/* ── ОТТИСК: то, что уедет ────────────────────────────────────────── */}
      <div className="kb-sheet ground-paper">
        <div className="kb-sheet-head">
          <span className="t-micro fg-56">{K_BLANK.sheetTitle}</span>
          <span className="t-micro fg-56 tabular-nums">{today}</span>
        </div>

        {/* Живая область: скринридеру незачем перечитывать лист на каждый
            знак, поэтому вежливое объявление здесь выключено намеренно.
            Всё, что на листе написано, человек только что набрал сам. */}
        <div className="kb-sheet-body" aria-hidden>
          {/* Приветствие это и есть повод: нажатый чип переписывает его на
              глазах, и потому строкой списка повод не печатается. */}
          <p className="kb-hello" data-set={focused === 'kind' ? 'true' : undefined}>
            {hello(state)}
          </p>

          <ul className="kb-rows">
            {sheet.map((l) => (
              <li key={l.key} className="kb-row" data-set={focused === l.key ? 'true' : undefined}>
                <span className="t-micro kb-row-label">{l.label}</span>
                <span className="kb-row-value">
                  {l.value ? (
                    <span className="kb-row-text">{l.value}</span>
                  ) : (
                    <span className="kb-row-blank" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ПОДВАЛ. Четыре состояния, у каждого одна строка действия. Высота
            запасена в `.kb-sheet-foot`, и ни одно из них её не меняет. */}
        <div className="kb-sheet-foot">
          {stage === 'sent' ? (
            <>
              <p className="kb-stamp t-micro">
                <span>{K_BLANK.stamp}</span>
                <span className="tabular-nums">{sentAt}</span>
              </p>
              <button type="button" onClick={again} className="kb-copy t-micro link-rule">
                {K_BLANK.again}
              </button>
            </>
          ) : (
            <>
              {/* Упавшая отправка и режим мессенджера приводят к одной и той
                  же ссылке, и это не совпадение: это и есть та дорога, до
                  которой автоотправка опускается. */}
              {SEND_MODE === 'auto' && stage !== 'failed' ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={stage === 'sending'}
                  className="kb-send"
                >
                  {stage === 'sending' ? K_BLANK.sending : MODE.send}
                </button>
              ) : (
                <a href={waHref(state)} target="_blank" rel="noreferrer" className="kb-send">
                  {stage === 'failed' ? K_BLANK.failSend : MODE.send}
                </a>
              )}
              <button type="button" onClick={copy} className="kb-copy t-micro link-rule">
                {copied ? K_BLANK.copied : K_BLANK.copy}
              </button>
            </>
          )}
        </div>

        {/* Оговорка живая: состояние подвала меняется по нажатию, и сказать об
            этом надо вслух, иначе для скринридера не происходит ничего. */}
        <p
          className="kb-note"
          data-tone={stage === 'failed' ? 'fail' : undefined}
          aria-live="polite"
        >
          {note}
        </p>

        {/* СОГЛАСИЕ СТОИТ ВНУТРИ ЛИСТА, А НЕ У НИЖНЕГО РЕЗА ПОЛОСЫ. На
            телефоне форма и лист встают друг под друга, и край §K2 оказывается
            в экране от кнопки: заявление о том, на что человек соглашается
            нажатием, обязано стоять рядом с тем, что он нажимает.

            ПОДВАЛ ПРИ ЭТОМ НЕ ТРОНУТ. Строка лежит СНАРУЖИ `.kb-sheet-foot`,
            за оговоркой, и в запас высоты четырёх состояний не входит: лист
            по-прежнему не имеет права подрасти под пальцем. Стоит она всегда,
            во всех четырёх, включая отштемпелёванное: согласие не перестаёт
            быть данным оттого, что бланк уехал. */}
        <Soglasie className="kb-soglasie" />
      </div>
    </div>
  );
}

/**
 * РЯД ЧИПОВ: несколько слов строкой, из которых одно напечатано. Это ВЫБОР, а
 * не набор. Нажатое второй раз снимается, потому что передумать здесь тоже
 * можно, а отдельную кнопку «сбросить» ради трёх слов заводить незачем.
 *
 * РЯД НА БЛАНКЕ ОДИН, и голос у него голос значения, а не метки: пишущий
 * ищет в ряду чипов то же, что нашёл в строках набора, то есть набор.
 */
function Chips({
  options,
  value,
  onPick,
  onMark,
  disabled,
}: {
  options: readonly string[];
  value: string;
  onPick: (v: string) => void;
  onMark: (on: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="kb-chips" onFocus={() => onMark(true)} onBlur={() => onMark(false)}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          disabled={disabled}
          onClick={() => onPick(value === o ? '' : o)}
          onMouseEnter={() => onMark(true)}
          onMouseLeave={() => onMark(false)}
          className={cn('kb-chip', value === o && 'is-on')}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * ОДНО ПОЛЕ БЛАНКА: метка машинным голосом, набор под ней, волосяная снизу.
 *
 * Метка это `<label>`, а не подпись: у поля без имени нет имени и для
 * скринридера. Ряд чипов именем поля не закрыть, там несколько кнопок, а не
 * одно значение, поэтому такие поля идут группой со своей меткой.
 *
 * ГРУППА НАБРАНА `role="group"`, А НЕ `<fieldset>`, и это не вкусовщина.
 * Имя группе даёт `aria-labelledby`, то есть ровно то же, что давал
 * `<legend>`; отличие в геометрии. Легенда у `<fieldset>` живёт не в потоке
 * содержимого, а в его верхней грани, и браузер оставляет под ней
 * собственную отбивку поверх нашей: метка ряда стояла на тридцать точек
 * выше своего набора, тогда как у полей с набором та же метка стоит на
 * двенадцати. Поле, набранное по чужому ритму, видно сразу.
 */
function Field({
  id,
  label,
  children,
  last,
  asGroup,
  onFocus,
  onBlur,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  last?: boolean;
  asGroup?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  if (asGroup) {
    return (
      <div className={cn('kb-field', !last && 'rule-b')} role="group" aria-labelledby={id}>
        <span id={id} className="t-micro fg-56 kb-label">
          {label}
        </span>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('kb-field', !last && 'rule-b')} onFocus={onFocus} onBlur={onBlur}>
      <label htmlFor={id} className="t-micro fg-56 kb-label">
        {label}
      </label>
      {children}
    </div>
  );
}
