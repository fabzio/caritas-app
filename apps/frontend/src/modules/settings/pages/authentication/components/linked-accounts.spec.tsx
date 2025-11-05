import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import LinkedAccounts from './linked-accounts'

const mutate = vi.fn()
const useLinkedAccountsMock = vi.fn()

vi.mock(
  '@frontend/modules/settings/pages/authentication/hooks/use-link-google',
  () => ({
    useLinkGoogle: () => ({ mutate }),
  }),
)

vi.mock(
  '@frontend/modules/settings/pages/authentication/hooks/use-linked-accounts',
  () => ({
    useLinkedAccounts: (opts?: unknown) => useLinkedAccountsMock(opts),
  }),
)

describe('LinkedAccounts component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLinkedAccountsMock.mockReset()
    mutate.mockReset()
  })

  it('renders a disabled button when Google account is already linked', () => {
    useLinkedAccountsMock.mockReturnValue({
      data: [{ providerId: 'google' }],
    })
    render(<LinkedAccounts />)

    const button = screen.getByRole('button', {
      name: /Cuenta de Google Vinculada/i,
    }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('allows linking Google account when not linked', async () => {
    useLinkedAccountsMock.mockReturnValueOnce({
      data: [],
    })
    const user = userEvent.setup()
    render(<LinkedAccounts />)

    const button = screen.getByRole('button', {
      name: /Vincular Cuenta de Google/i,
    })
    await user.click(button)

    expect(mutate).toHaveBeenCalledTimes(1)
  })
})
