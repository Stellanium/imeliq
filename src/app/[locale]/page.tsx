'use client';

import Link from 'next/link'
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useParams } from 'next/navigation';

const languages = [
  { code: 'et', name: 'Eesti' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'sv', name: 'Svenska' },
  { code: 'fi', name: 'Suomi' },
];

function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1] || 'et';

  const switchLanguage = (locale: string) => {
    const segments = pathname.split('/');
    if (languages.some(l => l.code === segments[1])) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    router.push(segments.join('/') || '/');
  };

  return (
    <div className="absolute top-4 right-4 flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded text-sm ${
            currentLocale === lang.code
              ? 'bg-white text-green-700 font-semibold'
              : 'bg-green-700 text-white hover:bg-green-600'
          }`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4">
        <LanguageSwitcher />
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{t('hero.title')}</h1>
          <p className="text-2xl mb-4">{t('hero.subtitle')}</p>
          <p className="text-lg opacity-90 mb-8">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/register`}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              {t('hero.register')}
            </Link>
            <Link
              href={`/${locale}/feedback`}
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              {t('hero.feedback')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.natural.title')}</h3>
              <p className="text-gray-600">
                {t('features.natural.description')}
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.energy.title')}</h3>
              <p className="text-gray-600">
                {t('features.energy.description')}
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.tested.title')}</h3>
              <p className="text-gray-600">
                {t('features.tested.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('howto.title')}
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{t('howto.step1.title')}</h3>
                <p className="text-gray-600">
                  {t('howto.step1.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{t('howto.step2.title')}</h3>
                <p className="text-gray-600">
                  {t('howto.step2.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{t('howto.step3.title')}</h3>
                <p className="text-gray-600">
                  {t('howto.step3.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{t('howto.step4.title')}</h3>
                <p className="text-gray-600">
                  {t('howto.step4.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            {t('cta.title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('cta.description')}
          </p>
          <Link
            href={`/${locale}/register`}
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {t('hero.register')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} imeliq. {t('footer.rights')}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t('footer.contact')}: martin@kunnap.ee | +372 508 9040
          </p>
        </div>
      </footer>
    </main>
  )
}
