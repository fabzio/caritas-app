import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ForgotPassword from './index'

const mutate = vi.fn()
const useSearchMock = vi.fn()

vi.mock('./hooks/use-forgot-password', () => ({
  useForgotPassword: () => ({ mutate }),
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: (opts?: unknown) => useSearchMock(opts),
}))

describe('ForgotPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockReset()
    useSearchMock.mockReset()
    useSearchMock.mockReturnValue({ email: 'prefilled@example.com' })
  })

  it('prefills the email input with search param', () => {
    render(<ForgotPassword />)
    const input =
      screen.getByPlaceholderText<HTMLInputElement>(/Introduce tu correo/i)
    expect(input.value).toBe('prefilled@example.com')
  })

  it('calls mutate with typed email when clicking send', async () => {
    const user = userEvent.setup()
    render(<ForgotPassword />)

    const input = screen.getByPlaceholderText(/Introduce tu correo/i)
    await user.clear(input)
    await user.type(input, 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Enviar/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1)
      expect(mutate).toHaveBeenCalledWith('user@example.com')
    })
  })
})
