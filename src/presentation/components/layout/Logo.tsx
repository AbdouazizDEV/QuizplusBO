import { cn } from '@shared/lib/cn';

interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function Logo({ size = 36, withText = true, className }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="quizz-gradient inline-flex items-center justify-center rounded-xl text-white font-black shadow-glow"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        Q+
      </span>
      {withText ? (
        <span className="flex flex-col leading-none">
          <span className="text-base font-black text-foreground tracking-tight">Quizz+</span>
          <span className="text-2xs font-bold uppercase tracking-[0.18em] text-muted">
            Backoffice
          </span>
        </span>
      ) : null}
    </div>
  );
}
