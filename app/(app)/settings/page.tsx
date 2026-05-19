'use client';
import { useState, useEffect } from 'react';
import { InitialBudgetForm } from '@/components/settings/InitialBudgetForm';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { LimitManager } from '@/components/settings/LimitManager';
import { ColumnPreferencesForm } from '@/components/settings/ColumnPreferencesForm';
import { DeleteAccountSection } from '@/components/settings/DeleteAccountSection';
import { ExportAllSection } from '@/components/settings/ExportAllSection';

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {heading}
      </h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)user_email=([^;]*)/);
    if (match) setEmail(decodeURIComponent(match[1]));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>

      <Section heading="Account">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {email || <span className="text-zinc-400 dark:text-zinc-500">—</span>}
        </p>
      </Section>

      <Section heading="Initial budget">
        <InitialBudgetForm />
      </Section>

      <Section heading="Categories">
        <CategoryManager />
      </Section>

      <Section heading="Daily limit">
        <LimitManager />
      </Section>

      <Section heading="Column display">
        <ColumnPreferencesForm />
      </Section>

      <Section heading="Export data">
        <ExportAllSection />
      </Section>

      <Section heading="Advanced">
        <DeleteAccountSection />
      </Section>
    </div>
  );
}
