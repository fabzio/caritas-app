import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, use } from 'react'
import { beforeEach, describe, it, vi } from 'vitest'
import CreateScholarship from './index'

const mockPostScholarship = vi.fn()
const mockUseSession = vi.fn()

vi.mock('./hooks/use-post-scholarship', () => ({
  default: () => ({ mutate: mockPostScholarship, isPending: false }),
}))

vi.mock('./hooks/use-get-organization', () => ({
  default: () => ({
    data: [
      { id: '1', name: 'Organization A' },
      { id: '2', name: 'Organization B' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@frontend/hooks/use-session', () => ({
  useSession: () => mockUseSession(),
}))

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit:
      (fn: (data: unknown) => void) => (e: { preventDefault: () => void }) => {
        e.preventDefault()
        fn({})
      },
    formState: { errors: {} },
    getValues: () => ({ vacancies: 10 }),
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => ({}),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useSearch: () => ({ type: 'new' }),
  getRouteApi: () => ({
    useLoaderData: () => null,
  }),
  useNavigate: () => vi.fn(),
}))

vi.mock('@workspace/ui/components/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    variant,
  }: {
    children: ReactNode
    onClick?: () => void
    type?: string
    variant?: string
  }) => (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

vi.mock('@workspace/ui/components/input', () => ({
  Input: ({ ...props }: Record<string, unknown>) => <input {...props} />,
}))

vi.mock('@workspace/ui/components/textarea', () => ({
  Textarea: ({ ...props }: Record<string, unknown>) => <textarea {...props} />,
}))

vi.mock('@workspace/ui/components/form', () => ({
  Form: ({ children, ...props }: { children: ReactNode }) => (
    <form {...props}>{children}</form>
  ),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormField: ({
    render,
    name,
  }: {
    render: (props: { field: Record<string, unknown> }) => ReactNode
    name: string
  }) =>
    render({
      field: {
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        name,
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
    onValueChange: (v: string) => void
    defaultValue?: string
  }) => (
    <div>
      <select
        onChange={(e) => onValueChange(e.target.value)}
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: () => <span />,
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
    disabled,
  }: {
    children: ReactNode
    value: string
    disabled?: boolean
  }) => (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  ),
}))

vi.mock('@workspace/ui/components/popover', () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock('@workspace/ui/components/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) => (
    <button
      type="button"
      data-testid="calendar"
      onClick={() => onSelect(new Date('2025-06-01'))}
    >
      Calendar
    </button>
  ),
}))

vi.mock('@workspace/ui/components/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@workspace/ui/components/separator', () => ({
  Separator: () => <hr />,
}))

vi.mock('date-fns', () => ({
  format: (date: Date) => date.toDateString(),
}))

vi.mock('lucide-react', () => ({
  CalendarIcon: () => <span>📅</span>,
  Loader2: () => <span>⏳</span>,
}))
const queryClient = new QueryClient()
describe('CreateScholarship', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'user-123' },
      },
    })
  })

  it('renders form with all required fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    expect(
      screen.getByText((content) => content.startsWith('Crear nueva beca')),
    ).toBeTruthy()
    expect(screen.getByText('Información de la Beca')).toBeTruthy()
    expect(screen.getByText('Nombre de la Beca*')).toBeTruthy()
    expect(screen.getByText('Tipo de beca*')).toBeTruthy()
    expect(screen.getByText('Organización*')).toBeTruthy()
    expect(screen.getByText('Descripción*')).toBeTruthy()
    expect(screen.getByText('Requisitos')).toBeTruthy()
    expect(screen.getByText('Vacantes Disponibles*')).toBeTruthy()
    expect(screen.getByText('Fecha de inicio*')).toBeTruthy()
    expect(screen.getByText('Fecha de fin*')).toBeTruthy()
  })

  it('renders organization options', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Organization A')).toBeTruthy()
    expect(screen.getByText('Organization B')).toBeTruthy()
  })

  it('renders scholarship type options', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Modular')).toBeTruthy()
    expect(screen.getByText('Plan de estudios')).toBeTruthy()
  })

  it('has submit button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    const submitButton = screen.getByText('Registrar')
    expect(submitButton).toBeTruthy()
    expect(submitButton.getAttribute('type')).toBe('submit')
  })

  it('has cancel button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    const cancelButton = screen.getByText('Cancelar')
    expect(cancelButton).toBeTruthy()
    expect(cancelButton.getAttribute('data-variant')).toBe('outline')
  })

  it('submits form when clicking submit button', async () => {
    const user = userEvent.setup()
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )

    const submitButton = screen.getByText('Registrar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPostScholarship).toHaveBeenCalled()
    })
  })

  it('renders form with name input field', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )
    const nameInputs = screen.getAllByRole('textbox')
    expect(nameInputs.length).toBeGreaterThan(0)
  })

  it('renders form with vacancies input field', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CreateScholarship />
      </QueryClientProvider>,
    )
    const numberInputs = screen.getAllByRole('spinbutton')
    expect(numberInputs.length).toBeGreaterThan(0)
  })
})
