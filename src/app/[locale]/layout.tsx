import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import "./globals.css";

export const metadata: Metadata = {
  title: "imeliq - Natural Energy Drink",
  description: "100% natural energy drink - healthy energy without chemicals",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Enable static rendering by setting the locale
  setRequestLocale(locale);

  const messages = await getMessages({locale});

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
