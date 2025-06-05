"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

const _JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });
const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const GdprPage = () => {
  return (
    <main className="flex min-h-screen relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[60vh] h-[60vh] rounded-full bg-white/5 blur-[100px] -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40vh] h-[40vh] rounded-full bg-white/5 blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black via-black/90 to-transparent z-10"></div>

      <Navbar logoHref="/vote" />

      <div className="w-full mx-auto px-6 md:px-12 py-28 z-10 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-5xl md:text-7xl font-bold mb-10 ${_SpaceGrotesk.className} tracking-tight`}
          >
            Polityka Prywatności
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="space-y-8 text-white/80">
              <section className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                <h2
                  className={`text-2xl font-semibold mb-4 text-white ${_SpaceGrotesk.className}`}
                >
                  1. Wprowadzenie
                </h2>
                <p>
                  Niniejsza Polityka Prywatności reguluje zasady przetwarzania i
                  ochrony danych osobowych Użytkowników platformy głosowania
                  Radiowęzła Zespołu Szkół Technicznych i Ogólnokształcących
                  (ZSTiO). System został zaprojektowany z myślą o minimalizacji
                  gromadzonych danych i zapewnieniu ich bezpieczeństwa zgodnie z
                  obowiązującymi standardami ochrony prywatności.
                </p>
              </section>

              <section className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                <h2
                  className={`text-2xl font-semibold mb-4 text-white ${_SpaceGrotesk.className}`}
                >
                  2. Gromadzone Dane
                </h2>
                <p className="text-white/90">
                  Platforma wykorzystuje mechanizm fingerprintingu urządzenia w
                  celu zapewnienia integralności głosowania i prewencji nadużyć.
                  Nie są gromadzone dane osobowe pozwalające na bezpośrednią
                  identyfikację Użytkownika.
                </p>
                <p className="mt-4">
                  Generowany jest unikalny identyfikator (hash SHA256) na
                  podstawie Państwa adresu IP oraz ciągu User-Agent
                  przeglądarki:
                </p>
                <pre className="mt-2 p-3 bg-black/30 border border-white/20 rounded-md text-sm overflow-x-auto">
                  <code className={`${_JetBrainsMono.className} text-white/80`}>
                    SHA256( IP_Address + ":" + User_Agent )
                  </code>
                </pre>
                <p className="mt-4">
                  Cel przetwarzania tego identyfikatora jest ściśle techniczny:
                  umożliwienie Użytkownikowi oddania głosu oraz zapobieganie
                  manipulacjom wyników poprzez wielokrotne głosowanie z tego
                  samego urządzenia.
                </p>
              </section>

              <section className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                <h2
                  className={`text-2xl font-semibold mb-4 text-white ${_SpaceGrotesk.className}`}
                >
                  3. Okres Przechowywania Danych
                </h2>
                <p>
                  Unikalny identyfikator (fingerprint) Państwa urządzenia jest
                  przechowywany przez okres nieprzekraczający 3 miesięcy od daty
                  ostatniej aktywności w systemie (np. oddania głosu). Po tym
                  czasie dane są permanentnie usuwane.
                </p>
              </section>

              <section className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                <h2
                  className={`text-2xl font-semibold mb-4 text-white ${_SpaceGrotesk.className}`}
                >
                  4. Prawa Użytkowników
                </h2>
                <p>
                  Zgodnie z Ogólnym Rozporządzeniem o Ochronie Danych (RODO),
                  przysługują Państwu następujące prawa:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Prawo dostępu do informacji o przetwarzanych danych.</li>
                  <li>Prawo do sprostowania (poprawienia) danych.</li>
                  <li>
                    Prawo do usunięcia danych ("prawo do bycia zapomnianym").
                  </li>
                  <li>Prawo do przenoszenia danych.</li>
                </ul>
                <p className="mt-4">
                  Należy jednak pamiętać, że ze względu na pseudonimizowany
                  charakter zbieranych danych (fingerprint), bezpośrednia
                  identyfikacja Użytkownika jest niemożliwa bez dodatkowych
                  informacji. Może to wpłynąć na techniczną możliwość realizacji
                  niektórych praw.
                </p>
              </section>

              <section className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                <h2
                  className={`text-2xl font-semibold mb-4 text-white ${_SpaceGrotesk.className}`}
                >
                  5. Kontakt
                </h2>
                <p>
                  W przypadku pytań dotyczących niniejszej Polityki Prywatności,
                  przetwarzania danych osobowych lub w celu realizacji
                  przysługujących Państwu praw, prosimy o kontakt z deweloperem
                  platformy. Preferowaną formą kontaktu jest wiadomość prywatna
                  za pośrednictwem serwisu Instagram, skierowana na profil
                  <a
                    href="https://www.instagram.com/lmq4wb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white underline mx-1"
                  >
                    @lmq4wb
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer
        link={{ href: "/vote", text: "Powrót", subtext: "/vote" }}
      />
    </main>
  );
};

export default GdprPage;
