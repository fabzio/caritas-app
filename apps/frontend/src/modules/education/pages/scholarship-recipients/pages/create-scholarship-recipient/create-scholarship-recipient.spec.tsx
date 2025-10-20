import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import CreateScholarshipRecipient from './index'

const useScholarshipRecipientFormMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('./hooks/use-get-beneficiaries', () => ({
  useGetBeneficiaries: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('./hooks/use-beneficiary-search', () => ({
  useBeneficiarySearch: () => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    filteredBeneficiaries: [],
    handleSelectBeneficiary: vi.fn(),
    formatDocument: () => 'DNI - 12345678',
    isLoading: false,
  }),
}))

vi.mock('./hooks/use-scholarship-recipient-form', () => ({
  useScholarshipRecipientForm: () => useScholarshipRecipientFormMock(),
}))

vi.mock('@workspace/ui/components/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: ReactNode
    onClick?: () => void
    type?: string
    disabled?: boolean
  }) => (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

vi.mock('@workspace/ui/components/input', () => ({
  Input: ({ ...props }: Record<string, unknown>) => <input {...props} />,
}))

vi.mock('@workspace/ui/components/form', () => ({
  Form: ({ children, ...props }: { children: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormField: ({
    render,
    name,
  }: {
    render: (props: { field: Record<string, unknown> }) => ReactNode
    name?: string
  }) =>
    render({
      field: {
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        name: name || '',
        ref: vi.fn(),
      },
    }),
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({
    children,
    htmlFor,
  }: {
    children: ReactNode
    htmlFor?: string
  }) => <label htmlFor={htmlFor}>{children}</label>,
  FormMessage: () => <span />,
}))

vi.mock('@workspace/ui/components/select', () => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
  }: {
    children: ReactNode
    onValueChange?: (v: string) => void
    defaultValue?: string
  }) => (
    <div>
      <select
        onChange={(e) => onValueChange?.(e.target.value)}
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}))

vi.mock('@workspace/ui/components/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@workspace/ui/components/separator', () => ({
  Separator: () => <hr />,
}))

vi.mock('@workspace/ui/components/skeleton', () => ({
  Skeleton: () => <div>Loading...</div>,
}))

vi.mock('lucide-react', () => ({
  UserPlus: () => <span>UserPlus</span>,
  Search: () => <span>Search</span>,
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
