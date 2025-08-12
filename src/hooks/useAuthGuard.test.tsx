import { renderHook, waitFor } from '@testing-library/react'
import { useAuthGuard } from './useAuthGuard'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('useAuthGuard Hook', () => {
  const mockUseSession = require('next-auth/react').useSession

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns correct state when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    })

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.showLimitedContent).toBe(false)
    expect(result.current.user).toEqual({ email: 'test@example.com' })
  })

  it('returns correct state when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.showLimitedContent).toBe(true)
    expect(result.current.user).toBeUndefined()
  })

  it('returns loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isLoading).toBe(true)
  })

  it('handles requireAuth option correctly', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const mockPush = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    })

    renderHook(() => useAuthGuard({ requireAuth: true }))

    expect(mockPush).toHaveBeenCalledWith('/auth/signin')
  })

  it('does not redirect when requireAuth is false', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const mockPush = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    })

    renderHook(() => useAuthGuard({ requireAuth: false }))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('uses custom redirectTo when provided', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const mockPush = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    })

    renderHook(() => useAuthGuard({ 
      requireAuth: true, 
      redirectTo: '/custom-login' 
    }))

    expect(mockPush).toHaveBeenCalledWith('/custom-login')
  })

  it('disables limited content when showLimitedContent is false', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { result } = renderHook(() => useAuthGuard({ 
      showLimitedContent: false 
    }))

    expect(result.current.showLimitedContent).toBe(false)
  })
})
