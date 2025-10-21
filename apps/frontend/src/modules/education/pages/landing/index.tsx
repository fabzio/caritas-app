import CoverImage from '@frontend/assets/img/landing/cover.png'
import CaritasLogo from '@frontend/assets/img/landing/logo.png'
import FullColorCaritasLogo from '@frontend/assets/img/landing/logo-fullcolor.png'
import PUCPLogo from '@frontend/assets/img/landing/pucp.png'
import UNILogo from '@frontend/assets/img/landing/uni.png'
import UNMSMLogo from '@frontend/assets/img/landing/unmsm.png'
import USATLogo from '@frontend/assets/img/landing/usat.png'
import UTPLogo from '@frontend/assets/img/landing/utp.png'
import { useNavigate } from '@tanstack/react-router'
import { GraduationCap, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const originalPageReferences = {
  nosotros: 'https://caritaslima.org.pe/quienes-somos/',
  queHacemos: 'https://caritaslima.org.pe/que-hacemos/',
  quePuedesHacerTu: 'https://caritaslima.org.pe/que-puedes-hacer-tu/',
  transparencia: 'https://caritaslima.org.pe/transparencia/',
  contacto: 'https://caritaslima.org.pe/contacto/',
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img
                src={FullColorCaritasLogo}
                alt="Cáritas lima"
                className="h-12"
              />
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <a
                href={originalPageReferences.nosotros}
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Nosotros
              </a>
              <a
                href={originalPageReferences.queHacemos}
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Qué Hacemos
              </a>
              <a
                href={originalPageReferences.quePuedesHacerTu}
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Qué Puedes Hacer Tú
              </a>
              <a
                href={originalPageReferences.transparencia}
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Transparencia
              </a>
              <a
                href={originalPageReferences.contacto}
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Contacto
              </a>
            </div>

            <button
              type="button"
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Menu</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a
                  href={originalPageReferences.nosotros}
                  className="text-gray-700 hover:text-green-600 font-medium transition px-4"
                >
                  Nosotros
                </a>
                <a
                  href={originalPageReferences.queHacemos}
                  className="text-gray-700 hover:text-green-600 font-medium transition px-4"
                >
                  Qué Hacemos
                </a>
                <a
                  href={originalPageReferences.quePuedesHacerTu}
                  className="text-gray-700 hover:text-green-600 font-medium transition px-4"
                >
                  Qué Puedes Hacer Tú
                </a>
                <a
                  href={originalPageReferences.transparencia}
                  className="text-gray-700 hover:text-green-600 font-medium transition px-4"
                >
                  Transparencia
                </a>
                <a
                  href={originalPageReferences.contacto}
                  className="text-gray-700 hover:text-green-600 font-medium transition px-4"
                >
                  Contacto
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70">
          <img
            src={CoverImage}
            alt="Estudiantes en clase"
            className="w-full h-full object-cover blur-[2px] opacity-60"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tu oportunidad educativa empieza aquí
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
              Explora y mantente atento de nuestras ferias educativas, programa
              de becas y servicios de orientación vocacional.
            </p>
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
              onClick={() => navigate({ to: '/landing/apply' })}
            >
              Regístrate ahora
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-30">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/5 lg:sticky lg:top-96 lg:self-start">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Nuestros líneas de educación
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Cada una de las líneas presentes son actividades que realizamos
                en Cáritas Lima, interviniendo en educación y conocimientos con
                nuevos objetivos y competencias para que puedas alcanzar tus
                metas académicas e inicies tu futuro exitoso.
              </p>
            </div>

            <div className="lg:w-3/5 space-y-6">
              <div className="bg-green-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="w-16 h-16 mb-6">
                  <div className="w-full h-full border-4 border-white rounded-full flex items-center justify-center">
                    <span className="text-3xl">$</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Becas para estudiantes
                </h3>
                <p className="text-green-50 mb-6 leading-relaxed">
                  proveermos acceso a becas parciales o completas a través de
                  nuestros convenios estratégicos con universidades e
                  institutos. Te brindamos información las mejores oportunidades
                  de financiamiento que se alinean con tus objetivos
                  profesionales y posibilidades.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/landing/apply' })}
                  className="inline-flex items-center font-semibold hover:underline"
                >
                  Regístrese →
                </button>
              </div>

              <div className="bg-green-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="w-16 h-16 mb-6">
                  <GraduationCap className="w-full h-full" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Ferias de Orientación Vocacional
                </h3>
                <p className="text-green-50 mb-6 leading-relaxed">
                  Organizamos encuentros educativos estratégicos donde
                  conectamos directamente a estudiantes con instituciones y
                  universidades. Nuestras ferias son un espacios parroquiales
                  donde podrás conocer opciones de carreras académicas y obtener
                  información de estas.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/landing/apply' })}
                  className="inline-flex items-center font-semibold hover:underline"
                >
                  Regístrese →
                </button>
              </div>

              <div className="bg-green-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="w-16 h-16 mb-6">
                  <TrendingUp className="w-full h-full" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Orientación vocacional
                </h3>
                <p className="text-green-50 mb-6 leading-relaxed">
                  Organizamos campañas donde evaluamos a los estudiantes por
                  medio de exámenes para que les ayude en el proceso de
                  encontrar su verdadera potenciar y tomar decisiones informadas
                  sobre su futuro profesional.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/landing/apply' })}
                  className="inline-flex items-center font-semibold hover:underline"
                >
                  Regístrese →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-500 py-16">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Nuestro Impacto Hasta Hoy
              </h2>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                +500
              </div>
              <div className="text-white text-lg">Becas otorgadas</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                +35
              </div>
              <div className="text-white text-lg">
                Ferias de orientación vocacional
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                +2500
              </div>
              <div className="text-white text-lg">Jóvenes orientados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-30">
        <div className="max-w-7xl mx-auto px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-16">
            Trabajamos junto a
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 items-center justify-items-center">
            <div className="w-full max-w-[200px]">
              <img
                src={UTPLogo}
                alt="UTP"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-full max-w-[200px]">
              <img
                src={USATLogo}
                alt="USAT"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-full max-w-[200px]">
              <img
                src={PUCPLogo}
                alt="PUCP"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-full max-w-[200px]">
              <img
                src={UNILogo}
                alt="UNI"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-full max-w-[200px] md:col-start-2">
              <img
                src={UNMSMLogo}
                alt="UNMSM"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src={CaritasLogo} alt="Cáritas Lima" className="h-10" />
              </div>
              <p className="text-gray-400 text-sm">
                Cáritas Lima © 2023.
                <br />
                All Rights Reserved
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Contactos</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>Cáritas Lima</li>
                <li>Jr. Chancay N°282</li>
                <li>Cercado de Lima, Lima, Perú</li>
                <li>Email: info@caritaslima.org.pe</li>
                <li>Casos sociales: (01)2037711</li>
                <li>Donaciones: (01)2037710</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Navegación</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>
                  <a
                    href={originalPageReferences.nosotros}
                    className="hover:text-white transition"
                  >
                    Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.queHacemos}
                    className="hover:text-white transition"
                  >
                    Qué Hacemos
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.quePuedesHacerTu}
                    className="hover:text-white transition"
                  >
                    Qué Puedes Hacer Tú
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.transparencia}
                    className="hover:text-white transition"
                  >
                    Transparencia
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.contacto}
                    className="hover:text-white transition"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Transparencia</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>
                  <a
                    href={originalPageReferences.transparencia}
                    className="hover:text-white transition"
                  >
                    Información General
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.transparencia}
                    className="hover:text-white transition"
                  >
                    Información Financiera
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.transparencia}
                    className="hover:text-white transition"
                  >
                    Información De Salvaguarda
                  </a>
                </li>
                <li>
                  <a
                    href={originalPageReferences.transparencia}
                    className="hover:text-white transition"
                  >
                    A Donde Van Tus Donaciones
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
