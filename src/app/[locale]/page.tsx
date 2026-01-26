'use client';

import Link from 'next/link'
import Image from 'next/image'
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
    <div className="absolute top-4 right-4 flex gap-2 z-20">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            currentLocale === lang.code
              ? 'bg-white text-teal-600 font-semibold shadow-md'
              : 'bg-teal-600/80 text-white hover:bg-teal-500'
          }`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Stylized IMELIQ logo component
function ImeliqLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-wider ${className}`}>
      IM<span className="inline-block" style={{ transform: 'scaleX(1.2)' }}>=</span>LIQ
    </span>
  );
}

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero */}
      <section className="relative text-gray-800 py-16 px-4">
        <LanguageSwitcher />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-6xl lg:text-7xl font-bold mb-4 text-teal-600">
                <ImeliqLogo />
              </h1>
              <p className="text-2xl lg:text-3xl font-light text-gray-600 mb-4 tracking-wide">
                {t('hero.subtitle')}
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-teal-600 font-medium mb-8">
                <span>{t('features.vitality')}</span>
                <span className="text-teal-400">•</span>
                <span>{t('features.focus')}</span>
                <span className="text-teal-400">•</span>
                <span>{t('features.repair')}</span>
              </div>
              <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto lg:mx-0">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href={`/${locale}/register`}
                  className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t('hero.register')}
                </Link>
                <Link
                  href={`/${locale}/feedback`}
                  className="border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition-all"
                >
                  {t('hero.feedback')}
                </Link>
              </div>
            </div>

            {/* Can image */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -left-8 w-24 h-24 bg-teal-200 rounded-full opacity-40"></div>
                {/* Leaf decoration */}
                <div className="absolute -bottom-2 right-0 text-5xl opacity-70">🌿</div>
                <Image
                  src="/imeliq-can.png"
                  alt="IMELIQ Healing Energy Drink"
                  width={300}
                  height={450}
                  className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-teal-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-teal-700">{t('features.natural.title')}</h3>
              <p className="text-gray-600">
                {t('features.natural.description')}
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-teal-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-teal-700">{t('features.energy.title')}</h3>
              <p className="text-gray-600">
                {t('features.energy.description')}
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-teal-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-teal-700">{t('features.tested.title')}</h3>
              <p className="text-gray-600">
                {t('features.tested.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('howto.title')}
          </h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                  {step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {t(`howto.step${step}.title`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`howto.step${step}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-12 text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-teal-100 mb-8 text-lg">
              {t('cta.description')}
            </p>
            <Link
              href={`/${locale}/register`}
              className="inline-block bg-white text-teal-600 px-10 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t('hero.register')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4 text-teal-400">
            <ImeliqLogo />
          </div>
          <p className="text-gray-400 text-sm">
            Healing Energy Drink
          </p>
          <p className="text-gray-500 text-sm mt-4">
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
