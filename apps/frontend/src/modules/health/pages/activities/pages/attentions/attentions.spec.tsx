import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import AttentionsPage from './index'

const mockUseParams = vi.fn()
const mockUseLoaderData = vi.fn()
const mockUseActivityParticipant = vi.fn()
const mockUseUserAttentions = vi.fn()
const mockUpdateActivityUser = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useParams: (opts?: unknown) => mockUseParams(opts),
  Link: ({
    children,
    to,
    params,
  }: {
    children: ReactNode
    to: string
    params?: Record<string, unknown>
  }) => (
    <a href={to} data-params={JSON.stringify(params)}>
      {children}
    </a>
  ),
  getRouteApi: () => ({
    useLoaderData: () => mockUseLoaderData(),
  }),
}))

vi.mock('./hooks/use-activity-participant', () => ({
  useActivityParticipant: (opts: unknown) => mockUseActivityParticipant(opts),
}))

vi.mock('./hooks/use-user-attentions', () => ({
  useUserAttentions: (opts: unknown) => mockUseUserAttentions(opts),
}))

vi.mock('./hooks/use-update-activity-user', () => ({
  useUpdateActivityUser: () => ({
    mutate: mockUpdateActivityUser,
    isPending: false,
  }),
}))

vi.mock('./components/attention-card', () => ({
  __esModule: true,
  default: ({
    attention,
    onClick,
  }: {
    attention: {
      specialityId: number
      specialityName: string
      hasAttention: boolean
    }
    onClick: (attention: unknown) => void
  }) => (
    <button
      type="button"
      data-testid={`attention-card-${attention.specialityId}`}
      onClick={() => onClick(attention)}
    >
      <div>{attention.specialityName}</div>
      <div>{attention.hasAttention ? 'Atendido' : 'Pendiente'}</div>
    </button>
  ),
}))

vi.mock('./components/attention-details-dialog', () => ({
  __esModule: true,
  default: ({
    open,
    onOpenChange,
    specialityName,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    specialityName: string
  }) =>
    open ? (
      <div data-testid="attention-details-dialog">
        <div>{specialityName}</div>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null,
}))

vi.mock('./components/search-attention-input', () => ({
  __esModule: true,
  default: ({ onSearch }: { onSearch: (query: string) => void }) => (
    <input
      data-testid="search-input"
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}))

vi.mock('@workspace/ui/components/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

vi.mock('@workspace/ui/components/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

vi.mock('@workspace/ui/components/dialog', () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogClose: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('AttentionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ activityId: '1', userId: 'user-1' })
    mockUseLoaderData.mockReturnValue({
      activity: {
        id: 1,
        name: 'Jornada de Salud',
        date: new Date('2024-01-15'),
      },
      participant: {
        id: 'user-1',
        name: 'John',
        surname: 'Doe',
        rewarded: false,
      },
    })
    mockUseActivityParticipant.mockReturnValue({
      data: {
        id: 'user-1',
        name: 'John',
        surname: 'Doe',
        rewarded: false,
      },
    })
  })

  describe('Rendering', () => {
    it('renders page header with participant name', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByText('John Doe')).toBeTruthy()
      expect(screen.getByText(/Jornada de Salud/)).toBeTruthy()
    })

    it('renders search input', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByTestId('search-input')).toBeTruthy()
    })

    it('renders back button', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByText('Regresar')).toBeTruthy()
    })

    it('renders mark incentive button when not rewarded', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByText('Marcar incentivo entregado')).toBeTruthy()
    })

    it('renders incentive received button when rewarded', () => {
      mockUseActivityParticipant.mockReturnValue({
        data: {
          id: 'user-1',
          name: 'John',
          surname: 'Doe',
          rewarded: true,
        },
      })
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByText('Incentivo recibido')).toBeTruthy()
    })
  })

  describe('Loading State', () => {
    it('shows spinner when loading attentions', () => {
      mockUseUserAttentions.mockReturnValue({
        data: undefined,
        isLoading: true,
      })

      render(<AttentionsPage />)

      expect(screen.getByTestId('spinner')).toBeTruthy()
    })
  })

  describe('Attentions List', () => {
    it('renders list of attentions', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [
          {
            specialityId: 1,
            specialityName: 'Medicina General',
            hasAttention: true,
            attentionId: 1,
            attentionTime: '2024-01-15T10:00:00Z',
            observations: 'Normal',
          },
          {
            specialityId: 2,
            specialityName: 'Odontología',
            hasAttention: false,
            attentionId: null,
            attentionTime: null,
            observations: null,
          },
        ],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByTestId('attention-card-1')).toBeTruthy()
      expect(screen.getByTestId('attention-card-2')).toBeTruthy()
      expect(screen.getByText('Medicina General')).toBeTruthy()
      expect(screen.getByText('Odontología')).toBeTruthy()
    })

    it('shows empty message when no attentions', () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      expect(screen.getByText('No hay atenciones disponibles')).toBeTruthy()
    })

    it('shows search empty message when searching with no results', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'nonexistent')

      expect(
        screen.getByText(
          'No se encontraron atenciones con ese criterio de búsqueda',
        ),
      ).toBeTruthy()
    })
  })

  describe('Search Functionality', () => {
    it('calls useUserAttentions with search query', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'medicina')

      await waitFor(() => {
        expect(mockUseUserAttentions).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: 'medicina',
          }),
        )
      })
    })
  })

  describe('Attention Details Dialog', () => {
    it('opens dialog when clicking on attention with data', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [
          {
            specialityId: 1,
            specialityName: 'Medicina General',
            hasAttention: true,
            attentionId: 1,
            attentionTime: '2024-01-15T10:00:00Z',
            observations: 'Normal',
          },
        ],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const attentionCard = screen.getByTestId('attention-card-1')
      await user.click(attentionCard)

      await waitFor(() => {
        expect(screen.getByTestId('attention-details-dialog')).toBeTruthy()
      })
    })

    it('does not open dialog when clicking on attention without data', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [
          {
            specialityId: 2,
            specialityName: 'Odontología',
            hasAttention: false,
            attentionId: null,
            attentionTime: null,
            observations: null,
          },
        ],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const attentionCard = screen.getByTestId('attention-card-2')
      await user.click(attentionCard)

      expect(screen.queryByTestId('attention-details-dialog')).toBeFalsy()
    })
  })

  describe('Mark Incentive Functionality', () => {
    it('opens confirmation dialog when clicking mark incentive button', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const markIncentiveButton = screen.getByText('Marcar incentivo entregado')
      await user.click(markIncentiveButton)

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeTruthy()
        expect(
          screen.getByText(
            '¿Seguro que desea marcar el registro de incentivo?',
          ),
        ).toBeTruthy()
      })
    })

    it('calls updateActivityUser when confirming incentive', async () => {
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AttentionsPage />)

      const markIncentiveButton = screen.getByText('Marcar incentivo entregado')
      await user.click(markIncentiveButton)

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeTruthy()
      })

      const confirmButton = screen.getByText('Aceptar')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockUpdateActivityUser).toHaveBeenCalledWith({
          userId: 'user-1',
          activityId: 1,
          rewarded: true,
        })
      })
    })

    it('disables mark incentive button when already rewarded', () => {
      mockUseActivityParticipant.mockReturnValue({
        data: {
          id: 'user-1',
          name: 'John',
          surname: 'Doe',
          rewarded: true,
        },
      })
      mockUseUserAttentions.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttentionsPage />)

      const button = screen.getByText('Incentivo recibido')
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
