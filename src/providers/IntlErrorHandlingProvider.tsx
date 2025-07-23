'use client';

import { NextIntlClientProvider, IntlError, IntlErrorCode } from 'next-intl';
import { ReactNode } from 'react';

export default function IntlErrorHandlingProvider({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: string;
  messages: any;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error: IntlError) => {
        // Silenzia alcuni errori comuni in produzione
        const ignoredCodes = [IntlErrorCode.INSUFFICIENT_PATH];

        if (process.env.NODE_ENV === 'development' && !ignoredCodes.includes(error.code)) {
          console.warn('Translation error:', error.message);
        }
      }}
      getMessageFallback={({ key }) => {
        const fallbackKey = `${key}.default`;

        // Controllo sullo schema dell’oggetto messages
        const base = key.split('.')[0];
        if (messages?.[base]?.default) {
          return fallbackKey;
        }

        return key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
