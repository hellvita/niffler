import { cookies } from 'next/headers';
import { InitialBudgetForm } from '@/components/settings/InitialBudgetForm';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { LimitManager } from '@/components/settings/LimitManager';
import { ColumnPreferencesForm } from '@/components/settings/ColumnPreferencesForm';
import { DeleteAccountSection } from '@/components/settings/DeleteAccountSection';
import { ExportAllSection } from '@/components/settings/ExportAllSection';

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        {heading}
      </h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get('user_email');
  const email = emailCookie ? decodeURIComponent(emailCookie.value) : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-10">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Settings</h1>

      <Section heading="Account">
        <p className="text-sm text-[var(--color-text-primary)]">
          {email || <span className="text-[var(--color-text-muted)]">—</span>}
        </p>
      </Section>

      <Section heading="Opening balance">
        <InitialBudgetForm />
      </Section>

      <Section heading="Categories">
        <CategoryManager />
      </Section>

      <Section heading="Daily spending limit">
        <LimitManager />
      </Section>

      <Section heading="Analytics columns">
        <ColumnPreferencesForm />
      </Section>

      <Section heading="Data">
        <ExportAllSection />
      </Section>

      <Section heading="Danger zone">
        <DeleteAccountSection />
      </Section>
    </div>
  );
}
