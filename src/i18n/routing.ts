import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['et', 'en', 'es', 'sv', 'fi'],
  defaultLocale: 'et',
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
