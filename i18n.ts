export const locales = ['et', 'en', 'es', 'sv', 'fi'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
