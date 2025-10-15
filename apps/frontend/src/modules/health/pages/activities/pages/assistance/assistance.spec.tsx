import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import AssistancePage from './index'

const mockNavigate = vi.fn()
const mockUseSearch = vi.fn()
const mockUseLoaderData = vi.fn()
const mockUseActivityParticipants = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useSearch: (opts?: unknown) => mockUseSearch(opts),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  getRouteApi: () => ({
    useLoaderData: () => mockUseLoaderData(),
  }),
}))

vi.mock('./hooks/use-activity-participants', () => ({
  useActivityParticipants: (opts: unknown) => mockUseActivityParticipants(opts),
}))

vi.mock('./components/assistant-card', () => ({
  __esModule: true,
  default: ({
    assistant,
    onClick,
  }: {
    assistant: {
      id: string
      name: string
      documentType: string
      documentNumber: string
    }
    onClick: () => void
  }) => (
    <button
      type="button"
      data-testid={`assistant-card-${assistant.id}`}
      onClick={onClick}
    >
      <div>{assistant.name}</div>
      <div>{assistant.documentType}</div>
      <div>{assistant.documentNumber}</div>
    </button>
  ),
}))

vi.mock('./components/search-assistant-input', () => ({
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
    variant,
  }: {
    children: ReactNode
    onClick?: () => void
    variant?: string
  }) => (
    <button type="button" onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}))

vi.mock('@workspace/ui/components/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

describe('AssistancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue({ id: '1' })
    mockUseLoaderData.mockReturnValue({
      id: 1,
      name: 'Jornada de Salud',
      date: new Date('2024-01-15'),
    })
  })

  describe('Rendering', () => {
    it('renders page header with activity details', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByText('Asistentes')).toBeTruthy()
      expect(screen.getByText(/Jornada de Salud/)).toBeTruthy()
    })

    it('renders search input', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByTestId('search-input')).toBeTruthy()
    })

    it('renders back button', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByText('Regresar')).toBeTruthy()
    })

    it('renders register assistant button', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByText('Registrar asistente')).toBeTruthy()
    })
  })

  describe('Loading State', () => {
    it('shows spinner when loading participants', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: undefined,
        isLoading: true,
      })

      render(<AssistancePage />)

      expect(screen.getByTestId('spinner')).toBeTruthy()
    })
  })

  describe('Participants List', () => {
    it('renders list of participants', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [
          {
            id: 'user-1',
            name: 'John',
            surname: 'Doe',
            documentType: 'DNI',
            documentNumber: '12345678',
            email: 'john@example.com',
            phone: '987654321',
            rewarded: false,
          },
          {
            id: 'user-2',
            name: 'Jane',
            surname: 'Smith',
            documentType: 'DNI',
            documentNumber: '87654321',
            email: 'jane@example.com',
            phone: '987654322',
            rewarded: true,
          },
        ],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByTestId('assistant-card-user-1')).toBeTruthy()
      expect(screen.getByTestId('assistant-card-user-2')).toBeTruthy()
      expect(screen.getByText('John Doe')).toBeTruthy()
      expect(screen.getByText('Jane Smith')).toBeTruthy()
    })

    it('shows empty message when no participants', () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AssistancePage />)

      expect(screen.getByText('No hay asistentes registrados')).toBeTruthy()
    })

    it('shows search empty message when searching with no results', async () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AssistancePage />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(
          screen.getByText(
            'No se encontraron asistentes con ese criterio de búsqueda',
          ),
        ).toBeTruthy()
      })
    })
  })

  describe('Search Functionality', () => {
    it('calls useActivityParticipants with search query', async () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AssistancePage />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'john')

      await waitFor(() => {
        expect(mockUseActivityParticipants).toHaveBeenLastCalledWith(
          expect.objectContaining({
            searchQuery: 'john',
          }),
        )
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to attentions page when clicking on participant', async () => {
      mockUseActivityParticipants.mockReturnValue({
        data: [
          {
            id: 'user-1',
            name: 'John',
            surname: 'Doe',
            documentType: 'DNI',
            documentNumber: '12345678',
            email: 'john@example.com',
            phone: '987654321',
            rewarded: false,
          },
        ],
        isLoading: false,
      })

      const user = userEvent.setup()
      render(<AssistancePage />)

      const participantCard = screen.getByTestId('assistant-card-user-1')
      await user.click(participantCard)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/health/activities/attentions',
          search: {
            activityId: '1',
            userId: 'user-1',
          },
        })
      })
    })
  })
})
