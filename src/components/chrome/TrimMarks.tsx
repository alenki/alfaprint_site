import { cn } from '@/lib/cn';

/**
 * ОБРЕЗНЫЕ МЕТКИ.
 *
 * Ставятся только на три полноформатных блока и нигде больше. Они не
 * текстура: они задают линию реза, и потому блок, уходящий за неё,
 * читается как осознанный вылет, а не как «на всю ширину по умолчанию».
 */
export function TrimMarks({ className }: { className?: string }) {
  const arm = 18;
  const off = 10;
  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden
      fill="none"
      preserveAspectRatio="none"
    >
      <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {/* Левый верх */}
        <line x1="0" y1={off} x2={arm} y2={off} />
        <line x1={off} y1="0" x2={off} y2={arm} />
        {/* Правый верх */}
        <line x1="100%" y1={off} x2={`calc(100% - ${arm}px)`} y2={off} />
        <line x1={`calc(100% - ${off}px)`} y1="0" x2={`calc(100% - ${off}px)`} y2={arm} />
        {/* Левый низ */}
        <line x1="0" y1={`calc(100% - ${off}px)`} x2={arm} y2={`calc(100% - ${off}px)`} />
        <line x1={off} y1="100%" x2={off} y2={`calc(100% - ${arm}px)`} />
        {/* Правый низ */}
        <line
          x1="100%"
          y1={`calc(100% - ${off}px)`}
          x2={`calc(100% - ${arm}px)`}
          y2={`calc(100% - ${off}px)`}
        />
        <line
          x1={`calc(100% - ${off}px)`}
          y1="100%"
          x2={`calc(100% - ${off}px)`}
          y2={`calc(100% - ${arm}px)`}
        />
      </g>
    </svg>
  );
}
