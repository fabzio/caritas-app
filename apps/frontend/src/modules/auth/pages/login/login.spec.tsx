import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { vi } from 'vitest'
import FormLogin from './index'

const mutate = vi.fn()
let isPending = false

vi.mock('@frontend/modules/auth/pages/login/hooks/use-login', () => ({
  useLogin: (_redirect: string) => ({ mutate, isPending }),
}))

vi.mock('@frontend/modules/auth/pages/login/hooks/use-google', () => ({
  useGoogle: () => ({ mutate, isPending }),
}))

vi.mock('@frontend/modules/auth/pages/login/hooks/use-passkey', () => ({
  usePasskey: () => ({ mutate, isPending }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useSearch: (_opts?: unknown) => ({ redirect: '/dashboard' }),
}))

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    React.useEffect(() => {
      onSuccess('mocked-token')
    }, [onSuccess])
    return <div data-testid="turnstile-mock">Turnstile Mock</div>
  },
}))

describe('Login form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isPending = false
  })

  it('does not call mutate when submitting empty/invalid form', async () => {
    const user = userEvent.setup()
    const { container } = render(<FormLogin />)

    const submit = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    await user.click(submit)

    await waitFor(() => {
      expect(mutate).not.toHaveBeenCalled()
    })
  })

  it('calls mutate with correct payload for valid inputs', async () => {
    const user = userEvent.setup()
    const { container } = render(<FormLogin />)

    const email = screen.getByLabelText(/Correo/i)
    const password = screen.getByLabelText(/Contraseña/i)
    const submit = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement

    await user.type(email, 'user@example.com')
    await user.type(password, 'secret12')
    await user.click(submit)

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1)
      expect(mutate).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret12',
        rememberMe: false,
        token: 'mocked-token',
      })
    })
  })

  it('includes rememberMe when checkbox is checked', async () => {
    const user = userEvent.setup()
    const { container } = render(<FormLogin />)

    const email = screen.getByLabelText(/Correo/i)
    const password = screen.getByLabelText(/Contraseña/i)
    const remember = screen.getByLabelText(/Recuérdame/i)
    const submit = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement

    await user.type(email, 'user2@example.com')
    await user.type(password, 'secret34')
    await user.click(remember)
    await user.click(submit)

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        email: 'user2@example.com',
        password: 'secret34',
        rememberMe: true,
        token: 'mocked-token',
      })
    })
  })

  it('disables submit button when isPending is true', () => {
    isPending = true
    const { container } = render(<FormLogin />)

    const submit = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
  })
})
