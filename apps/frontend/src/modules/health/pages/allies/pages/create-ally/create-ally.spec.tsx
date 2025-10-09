import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import AllyFormView from './index'

const mockCreateAlly = vi.fn()
const mockUseSearch = vi.fn()

vi.mock('./hooks/use-create-ally', () => ({
  useCreateAlly: () => ({ mutate: mockCreateAlly }),
}))

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit:
      (fn: (data: unknown) => void) => (e: { preventDefault: () => void }) => {
        e.preventDefault()
        fn({ name: 'Test Organization' })
      },
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => ({}),
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockUseSearch(),
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

describe('AllyFormView - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue('new')
  })

  it('renders form in create mode', () => {
    render(<AllyFormView />)

    expect(screen.getByText('Crear nuevo aliado')).toBeTruthy()
    expect(screen.getByText('Crear Aliado')).toBeTruthy()
  })

  it('has name input field', () => {
    render(<AllyFormView />)

    expect(screen.getByPlaceholderText('Organización')).toBeTruthy()
  })

  it('has cancel button', () => {
    render(<AllyFormView />)

    const cancelButton = screen.getByText('Cancelar')
    expect(cancelButton).toBeTruthy()
  })

  it('submits form when clicking create button', async () => {
    const user = userEvent.setup()
    render(<AllyFormView />)

    const submitButton = screen.getByText('Crear Aliado')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateAlly).toHaveBeenCalled()
    })
  })

  it('calls createOrganization with form values', async () => {
    const user = userEvent.setup()
    render(<AllyFormView />)

    const submitButton = screen.getByText('Crear Aliado')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateAlly).toHaveBeenCalledWith({
        name: 'Test Organization',
      })
    })
  })
})

describe('AllyFormView - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue('edit')
  })

  it('renders form in edit mode', () => {
    render(<AllyFormView />)

    expect(screen.getByText('Editar un aliado')).toBeTruthy()
    expect(screen.getByText('Guardar Cambios')).toBeTruthy()
  })

  it('has name input field in edit mode', () => {
    render(<AllyFormView />)

    expect(screen.getByPlaceholderText('Organización')).toBeTruthy()
  })
})
