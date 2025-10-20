import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { vi } from 'vitest'
import ForgotPassword from './index'

const mutate = vi.fn()
const useSearchMock = vi.fn()
const useNavigateMock = vi.fn()

const renderForgotPassword = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ForgotPassword />
    </QueryClientProvider>,
  )
}

vi.mock('./hooks/use-forgot-password', () => ({
  useForgotPassword: () => ({ mutate }),
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: (opts?: unknown) => useSearchMock(opts),
  useNavigate: () => useNavigateMock(),
}))

vi.mock('@frontend/shared/components/turnsile-widget', () => {
  const MockTurnstile = ({
    onSuccess,
  }: {
    onSuccess?: (token: string) => void
  }) => {
    useEffect(() => {
      onSuccess?.('mocked-token')
    }, [onSuccess])
    return <div data-testid="turnstile-mock" />
  }
  return { default: MockTurnstile }
})

describe('ForgotPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockReset()
    useSearchMock.mockReset()
    useSearchMock.mockReturnValue({ email: 'prefilled@example.com' })
  })

  it('prefills the email input with search param', () => {
    renderForgotPassword()
    const input =
      screen.getByPlaceholderText<HTMLInputElement>(/Introduce tu correo/i)
    expect(input.value).toBe('prefilled@example.com')
  })

  it('calls mutate with typed email when clicking send', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    const input = screen.getByPlaceholderText(/Introduce tu correo/i)
    await user.clear(input)
    await user.type(input, 'user@example.com')
    await user.click(
      screen.getByRole('button', {
        name: /Enviar correo de recuperación/i,
      }),
    )

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1)
    })

    const [payload, options] = mutate.mock.calls[0]
    expect(payload).toEqual({
      email: 'user@example.com',
      token: 'mocked-token',
    })
    expect(options).toEqual(
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })
})
