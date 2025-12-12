import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files (e.g. /favicon.ico)
    // - _next folder
    '/((?!api|_next|.*\\..*).*)'
  ]
};
