import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import Welcome from './index'

vi.mock('@workspace/ui/components/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('./components/organization-stepper', () => ({
  __esModule: true,
  default: () => <div data-testid="org-stepper" />,
}))

vi.mock('./components/person-stepper', () => ({
  __esModule: true,
  default: () => <div data-testid="person-stepper" />,
}))

describe('Welcome page', () => {
  it('renders both organization and person steppers', () => {
    render(<Welcome />)

    expect(screen.getByText(/¡Gracias por unirte a nosotros!/i)).toBeTruthy()
    expect(screen.getByTestId('tabs-list')).toBeTruthy()
    expect(screen.getByTestId('org-stepper')).toBeTruthy()
    expect(screen.getByTestId('person-stepper')).toBeTruthy()
  })
})
