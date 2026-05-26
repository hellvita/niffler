interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, required, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs text-[var(--color-text-secondary)]">
        {label}
        {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
    </div>
  );
}
