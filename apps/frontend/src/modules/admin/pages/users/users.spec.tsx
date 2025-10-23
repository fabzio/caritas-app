import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import TableView from './index'

const mockRemoveUser = vi.fn()
const mockBanUser = vi.fn()
const mockSetFilters = vi.fn()
const mockNavigate = vi.fn()
const mockGetSession = vi.fn()

vi.mock('./hooks/use-remove-user', () => ({
  useRemoveUser: () => ({
    mutateAsync: mockRemoveUser,
    isPending: false,
  }),
}))

vi.mock('./hooks/use-ban-user', () => ({
  useBanUser: () => ({
    mutateAsync: mockBanUser,
    isPending: false,
  }),
}))

vi.mock('./hooks/use-table', () => ({
  useUserTable: () => ({
    data: [
      {
        id: 'user-1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        roles: ['admin'],
      },
      {
        id: 'user-2',
        name: 'Jane',
        surname: 'Smith',
        email: 'jane@example.com',
        roles: ['healthMember', 'educationMember'],
      },
    ],
    pagination: {
      total: 2,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
    columns: [],
    paginationState: { pageIndex: 1, pageSize: 10 },
    sortingState: [],
    filters: { role: undefined },
    setFilters: mockSetFilters,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}))

vi.mock('./components/search-user-input', () => ({
  __esModule: true,
  default: () => <div data-testid="search-input" />,
}))

vi.mock('./components/role-filter', () => ({
  __esModule: true,
  default: ({ onValueChange }: { onValueChange: (v: string) => void }) => (
    <select
      data-testid="role-filter"
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="all">Todos los roles</option>
      <option value="admin">Administrador</option>
      <option value="healthMember">Beneficiario Salud</option>
      <option value="educationMember">Beneficiario Educación</option>
    </select>
  ),
}))

vi.mock('./components/user-table', () => ({
  __esModule: true,
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="user-table">{data.length} users</div>
  ),
}))

vi.mock('./components/actions-button', () => ({
  __esModule: true,
  default: ({
    onDeleteClick,
    selectedCount,
  }: {
    onDeleteClick: () => void
    selectedCount: number
  }) => (
    <button
      type="button"
      data-testid="delete-button"
      onClick={onDeleteClick}
      disabled={selectedCount === 0}
    >
      Delete ({selectedCount})
    </button>
  ),
}))

vi.mock('@frontend/lib/authClient', () => ({
  __esModule: true,
  default: {
    getSession: () => mockGetSession(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@workspace/ui/components/dialog', () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogClose: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@workspace/ui/components/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

describe('TableView', () => {
  const createWrapper = () => {
    const qc = new QueryClient()
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({
      data: { user: { id: 'current-user' } },
    })
  })

  it('renders search input and filters', () => {
    render(<TableView />, { wrapper: createWrapper() })

    expect(screen.getByTestId('search-input')).toBeTruthy()
    expect(screen.getByTestId('role-filter')).toBeTruthy()
    expect(screen.getByTestId('user-table')).toBeTruthy()
  })

  it('calls setFilters when role filter changes', async () => {
    const user = userEvent.setup()
    render(<TableView />, { wrapper: createWrapper() })

    const roleFilter = screen.getByTestId('role-filter')
    await user.selectOptions(roleFilter, 'admin')

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({
        role: 'admin',
        pageIndex: 1,
      })
    })
  })

  it('resets to all when selecting all option', async () => {
    const user = userEvent.setup()
    render(<TableView />, { wrapper: createWrapper() })

    const roleFilter = screen.getByTestId('role-filter')
    await user.selectOptions(roleFilter, 'all')

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({
        role: undefined,
        pageIndex: 1,
      })
    })
  })

  it('displays user count in table', () => {
    render(<TableView />, { wrapper: createWrapper() })

    expect(screen.getByText('2 users')).toBeTruthy()
  })
})
