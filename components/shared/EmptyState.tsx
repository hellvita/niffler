import { Button } from './Button';

interface Props {
  message: string;
  className?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ message, className, action }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-8 text-[var(--color-text-secondary)] ${className ?? ''}`}
    >
      <p className="text-sm">{message}</p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
