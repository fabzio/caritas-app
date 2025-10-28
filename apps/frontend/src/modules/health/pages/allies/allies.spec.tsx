import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import AlliesTableView from './index'

const mockSetFilters = vi.fn()
const mockNavigate = vi.fn()
const mockCreateAlly = vi.fn()
vi.mock('./hooks/use-create-ally', () => ({
  useCreateAlly: () => ({
    mutate: mockCreateAlly,
    isPending: false,
  }),
}))
const mockDeleteAlly = vi.fn()
vi.mock('./hooks/use-delete-ally', () => ({
  default: () => ({
    mutate: mockDeleteAlly,
    isPending: false,
  }),
}))
vi.mock('./hooks/use-ally-table', () => ({
  useOrganizationTable: () => ({
    data: [
      {
        id: 'org-1',
        name: 'Health Org 1',
        type: 'health',
        logo: 'https://example.com/logo1.png',
      },
      {
        id: 'org-2',
        name: 'Education Org 2',
        type: 'education',
        logo: 'https://example.com/logo2.png',
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
    setFilters: mockSetFilters,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}))

vi.mock('./components/search-organization-input', () => ({
  __esModule: true,
  default: () => <div data-testid="search-input" />,
}))

vi.mock('./components/organization-table', () => ({
  __esModule: true,
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="organization-table">{data.length} organizations</div>
  ),
}))

vi.mock('./components/actions-button', () => ({
  __esModule: true,
  default: ({
    onDeleteClick,
    selectedCount,
  }: {
    onDeleteClick: () => void
    onEditClick: () => void
    selectedCount: number
  }) => (
    <div data-testid="actions-button">
      <button type="button" data-testid="actions-trigger">
        Acciones
      </button>
      <button
        type="button"
        data-testid="delete-button"
        onClick={onDeleteClick}
        disabled={selectedCount === 0}
      >
        Eliminar ({selectedCount})
      </button>
    </div>
  ),
}))

vi.mock('@workspace/ui/components/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => (
    <div data-testid="dialog-container">{children}</div>
  ),
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
  DialogTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
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

vi.mock('lucide-react', () => ({
  UserPlus: () => <span>+</span>,
}))

vi.mock('../../components/organization-form-dialog', () => ({
  __esModule: true,
  default: () => <div data-testid="organization-form-dialog" />,
}))

describe('AlliesTableView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input and table', () => {
    render(<AlliesTableView />)

    expect(screen.getByTestId('search-input')).toBeTruthy()
    expect(screen.getByTestId('organization-table')).toBeTruthy()
  })

  it('displays organization count in table', () => {
    render(<AlliesTableView />)

    expect(screen.getByText('2 organizations')).toBeTruthy()
  })

  it('renders new ally button', () => {
    render(<AlliesTableView />)

    expect(screen.getByText('Nuevo aliado')).toBeTruthy()
  })

  it('delete button is disabled when no rows selected', () => {
    render(<AlliesTableView />)

    const deleteButton = screen.getByTestId('delete-button')
    expect(deleteButton).toHaveProperty('disabled', true)
  })

  it('renders actions button', () => {
    render(<AlliesTableView />)

    expect(screen.getByTestId('actions-button')).toBeTruthy()
    expect(screen.getByText('Acciones')).toBeTruthy()
  })
})
