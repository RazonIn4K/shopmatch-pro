import { renderHook, act } from '@testing-library/react';
import { useLogin } from './useLogin';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock external dependencies
jest.mock('@/lib/contexts/AuthContext');
jest.mock('next/navigation');
jest.mock('sonner');

describe('useLogin', () => {
  const mockSignin = jest.fn();
  const mockSigninWithGoogle = jest.fn();
  const mockClearError = jest.fn();
  const mockPush = jest.fn();
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signin: mockSignin,
      signinWithGoogle: mockSigninWithGoogle,
      error: null,
      loading: false,
      clearError: mockClearError,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (toast.success as jest.Mock) = mockToastSuccess;
    (toast.error as jest.Mock) = mockToastError;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.form.getValues().email).toBe('');
    expect(result.current.form.getValues().password).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.authError).toBe(null);
  });

  it('should handle email login successfully', async () => {
    mockSignin.mockResolvedValue(true);
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
      await result.current.handleEmailLogin({ preventDefault: jest.fn() } as React.FormEvent);
    });

    expect(mockSignin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockToastSuccess).toHaveBeenCalledWith('Signed in successfully!');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle email login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockSignin.mockRejectedValue(new Error(errorMessage));
    (useAuth as jest.Mock).mockReturnValue({
      signin: mockSignin,
      signinWithGoogle: mockSigninWithGoogle,
      error: errorMessage, // Simulate error being set by AuthContext
      loading: false,
      clearError: mockClearError,
    });

    const { result, rerender } = renderHook(() => useLogin());

    await act(async () => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'wrongpassword');
      await result.current.handleEmailLogin({ preventDefault: jest.fn() } as React.FormEvent);
    });

    rerender(); // Rerender to pick up the updated authError from mockReturnValue

    expect(mockSignin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle Google login successfully', async () => {
    mockSigninWithGoogle.mockResolvedValue(true);
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleGoogleLogin();
    });

    expect(mockSigninWithGoogle).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith('Signed in successfully!');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should display authError from context as inline error', () => {
    (useAuth as jest.Mock).mockReturnValue({ signin: mockSignin, signinWithGoogle: mockSigninWithGoogle, error: 'Network error', loading: false, clearError: mockClearError });
    const { result } = renderHook(() => useLogin());
    expect(result.current.authError).toBe('Network error');
  });
});