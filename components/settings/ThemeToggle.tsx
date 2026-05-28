'use client';
import { useTheme } from '@/lib/hooks/useTheme';
import { Button } from '@/components/shared/Button';
import { SunIcon, MoonIcon } from '@/components/shared/icons';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </Button>
      <span className="text-sm text-[var(--color-text-secondary)]">
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}
