import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Authentication from './index'

vi.mock('./components/change-password', () => ({
  __esModule: true,
  default: () => <div data-testid="change-password-section" />,
}))

vi.mock('./components/linked-accounts', () => ({
  __esModule: true,
  default: () => <div data-testid="linked-accounts-section" />,
}))

vi.mock('./components/passkeys', () => ({
  __esModule: true,
  default: () => <div data-testid="passkeys-section" />,
}))

describe('Authentication settings page', () => {
  it('renders all authentication sections', () => {
    render(<Authentication />)

    expect(screen.getByText(/Contraseña/i)).toBeTruthy()
    expect(screen.getByText(/Cuentas Vinculadas/i)).toBeTruthy()
    expect(screen.getByText(/Llaves de Acceso/i)).toBeTruthy()

    expect(screen.getByTestId('change-password-section')).toBeTruthy()
    expect(screen.getByTestId('linked-accounts-section')).toBeTruthy()
    expect(screen.getByTestId('passkeys-section')).toBeTruthy()
  })
})
