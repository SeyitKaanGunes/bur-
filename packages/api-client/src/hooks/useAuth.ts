import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, RegisterInput, LoginInput } from '@burcum/shared';
import { apiClient } from '../client';

export function useUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get<User>('/auth/me'),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => apiClient.post<User>('/auth/login', data),
    onSuccess: (data) => {
      // Login response zaten user verisini döndürüyor, cache'e direkt yaz
      queryClient.setQueryData(['auth', 'me'], data);
      // Ayrıca invalidate et ki bir sonraki erişimde taze veri gelsin
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => apiClient.post<User>('/auth/register', data),
    onSuccess: (data) => {
      // Register response zaten user verisini döndürüyor, cache'e direkt yaz
      queryClient.setQueryData(['auth', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/delete-account'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => apiClient.post('/auth/verify-email', { token }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      apiClient.post('/auth/reset-password', data),
  });
}

export function useAuth() {
  const user = useUser();
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();

  return {
    user: user.data?.data,
    isLoading: user.isLoading,
    isAuthenticated: !!user.data?.data,
    login,
    register,
    logout,
    deleteAccount,
  };
}
