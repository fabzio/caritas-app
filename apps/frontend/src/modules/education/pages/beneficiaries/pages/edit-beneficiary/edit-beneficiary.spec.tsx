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

const mockCreateBeneficiary = vi.fn()
const mockUpdateBeneficiary = vi.fn()
const mockUseSearch = vi.fn()
const mockUseLoaderData = vi.fn()

vi.mock('../../hooks/use-create-beneficiary', () => ({
  useCreateBeneficiary: () => ({
    mutate: mockCreateBeneficiary,
    isPending: false,
  }),
}))

vi.mock('../../hooks/use-update-beneficiary', () => ({
  useUpdateBeneficiary: () => ({
    mutate: mockUpdateBeneficiary,
    isPending: false,
  }),
}))

vi.mock('@frontend/hooks/use-regions', () => ({
  useRegions: () => ({
    data: [
      { id: 10, name: 'Lima' },
      { id: 20, name: 'Cusco' },
    ],
    isLoading: false,
  }),
}))

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
  }: {
    children: ReactNode
    onClick?: () => void
    type?: string
  }) => (
    <button type={type === 'submit' ? 'submit' : 'button'} onClick={onClick}>
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
  Calendar: () => <div />,
}))

vi.mock('@workspace/ui/components/spinner', () => ({
  Spinner: () => <div>spinner</div>,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockFormValues = {}
})

describe('Education Beneficiary FormView', () => {
  it('renders distrito label', () => {
    mockUseSearch.mockReturnValue({ type: 'new' })
    mockUseLoaderData.mockReturnValue(undefined)
    setMockFormValues({
      name: '',
    })

    render(<FormView />)

    expect(screen.getByText('Distrito')).toBeTruthy()
  })

  it('calls create hook with form values in new mode', async () => {
    const user = userEvent.setup()
    mockUseSearch.mockReturnValue({ type: 'new' })
    mockUseLoaderData.mockReturnValue(undefined)

    setMockFormValues({
      name: 'Ana',
      surname: 'Perez',
      email: 'ana@example.com',
      phone: '999888777',
      documentType: 'DNI',
      documentNumber: '87654321',
      birthDate: new Date('2000-03-03'),
      sex: 'F',
      regionId: 10,
      grade: '5to secundaria',
      guardianEmail: 'guardian@example.com',
    })

    render(<FormView />)

    await user.click(screen.getByText('Registrar Beneficiario'))

    await waitFor(() => {
      expect(mockCreateBeneficiary).toHaveBeenCalledWith({
        email: 'ana@example.com',
        name: 'Ana',
        role: 'user',
        password: 'default',
        data: {
          surname: 'Perez',
          documentType: 'DNI',
          documentNumber: '87654321',
          sex: 'F',
          birthDate: new Date('2000-03-03'),
          phone: '999888777',
          regionId: 10,
        },
        grade: '5to secundaria',
        guardianEmail: 'guardian@example.com',
      })
    })
  })

  it('calls update hook with form values in edit mode', async () => {
    const user = userEvent.setup()
    mockUseSearch.mockReturnValue({ type: 'edit', id: 'beneficiary-2' })
    const loaderData = {
      id: 'beneficiary-2',
      name: 'Luis',
      surname: 'Gomez',
      email: 'luis@example.com',
      phone: '912345678',
      documentType: 'CE',
      documentNumber: '99887766',
      birthDate: new Date('2001-04-04'),
      sex: 'M',
      regionId: 20,
      grade: '4to secundaria',
      guardianEmail: 'family@example.com',
    }
    mockUseLoaderData.mockReturnValue(loaderData)

    setMockFormValues({
      ...loaderData,
    })

    render(<FormView />)

    await user.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(mockUpdateBeneficiary).toHaveBeenCalledWith({
        userId: 'beneficiary-2',
        data: {
          email: 'luis@example.com',
          name: 'Luis',
          role: 'user',
          surname: 'Gomez',
          documentType: 'CE',
          documentNumber: '99887766',
          sex: 'M',
          birthDate: new Date('2001-04-04'),
          phone: '912345678',
          regionId: 20,
        },
        grade: '4to secundaria',
        guardianEmail: 'family@example.com',
      })
    })
  })
})
