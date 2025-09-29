import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ResetPassword from './index'

const mutate = vi.fn()
const useSearchMock = vi.fn()

vi.mock('./hooks/use-reset-password', () => ({
  useResetPassword: () => ({ mutate }),
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: (opts?: unknown) => useSearchMock(opts),
}))

describe('ResetPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockReset()
    useSearchMock.mockReset()
    useSearchMock.mockReturnValue({
      email: 'reset@example.com',
      otp: '123456',
    })
  })

  it('submits form with new password and otp', async () => {
    const user = userEvent.setup()
    render(<ResetPassword />)

    await user.type(
      screen.getByLabelText('Nueva Contraseña', { exact: true }),
      'Password1!',
    )
    await user.type(
      screen.getByLabelText(/Confirmar Nueva Contraseña/i),
      'Password1!',
    )

    await user.click(
      screen.getByRole('button', { name: /Restablecer Contraseña/i }),
    )

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1)
      expect(mutate).toHaveBeenCalledWith({
        email: 'reset@example.com',
        otp: '123456',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })
    })
  })
})
