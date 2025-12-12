import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from '../../i18n';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming locale is valid
  const currentLocale = locale || defaultLocale;
  const validLocale = locales.includes(currentLocale as any) ? currentLocale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default
  };
});
