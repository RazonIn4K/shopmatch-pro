import { renderHook, act } from '@testing-library/react';
import { usePasswordReset } from './usePasswordReset';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

// Mock external dependencies
jest.mock('@/lib/contexts/AuthContext');
jest.mock('sonner');

describe('usePasswordReset', () => {
  const mockResetPassword = jest.fn();
  const mockClearError = jest.fn();
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      error: null,
      loading: false, // Global loading is not used for reset, but mock it anyway
      clearError: mockClearError,
    });
    (toast.success as jest.Mock) = mockToastSuccess;
    (toast.error as jest.Mock) = mockToastError;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePasswordReset());

    expect(result.current.form.getValues().email).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle password reset successfully', async () => {
    mockResetPassword.mockResolvedValue(true);
    const { result } = renderHook(() => usePasswordReset());

    await act(async () => {
      result.current.form.setValue('email', 'test@example.com');
      await result.current.handlePasswordReset({ preventDefault: jest.fn() } as React.FormEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    expect(mockToastSuccess).toHaveBeenCalledWith('Password reset link sent! Check your inbox.');
    expect(result.current.form.getValues().email).toBe(''); // Form should be reset
  });

  it('should handle password reset failure', async () => {
    const errorMessage = 'User not found';
    mockResetPassword.mockRejectedValue(new Error(errorMessage));
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      error: errorMessage, // Simulate error being set by AuthContext
      loading: false,
      clearError: mockClearError,
    });

    const { result, rerender } = renderHook(() => usePasswordReset());

    await act(async () => {
      result.current.form.setValue('email', 'nonexistent@example.com');
      await result.current.handlePasswordReset({ preventDefault: jest.fn() } as React.FormEvent);
    });

    rerender(); // Rerender to pick up the updated authError from mockReturnValue

    expect(result.current.isLoading).toBe(false);
    expect(mockResetPassword).toHaveBeenCalledWith('nonexistent@example.com');
    expect(mockToastError).toHaveBeenCalledWith(errorMessage);
  });

  it('should call clearAuthError when exposed', () => {
    const { result } = renderHook(() => usePasswordReset());
    act(() => {
      result.current.clearAuthError();
    });
    expect(mockClearError).toHaveBeenCalled();
  });
});