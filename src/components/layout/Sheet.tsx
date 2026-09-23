import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * ФОРМАТ ПОЛОСЫ.
 *
 * У этой страницы нет колонки по центру. Лист это вьюпорт целиком, а край
 * экрана и есть линия реза. Поля ровно два, слева и справа по --edge, и они
 * одинаковые; всё, что шире полей, идёт в вылет до самого края.
 *
 * Отсюда два примитива и больше ни одного:
 *   <Section>   задаёт грунт, номер, усиление ухода;
 *   <Sheet>     задаёт полосу набора: поля и ничего кроме.
 *
 * ШМУЦТИТУЛА БОЛЬШЕ НЕТ. Полоса «§ 02 · ДОПУСК · Заявление · Реестр» стояла
 * над каждым разделом и говорила о листе вместо того, чтобы им быть: номер,
 * который никто не ищет, название, которое через две строки набрано втрое
 * крупнее, и спецификация, которую нельзя проверить. Восемь линеек во весь
 * формат резали лист на восемь карточек, ровно то, что формат «край в край»
 * и заводился отменить. Раздел теперь открывается своим заголовком, а
 * отбивают разделы грунт и воздух.
 */

type Ground = 'paper' | 'ink' | 'rubine';

const GROUND_CLASS: Record<Ground, string> = {
  paper: 'ground-paper',
  ink: 'ground-ink',
  rubine: 'ground-rubine',
};

export function Section({
  id,
  ground,
  gain,
  invert,
  as: Tag = 'section',
  className,
  children,
}: {
  id: string;
  ground: Ground;
  gain: number;
  invert?: boolean;
  as?: 'section' | 'footer';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      data-section-ground={ground}
      {...(invert ? { 'data-invert': 'true' } : null)}
      style={{ ['--gain' as string]: gain }}
      className={cn('relative isolate', GROUND_CLASS[ground], className)}
    >
      {children}
    </Tag>
  );
}

/** Полоса набора: поля по --edge и больше ничего. */
export function Sheet({
  className,
  children,
  as: Tag = 'div',
}: {
  className?: string;
  children: ReactNode;
  as?: 'div' | 'header' | 'nav';
}) {
  return <Tag className={cn('sheet relative z-1', className)}>{children}</Tag>;
}

/** Двенадцать колонок внутри полосы. На телефоне четыре. */
export function Grid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid12', className)}>{children}</div>;
}
