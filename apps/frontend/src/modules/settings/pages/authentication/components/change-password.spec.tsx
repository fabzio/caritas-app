import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ChangePassword from './change-password'

const mutate = vi.fn()

vi.mock('@frontend/modules/settings/hooks/use-change-password', () => ({
  useChangePassword: () => ({ mutate }),
}))

vi.mock('@frontend/shared/components/password-strength-bar', () => ({
  __esModule: true,
  default: () => <div data-testid="password-strength" />,
}))

describe('ChangePassword component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits form with current and new password', async () => {
    const user = userEvent.setup()
    render(<ChangePassword />)

    await user.type(
      screen.getByLabelText(/Contraseña Actual/i),
      'OldPassword1!',
    )
    await user.type(
      screen.getByLabelText('Nueva Contraseña', { exact: true }),
      'NewPassword1!',
    )
    await user.type(
      screen.getByLabelText(/Confirmar Nueva Contraseña/i),
      'NewPassword1!',
    )

    await user.click(
      screen.getByRole('button', { name: /Cambiar Contraseña/i }),
    )

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1)
      expect(mutate).toHaveBeenCalledWith({
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
      })
    })
  })
})
