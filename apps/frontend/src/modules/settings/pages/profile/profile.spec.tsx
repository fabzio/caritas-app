import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Profile from './index'

const useSessionMock = vi.fn()
const useGetStudentMock = vi.fn()
const useSetStudentMock = vi.fn()
const useUpdateStudentMock = vi.fn()
const useGetPatientMock = vi.fn()
const useSetPatientMock = vi.fn()
const useUpdatePatientMock = vi.fn()

vi.mock('@frontend/hooks/use-session', () => ({
  useSession: () => useSessionMock(),
}))

vi.mock('./hooks/use-get-student', () => ({
  useGetStudent: () => useGetStudentMock(),
}))

vi.mock('./hooks/use-set-student', () => ({
  useSetStudent: () => useSetStudentMock(),
}))

vi.mock('./hooks/use-update-student', () => ({
  useUpdateStudent: () => useUpdateStudentMock(),
}))

vi.mock('./hooks/use-get-patient', () => ({
  useGetPatient: () => useGetPatientMock(),
}))

vi.mock('./hooks/use-set-patient', () => ({
  useSetPatient: () => useSetPatientMock(),
}))

vi.mock('./hooks/use-update-patient', () => ({
  useUpdatePatient: () => useUpdatePatientMock(),
}))

vi.mock('@workspace/ui/components/spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}))

describe('Profile settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionMock.mockReset()
    useGetStudentMock.mockReset()
    useSetStudentMock.mockReset()
    useUpdateStudentMock.mockReset()
    useGetPatientMock.mockReset()
    useSetPatientMock.mockReset()
    useUpdatePatientMock.mockReset()

    useGetStudentMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
    useSetStudentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    useUpdateStudentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    useGetPatientMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
    useSetPatientMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    useUpdatePatientMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    useSessionMock.mockReturnValue({ data: undefined })
  })

  it('prefills form inputs with session data', () => {
    useSessionMock.mockReturnValue({
      data: {
        user: {
          name: 'Jane',
          surname: 'Doe',
          phone: '123456789',
        },
      },
    })

    render(<Profile />)

    const nameInput = screen.getByLabelText<HTMLInputElement>(/Nombre/i)
    const surnameInput = screen.getByLabelText<HTMLInputElement>(/Apellido/i)
    const phoneInput = screen.getByLabelText<HTMLInputElement>(/Teléfono/i)

    expect(nameInput.value).toBe('Jane')
    expect(surnameInput.value).toBe('Doe')
    expect(phoneInput.value).toBe('123456789')
  })

  it('renders empty inputs when session data unavailable', () => {
    useSessionMock.mockReturnValue({ data: undefined })
    render(<Profile />)

    const nameInput = screen.getByLabelText<HTMLInputElement>(/Nombre/i)
    const surnameInput = screen.getByLabelText<HTMLInputElement>(/Apellido/i)

    expect(nameInput.value).toBe('')
    expect(surnameInput.value).toBe('')
  })

  it('renders student and health sections', () => {
    useSessionMock.mockReturnValue({ data: undefined })

    render(<Profile />)

    const studentSectionHeading = screen.getByRole('heading', {
      name: /Datos de Estudiante/i,
    })
    const healthSectionHeading = screen.getByRole('heading', {
      name: /Datos de Salud/i,
    })

    expect(studentSectionHeading).toBeDefined()
    expect(healthSectionHeading).toBeDefined()
  })
})
