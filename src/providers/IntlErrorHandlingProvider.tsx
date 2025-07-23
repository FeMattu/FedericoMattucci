'use client';
 
import {NextIntlClientProvider} from 'next-intl';
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
            onError={(error) => console.warn("Translation error:", error)}
            getMessageFallback={({ key }) => {
                // Prova prima con .default
                const fallbackKey = `${key}.default`;
                if (messages && messages[fallbackKey.split('.')[0]]) {
                    return fallbackKey;
                }
                return key;
            }}
        >
            {children}
        </NextIntlClientProvider>
    );
}