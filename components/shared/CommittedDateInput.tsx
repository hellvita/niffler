'use client';
import { useRef, useEffect, type InputHTMLAttributes } from 'react';
import { DateInput } from './DateInput';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  onCommit: (date: string) => void;
};

export function CommittedDateInput({ onCommit, onKeyDown, onBlur, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleChange = () => {
      if (el.value && !isTypingRef.current) {
        onCommitRef.current(el.value);
      }
    };
    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
  }, []);

  return (
    <DateInput
      ref={inputRef}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== 'Escape') isTypingRef.current = true;
        if (e.key === 'Enter' && e.currentTarget.value) {
          onCommitRef.current(e.currentTarget.value);
        }
        onKeyDown?.(e);
      }}
      onBlur={(e) => {
        if (e.currentTarget.value && isTypingRef.current) {
          onCommitRef.current(e.currentTarget.value);
        }
        isTypingRef.current = false;
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
