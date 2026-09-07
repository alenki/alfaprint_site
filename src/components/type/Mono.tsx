import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * МАШИННЫЙ ГОЛОС. Всегда прописными, всегда табличными цифрами.
 * Ни одного предложения длиннее восьми слов.
 *
 * Правило системы: рубиновый текст ВСЕГДА моноширинный, и дисплейный набор
 * НИКОГДА не бывает рубиновым. Цветоделение здесь ещё и разделение голосов.
 */
export function Mono({
  children,
  size = 'label',
  className,
  as: Tag = 'span',
}: {
  children: ReactNode;
  size?: 'label' | 'mono' | 'micro';
  className?: string;
  as?: 'span' | 'div' | 'p' | 'dt' | 'dd' | 'li';
}) {
  return <Tag className={cn(`t-${size}`, className)}>{children}</Tag>;
}
