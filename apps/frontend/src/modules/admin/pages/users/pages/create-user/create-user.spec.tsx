import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import FormView from './index'

const mockCreateUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockUseSearch = vi.fn()
const mockUseLoaderData = vi.fn()

vi.mock('./hooks/use-create-user', () => ({
  useCreateUser: () => ({ mutate: mockCreateUser }),
}))

vi.mock('./hooks/use-update-user', () => ({
  useUpdateUser: () => ({ mutate: mockUpdateUser }),
}))

vi.mock('./hooks/use-list-teams', () => ({
  useListTeams: () => ({
    data: [
      { id: 'team-1', name: 'Team A' },
      { id: 'team-2', name: 'Team B' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@frontend/hooks/use-regions', () => ({
  useRegions: () => ({
    data: [
      { id: 'region-1', name: 'Lima' },
      { id: 'region-2', name: 'Cusco' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockUseSearch(),
  getRouteApi: () => ({
    useLoaderData: () => mockUseLoaderData(),
  }),
  Link: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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

vi.mock('@workspace/ui/components/form', () => ({
  Form: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormField: ({
    render,
  }: {
    render: (props: { field: Record<string, unknown> }) => ReactNode
  }) => render({ field: { value: '', onChange: vi.fn() } }),
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
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
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

vi.mock('@workspace/ui/components/command', () => ({
  Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandInput: () => <input data-testid="command-input" />,
  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
  }: {
    children: ReactNode
    onSelect: () => void
  }) => (
    <button type="button" onClick={onSelect}>
      {children}
    </button>
  ),
}))

vi.mock('@workspace/ui/components/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) => (
    <button
      type="button"
      data-testid="calendar"
      onClick={() => onSelect(new Date('2000-01-01'))}
    >
      Calendar
    </button>
  ),
}))

describe('FormView - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue('new')
    mockUseLoaderData.mockReturnValue(null)
  })

  it('renders form in create mode', () => {
    render(<FormView />)

    expect(screen.getByText('Crear nuevo usuario')).toBeTruthy()
    expect(screen.getByText('Crear Usuario')).toBeTruthy()
  })

  it('has all required fields', () => {
    render(<FormView />)

    expect(screen.getByLabelText('Nombre')).toBeTruthy()
    expect(screen.getByLabelText('Apellido')).toBeTruthy()
    expect(screen.getByLabelText('Correo Electrónico')).toBeTruthy()
    expect(screen.getByLabelText('Teléfono')).toBeTruthy()
    expect(screen.getByLabelText('Tipo de Documento')).toBeTruthy()
    expect(screen.getByLabelText('Número de Documento')).toBeTruthy()
    expect(screen.getByLabelText('Fecha de Nacimiento')).toBeTruthy()
    expect(screen.getByLabelText('Sexo')).toBeTruthy()
  })

  it('calls createUser when submitting valid form', async () => {
    const user = userEvent.setup()
    render(<FormView />)

    await user.type(screen.getByLabelText('Nombre'), 'John')
    await user.type(screen.getByLabelText('Apellido'), 'Doe')
    await user.type(
      screen.getByLabelText('Correo Electrónico'),
      'john@example.com',
    )
    await user.type(screen.getByLabelText('Teléfono'), '987654321')
    await user.type(screen.getByLabelText('Número de Documento'), '12345678')

    const submitButton = screen.getByText('Crear Usuario')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledTimes(1)
    })
  })
})

describe('FormView - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue('edit')
    mockUseLoaderData.mockReturnValue({
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      phone: '987654321',
      documentType: 'DNI',
      documentNumber: '12345678',
      birthDate: new Date('1990-01-01'),
      sex: 'M',
      regionId: 'region-1',
      role: 'admin',
      teams: [{ id: 'team-1', name: 'Team A' }],
    })
  })

  it('renders form in edit mode', () => {
    render(<FormView />)

    expect(screen.getByText('Editar un usuario')).toBeTruthy()
    expect(screen.getByText('Guardar Cambios')).toBeTruthy()
  })

  it('prefills form with user data', () => {
    render(<FormView />)

    const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement
    const emailInput = screen.getByLabelText(
      'Correo Electrónico',
    ) as HTMLInputElement

    expect(nameInput.value).toBe('John')
    expect(emailInput.value).toBe('john@example.com')
  })

  it('calls updateUser when submitting', async () => {
    const user = userEvent.setup()
    render(<FormView />)

    const submitButton = screen.getByText('Guardar Cambios')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledTimes(1)
    })
  })
})
