import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">imeliq</h1>
          <p className="text-2xl mb-4">100% Looduslik Energiajook</p>
          <p className="text-lg opacity-90 mb-8">
            Tervislik energia ilma kemikaalideta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Registreeru katsetajaks
            </Link>
            <Link
              href="/feedback"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Anna tagasisidet
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Miks imeliq?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Looduslik</h3>
              <p className="text-gray-600">
                Mitte ühtegi kemikaali. Ainult looduslikud koostisosad.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tervislik Energia</h3>
              <p className="text-gray-600">
                Loomulik energiatõus ilma kõrvalmõjudeta.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Testitud ja Heaks Kiidetud</h3>
              <p className="text-gray-600">
                Katsetajate positiivne tagasiside räägib iseenda eest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Kuidas proovida?
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Registreeru katsetajaks</h3>
                <p className="text-gray-600">
                  Sisesta oma andmed ja saad võimaluse jooki proovida.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Proovi jooki</h3>
                <p className="text-gray-600">
                  Joo <strong>täpselt 150ml</strong> siis kui oled väsinud ja vajad energiat.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Anna tagasisidet</h3>
                <p className="text-gray-600">
                  Täida lühike ankeet ja jaga oma kogemust meiega.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Telli veel</h3>
                <p className="text-gray-600">
                  Kui meeldis, saad tellida juurde <strong>alates 1€/tk</strong>!
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
            Valmis proovima?
          </h2>
          <p className="text-gray-600 mb-8">
            Liitu meie katsetajate kogukonnaga ja avasta looduslik energia.
          </p>
          <Link
            href="/register"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Registreeru katsetajaks
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} imeliq. Kõik õigused kaitstud.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Kontakt: martin@kunnap.ee | +372 508 9040
          </p>
        </div>
      </footer>
    </main>
  )
}
