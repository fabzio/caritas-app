import CoverImage from '@frontend/assets/img/landing/cover.webp'
import CaritasLogo from '@frontend/assets/img/landing/logo.webp'
import FullColorCaritasLogo from '@frontend/assets/img/landing/logo-fullcolor.webp'
import PUCPLogo from '@frontend/assets/img/landing/pucp.webp'
import UNILogo from '@frontend/assets/img/landing/uni.webp'
import UNMSMLogo from '@frontend/assets/img/landing/unmsm.webp'
import USATLogo from '@frontend/assets/img/landing/usat.webp'
import UTPLogo from '@frontend/assets/img/landing/utp.webp'
import { formatDate } from '@frontend/shared/utils/format-date'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import type { MutableRefObject } from 'react'
import { useRef, useState } from 'react'
import {
  type LandingFair,
  type LandingScholarship,
  useLandingOpportunities,
} from './hooks/use-landing-opportunities'

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
  const { fairs, scholarships } = useLandingOpportunities()
  const fairsCarouselRef = useRef<HTMLDivElement>(null)
  const scholarshipsCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (
    ref: MutableRefObject<HTMLDivElement | null>,
    direction: 'left' | 'right',
  ) => {
    if (!ref.current) return
    const container = ref.current
    const scrollAmount = container.clientWidth * 0.8
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const renderFairItems = () => {
    if (fairs.isLoading) {
      return createSkeletonCards('fair')
    }

    if (fairs.isError) {
      return [
        <OpportunityMessageCard
          key="fair-error"
          tone="error"
          message={
            fairs.error?.message ??
            'No se pudieron cargar las ferias. Intenta nuevamente.'
          }
        />,
      ]
    }

    if (!fairs.items.length) {
      return [
        <OpportunityMessageCard
          key="fair-empty"
          message="Muy pronto anunciaremos nuevas ferias vocacionales."
        />,
      ]
    }

    return fairs.items.map((fair) => <FairCard key={fair.id} fair={fair} />)
  }

  const renderScholarshipItems = () => {
    if (scholarships.isLoading) {
      return createSkeletonCards('scholarship')
    }

    if (scholarships.isError) {
      return [
        <OpportunityMessageCard
          key="scholarship-error"
          tone="error"
          message={
            scholarships.error?.message ??
            'No se pudieron cargar las becas. Intenta nuevamente.'
          }
        />,
      ]
    }

    if (!scholarships.items.length) {
      return [
        <OpportunityMessageCard
          key="scholarship-empty"
          message="Actualmente no hay becas abiertas, vuelve pronto."
        />,
      ]
    }

    return scholarships.items.map((scholarship) => (
      <ScholarshipCard
        key={scholarship.id}
        scholarship={scholarship}
        onApply={() => navigate({ to: '/landing/apply' })}
      />
    ))
  }

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
                <a href="#becas-abiertas">
                  <button
                    type="button"
                    className="inline-flex items-center font-semibold hover:underline"
                  >
                    Postule →
                  </button>
                </a>
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
                  universidades. Nuestras ferias son espacios parroquiales donde
                  podrás conocer opciones de carreras académicas y obtener
                  información de estas.
                </p>
                <a href="#ferias-vocacionales-en-agenda">
                  <button
                    type="button"
                    className="inline-flex items-center font-semibold hover:underline"
                  >
                    Ver próximas →
                  </button>
                </a>
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

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
          <div className="space-y-3">
            <p className="text-green-600 font-semibold uppercase text-sm tracking-wide">
              Próximas oportunidades
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Ferias y becas para acompañar tu decisión
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Descubre las actividades que estamos preparando para que conozcas
              nuevas carreras y postules a becas activas junto a nuestras
              organizaciones aliadas.
            </p>
          </div>

          <div className="space-y-16">
            <div id="becas-abiertas" className="scroll-mt-24">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Becas abiertas para postular
                  </h3>
                  <p className="text-gray-500">
                    Postula en línea a las becas activas y da el siguiente paso
                    hacia tus metas académicas.
                  </p>
                </div>
                {scholarships.items.length > 1 &&
                  !scholarships.isLoading &&
                  !scholarships.isError && (
                    <CarouselControls
                      onPrev={() =>
                        scrollCarousel(scholarshipsCarouselRef, 'left')
                      }
                      onNext={() =>
                        scrollCarousel(scholarshipsCarouselRef, 'right')
                      }
                    />
                  )}
              </div>
              <ul
                ref={scholarshipsCarouselRef}
                className="mt-8 flex list-none gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                aria-label="Listado de becas disponibles"
              >
                {renderScholarshipItems()}
              </ul>
            </div>

            <div id="ferias-vocacionales-en-agenda" className="scroll-mt-24">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Ferias vocacionales en agenda
                  </h3>
                  <p className="text-gray-500">
                    Participa en los próximos encuentros presenciales para
                    resolver tus dudas y conocer nuevas opciones de estudio.
                  </p>
                </div>
                {fairs.items.length > 1 &&
                  !fairs.isLoading &&
                  !fairs.isError && (
                    <CarouselControls
                      onPrev={() => scrollCarousel(fairsCarouselRef, 'left')}
                      onNext={() => scrollCarousel(fairsCarouselRef, 'right')}
                    />
                  )}
              </div>
              <ul
                ref={fairsCarouselRef}
                className="mt-8 flex list-none gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                aria-label="Listado de ferias vocacionales"
              >
                {renderFairItems()}
              </ul>
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

const FAIR_STATUS_LABEL: Record<LandingFair['status'], string> = {
  upcoming: 'Próxima',
  ongoing: 'En curso',
  finished: 'Finalizada',
}

const FAIR_STATUS_STYLES: Record<LandingFair['status'], string> = {
  upcoming: 'bg-amber-50 text-amber-800 border-amber-200',
  ongoing: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  finished: 'bg-slate-50 text-slate-600 border-slate-200',
}

const SKELETON_KEYS = ['uno', 'dos', 'tres', 'cuatro', 'cinco'] as const

function createSkeletonCards(prefix: string, count = 3) {
  return SKELETON_KEYS.slice(0, count).map((seed) => (
    <OpportunitySkeletonCard key={`${prefix}-skeleton-${seed}`} />
  ))
}

function CarouselControls({
  onPrev,
  onNext,
}: {
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Ver tarjetas anteriores"
        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Ver siguientes tarjetas"
        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function OpportunityMessageCard({
  message,
  tone = 'info',
}: {
  message: string
  tone?: 'info' | 'error'
}) {
  const color =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-gray-200 bg-gray-50 text-gray-600'
  return (
    <li
      className={`min-w-[280px] sm:min-w-[420px] max-w-2xl rounded-2xl border p-6 snap-start ${color}`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <p className="font-medium leading-relaxed">{message}</p>
    </li>
  )
}

function OpportunitySkeletonCard() {
  return (
    <li className="min-w-[280px] sm:min-w-[320px] max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse space-y-4 snap-start">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-6 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
    </li>
  )
}

function FairCard({ fair }: { fair: LandingFair }) {
  return (
    <li className="min-w-[280px] sm:min-w-[320px] max-w-sm flex-1 rounded-2xl border border-green-100 bg-white p-6 shadow-sm snap-start">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full border ${FAIR_STATUS_STYLES[fair.status]}`}
        >
          {FAIR_STATUS_LABEL[fair.status]}
        </span>
        <span className="text-sm font-medium text-gray-600">
          {formatFairDateLabel(fair.date)}
        </span>
      </div>

      <h4 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {fair.title}
      </h4>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
        <MapPin className="h-4 w-4 text-green-600" />
        <span className="font-medium text-gray-800">{fair.district}</span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">{fair.address}</p>

      <div className="mt-4 space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-green-600" />
          <span>{formatFairDateLabel(fair.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <span>{formatTimeWindow(fair.startTime, fair.endTime)}</span>
        </div>
      </div>
    </li>
  )
}

function ScholarshipCard({
  scholarship,
  onApply,
}: {
  scholarship: LandingScholarship
  onApply: () => void
}) {
  return (
    <li className="min-w-[280px] sm:min-w-[320px] max-w-sm flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm snap-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 leading-tight line-clamp-2">
            {scholarship.name}
          </h4>
          <p className="text-sm text-green-700 font-semibold mt-1">
            {scholarship.organizationName ?? 'Organización aliada'}
          </p>
        </div>
        <div className="min-w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
          {scholarship.vacancies}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3">
        {scholarship.description}
      </p>

      <div className="mt-6 space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-green-600" />
          <span>
            {formatScholarshipPeriod(
              scholarship.startDate,
              scholarship.endDate,
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-green-600" />
          <span>{scholarship.vacancies} vacante(s) disponible(s)</span>
        </div>
        {scholarship.daysLeft !== undefined && (
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Clock className="h-4 w-4" />
            <span>{formatDaysLeftLabel(scholarship.daysLeft)}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
      >
        Postular
      </button>
    </li>
  )
}

function formatFairDateLabel(date: Date) {
  const formatted = date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return capitalizeFirstLetter(formatted)
}

function formatTimeWindow(start?: string, end?: string) {
  const formattedStart = formatTimeValue(start)
  const formattedEnd = formatTimeValue(end)
  if (!formattedStart && !formattedEnd) return 'Horario por confirmar'
  if (!formattedStart) return formattedEnd
  if (!formattedEnd) return formattedStart
  return `${formattedStart} - ${formattedEnd}`
}

function formatTimeValue(value?: string) {
  if (!value) return ''
  return value.slice(0, 5)
}

function formatScholarshipPeriod(start: string, end: string) {
  if (!start && !end) return 'Fechas por confirmar'
  if (!end) return formatDate(start)
  return `${formatDate(start)} - ${formatDate(end)}`
}

function formatDaysLeftLabel(days: number) {
  if (days <= 0) return 'Cierra hoy'
  if (days === 1) return 'Cierra en 1 día'
  return `Cierra en ${days} días`
}

function capitalizeFirstLetter(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
