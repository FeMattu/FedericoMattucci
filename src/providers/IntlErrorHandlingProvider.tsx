'use client';

import { NextIntlClientProvider, IntlError, IntlErrorCode } from 'next-intl';
import { ReactNode } from 'react';

export default function IntlErrorHandlingProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      onError={(error: IntlError) => {
        // Silenzia alcuni errori comuni in produzione
        const ignoredCodes = [IntlErrorCode.INSUFFICIENT_PATH];

        if (process.env.NODE_ENV === 'development' && !ignoredCodes.includes(error.code)) {
          console.warn('Translation error:', error.message);
        }
      }}
      getMessageFallback={({ key }) => {
        const fallbackKey = `${key}.default`;
        if (key.endsWith('.default')) return key;   // evita loop
        return fallbackKey;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}

