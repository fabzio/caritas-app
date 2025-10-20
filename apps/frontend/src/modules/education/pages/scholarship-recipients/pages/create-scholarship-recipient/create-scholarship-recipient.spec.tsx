import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import CreateScholarshipRecipient from './index'

const useScholarshipRecipientFormMock = vi.fn()

vi.mock('../hooks/use-scholarship-recipient-form', () => ({
  useScholarshipRecipientForm: () => useScholarshipRecipientFormMock(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('CreateScholarshipRecipient page', () => {
  const mockScholarships = [
    { id: 1, name: 'Beca de Excelencia Académica' },
    { id: 2, name: 'Beca de Apoyo Económico' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    useScholarshipRecipientFormMock.mockReturnValue({
      form: {
        control: {},
        handleSubmit: (fn: () => void) => (e: Event) => {
          e.preventDefault()
          fn()
        },
        setValue: vi.fn(),
      },
      selectedBeneficiary: null,
      scholarships: mockScholarships,
      isLoadingScholarships: false,
      isPending: false,
      handleSelectBeneficiary: vi.fn(),
      handleClearBeneficiary: vi.fn(),
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
    })
  })

  it('renders the page title and description', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    expect(screen.getByRole('heading', { name: 'Agregar Becado' })).toBeTruthy()
    expect(
      screen.getByText('Busca un beneficiario y asígnalo a una beca'),
    ).toBeTruthy()
  })

  it('renders the scholarship recipient form sections', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    expect(screen.getByText('Buscar Beneficiario')).toBeTruthy()
    expect(screen.getByText('Seleccionar Beca')).toBeTruthy()
  })

  it('displays beneficiary search section with description', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    expect(screen.getByText('Buscar Beneficiario')).toBeTruthy()
    expect(
      screen.getByText('Busca por nombre o número de documento'),
    ).toBeTruthy()
  })

  it('displays scholarship selection section with description', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    expect(screen.getByText('Seleccionar Beca')).toBeTruthy()
    expect(
      screen.getByText('Elige la beca a la que deseas agregar al estudiante'),
    ).toBeTruthy()
  })

  it('renders cancel and submit buttons', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    const submitButton = screen.getByRole('button', { name: /agregar becado/i })

    expect(cancelButton).toBeTruthy()
    expect(submitButton).toBeTruthy()
  })

  it('submit button is disabled when no beneficiary is selected', () => {
    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole('button', {
      name: /agregar becado/i,
    })
    expect(submitButton).toHaveProperty('disabled', true)
  })

  it('shows loading state when scholarships are being fetched', () => {
    useScholarshipRecipientFormMock.mockReturnValue({
      form: {
        control: {},
        handleSubmit: vi.fn(),
        setValue: vi.fn(),
      },
      selectedBeneficiary: null,
      scholarships: [],
      isLoadingScholarships: true,
      isPending: false,
      handleSelectBeneficiary: vi.fn(),
      handleClearBeneficiary: vi.fn(),
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
    })

    render(<CreateScholarshipRecipient />, { wrapper: createWrapper() })

    expect(screen.getByText('Cargando becas...')).toBeTruthy()
  })
})
