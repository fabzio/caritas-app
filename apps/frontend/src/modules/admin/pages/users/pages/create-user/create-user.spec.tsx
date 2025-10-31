import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import FormView from './index'

type FormValues = Record<string, unknown>

let mockFormValues: FormValues = {}

const setMockFormValues = (values: FormValues) => {
  mockFormValues = values
}

const mockCreateUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockUseSearch = vi.fn()
const mockUseLoaderData = vi.fn()
const mockUseInvitation = vi.fn()

const mockUseUserDetail = vi.fn()

vi.mock('@frontend/hooks/use-session', () => ({
  useSession: () => ({ data: { user: { id: 'current-user-id', teams: [] } } }),
}))
vi.mock('./hooks/use-create-user', () => ({
  useCreateUser: () => ({ mutate: mockCreateUser }),
}))

vi.mock('@frontend/hooks/use-invitation', () => ({
  useInvitation: () => ({ mutate: mockUseInvitation }),
}))

vi.mock('./hooks/use-update-user', () => ({
  useUpdateUser: () => ({ mutate: mockUpdateUser }),
}))

vi.mock('./hooks/use-user-detail', () => ({
  useUserDetail: (id: string | undefined) => mockUseUserDetail(id),
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

// useUserDetail mocked above via mockUseUserDetail
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit:
      (fn: (data: unknown) => void) =>
      (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.()
        fn(mockFormValues)
      },
    formState: { errors: {} },
    setValue: vi.fn(),
    getValues: () => mockFormValues,
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => ({}),
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
  }) => {
    const fieldValue = mockFormValues[name]
    const onChange = vi.fn((value: unknown) => {
      mockFormValues = {
        ...mockFormValues,
        [name]: value,
      }
    })
    return render({
      field: {
        value: fieldValue,
        onChange,
        onBlur: vi.fn(),
        name,
        ref: vi.fn(),
      },
    })
  },
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

vi.mock('@workspace/ui/components/checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean
    onCheckedChange: (checked: boolean) => void
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}))

describe('FormView - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue({ id: undefined, type: 'new' })
    mockUseLoaderData.mockReturnValue(null)
    mockUseUserDetail.mockReturnValue({ data: null })
    const birthDate = new Date('1995-05-05')
    setMockFormValues({
      name: 'Jane',
      surname: 'Doe',
      email: 'jane@example.com',
      phone: '+51 999 888 777',
      documentType: 'DNI',
      documentNumber: '12345678',
      birthDate,
      sex: 'F',
      regionId: 'region-1',
      teamIds: ['team-1'],
    })
  })

  it('renders form in create mode', () => {
    render(<FormView />)

    expect(screen.getByText('Crear nuevo usuario')).toBeTruthy()
    expect(screen.getByText('Crear Usuario')).toBeTruthy()
  })

  it('has all required fields', () => {
    render(<FormView />)

    expect(screen.getByPlaceholderText('John')).toBeTruthy()
    expect(screen.getByPlaceholderText('Doe')).toBeTruthy()
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('987 654 321')).toBeTruthy()
    expect(screen.getByPlaceholderText('12345678')).toBeTruthy()
  })

  it('submits form when clicking create button', async () => {
    const user = userEvent.setup()
    render(<FormView />)

    const submitButton = screen.getByText('Crear Usuario')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: 'jane@example.com',
        name: 'Jane',
        role: 'admin',
        password: 'default',
        data: {
          surname: 'Doe',
          documentType: 'DNI',
          documentNumber: '12345678',
          sex: 'F',
          birthDate: new Date('1995-05-05'),
          phone: '+51 999 888 777',
          regionId: 'region-1',
        },
        teamIds: ['team-1'],
      })
    })
  })
})

describe('FormView - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue({ id: 'user-1', type: 'edit' })
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
    const loader = {
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
    }
    mockUseLoaderData.mockReturnValue(loader)
    mockUseUserDetail.mockReturnValue({ data: loader })
    setMockFormValues({
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
      teamIds: ['team-1'],
    })
  })

  it('renders form in edit mode', () => {
    render(<FormView />)

    expect(screen.getByText('Editar un usuario')).toBeTruthy()
    expect(screen.getByText('Guardar Cambios')).toBeTruthy()
  })

  it('renders form fields with placeholders', () => {
    render(<FormView />)

    expect(screen.getByPlaceholderText('John')).toBeTruthy()
    expect(screen.getByPlaceholderText('Doe')).toBeTruthy()
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeTruthy()
  })

  it('submits form when clicking save button', async () => {
    const user = userEvent.setup()
    render(<FormView />)

    const submitButton = screen.getByText('Guardar Cambios')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        userId: 'user-1',
        data: {
          id: 'user-1',
          email: 'john@example.com',
          name: 'John',
          role: 'admin',
          surname: 'Doe',
          documentType: 'DNI',
          documentNumber: '12345678',
          sex: 'M',
          birthDate: new Date('1990-01-01'),
          phone: '987654321',
          regionId: 'region-1',
        },
        teamIds: undefined,
      })
    })
  })
})
