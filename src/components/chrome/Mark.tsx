import { cn } from '@/lib/cn';

/**
 * ЗНАК «АЛЬФА» и одновременно индикатор сведения форм.
 *
 * Буква А это форма K, стоит намертво. Галочка это форма R, участвует в общем
 * законе с ослабленным усилением: при разгоне прокрутки правая диагональ
 * физически сползает и садится на место при остановке. Это единственный
 * элемент интерфейса, который работает все 100 % времени.
 *
 * Галочка здесь не украшение: макет утверждают галочкой, и знак агентства
 * и есть отметка «принято, в печать».
 */
export function Mark({
  className,
  gain = 0.35,
  title,
}: {
  className?: string;
  gain?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={cn('overflow-visible', className)}
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ ['--gain' as string]: gain }}
    >
      {title ? <title>{title}</title> : null}

      {/* Форма K это буква. Сплошная, с двумя просветами. */}
      <path
        className="plate-k"
        fill="currentColor"
        fillRule="evenodd"
        d="M50 8 L96 92 L4 92 Z
           M50 42 L63 66 L37 66 Z
           M31 78 L69 78 L76 92 L24 92 Z"
      />

      {/* Форма R это галочка. Единственная краска. */}
      <path
        className="plate-r"
        d="M27 54 L52 81 L114 8"
        stroke="var(--color-rubine)"
        strokeWidth="16"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Галочка сама по себе это знак «готово». Рисуется по stroke-dashoffset там,
 * где нужно показать сам момент утверждения.
 */
export function Tick({
  className,
  strokeWidth = 2,
  drawn = true,
}: {
  className?: string;
  strokeWidth?: number;
  drawn?: boolean;
}) {
  const LEN = 30;
  return (
    <svg viewBox="0 0 24 22" className={className} fill="none" aria-hidden>
      <path
        d="M2 11.5 L8.5 19.5 L22 1.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        pathLength={LEN}
        strokeDasharray={LEN}
        strokeDashoffset={drawn ? 0 : LEN}
        style={{ transition: 'stroke-dashoffset 620ms var(--ease-land)' }}
      />
    </svg>
  );
}

/**
 * Приводочный крест это цель, по которой совмещают краски.
 * Стоит ровно в двух местах на сайте: в знаке и на плане города.
 */
export function RegistrationMark({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1" />
      <path d="M12 0v6.5M12 17.5V24M0 12h6.5M17.5 12H24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
