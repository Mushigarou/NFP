import { routing } from '@/src/i18n/routing';
import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import QueryClientProviderWrapper from '@/components/query-client-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fullstack Boilerplate App',
  description: 'Frontend, FastAPI and PSQL boilerplate full stack app',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html>
      <body>
        <QueryClientProviderWrapper>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
