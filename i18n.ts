export const locales = ['et', 'en', 'es', 'sv', 'fi'] as const;
export const defaultLocale = 'et' as const;
export type Locale = (typeof locales)[number];
