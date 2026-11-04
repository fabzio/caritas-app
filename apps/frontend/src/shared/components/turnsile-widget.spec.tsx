import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import TurnstileWidget from './turnsile-widget'

vi.mock('@frontend/env', () => ({
  env: { VITE_CLOUDFLARE_TURNSTILE_SITE_KEY: 'test-site-key' },
}))

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => <div data-testid="turnstile-widget" />,
}))

vi.mock('./theme-provider', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

it('skips the challenge and succeeds automatically in development', async () => {
  vi.stubEnv('MODE', 'development')
  const onSuccess = vi.fn()
  const { container } = render(<TurnstileWidget onSuccess={onSuccess} />)

  expect(container.firstChild).toBeNull()
  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith('development-bypass')
  })
})

it('renders the challenge outside development', () => {
  vi.stubEnv('MODE', 'production')
  const { container } = render(<TurnstileWidget onSuccess={vi.fn()} />)

  expect(
    container.querySelector('[data-testid="turnstile-widget"]'),
  ).not.toBeNull()
})
