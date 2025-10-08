import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Profile from './index'

const useSessionMock = vi.fn()

vi.mock('@frontend/hooks/use-session', () => ({
  useSession: () => useSessionMock(),
}))

describe('Profile settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionMock.mockReset()
  })

  it('prefills form inputs with session data', () => {
    useSessionMock.mockReturnValue({
      data: {
        user: {
          name: 'Jane',
          surname: 'Doe',
          phone: '123456789',
        },
      },
    })

    render(<Profile />)

    const nameInput = screen.getByLabelText<HTMLInputElement>(/Nombre/i)
    const surnameInput = screen.getByLabelText<HTMLInputElement>(/Apellido/i)
    const phoneInput = screen.getByLabelText<HTMLInputElement>(/Teléfono/i)

    expect(nameInput.value).toBe('Jane')
    expect(surnameInput.value).toBe('Doe')
    expect(phoneInput.value).toBe('123456789')
  })

  it('renders empty inputs when session data unavailable', () => {
    useSessionMock.mockReturnValue({ data: undefined })
    render(<Profile />)

    const nameInput = screen.getByLabelText<HTMLInputElement>(/Nombre/i)
    const surnameInput = screen.getByLabelText<HTMLInputElement>(/Apellido/i)

    expect(nameInput.value).toBe('')
    expect(surnameInput.value).toBe('')
  })
})
