interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div className={`rounded-lg bg-[var(--color-bg-secondary)] animate-pulse ${className ?? ''}`} />
  );
}
