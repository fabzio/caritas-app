import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Passkeys from './passkeys'

const addMutate = vi.fn()
const removeMutate = vi.fn()
const useListPasskeysMock = vi.fn()

vi.mock(
  '@frontend/modules/settings/pages/authentication/hooks/use-add-passkey',
  () => ({
    useAddPasskey: () => ({ mutate: addMutate }),
  }),
)

vi.mock(
  '@frontend/modules/settings/pages/authentication/hooks/use-remove-passkey',
  () => ({
    useRemovePasskey: () => ({ mutate: removeMutate }),
  }),
)

vi.mock(
  '@frontend/modules/settings/pages/authentication/hooks/use-list-passkeys',
  () => ({
    useListPasskeys: (opts?: unknown) => useListPasskeysMock(opts),
  }),
)

describe('Passkeys component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addMutate.mockReset()
    removeMutate.mockReset()
    useListPasskeysMock.mockReset()
  })

  it('displays empty state when no passkeys', () => {
    useListPasskeysMock.mockReturnValue({ data: [] })
    render(<Passkeys />)

    expect(
      screen.getByText(/No se configuraron llaves de acceso aún/i),
    ).toBeTruthy()
  })

  it('triggers add passkey when clicking add button', async () => {
    useListPasskeysMock.mockReturnValue({ data: [] })
    const user = userEvent.setup()
    render(<Passkeys />)

    const addButton = screen.getByRole('button', {
      name: /Agregar Llave de Acceso/i,
    })
    await user.click(addButton)

    expect(addMutate).toHaveBeenCalledTimes(1)
  })

  it('lists passkeys and allows removal', async () => {
    useListPasskeysMock.mockReturnValue({
      data: [
        { id: '1', name: 'Laptop' },
        { id: '2', name: 'Phone' },
      ],
    })
    const user = userEvent.setup()
    render(<Passkeys />)

    expect(screen.getByText('Laptop')).toBeTruthy()
    expect(screen.getByText('Phone')).toBeTruthy()

    const addButton = screen.getByRole('button', {
      name: /Agregar Llave de Acceso/i,
    })
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find((btn) => btn !== addButton)
    if (!deleteButton) throw new Error('Delete button not found')

    await user.click(deleteButton)
    expect(removeMutate).toHaveBeenCalledWith('1')
  })
})
