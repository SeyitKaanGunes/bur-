import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ZodiacSign, HoroscopeReading, CompatibilityResult, ReadingType } from '@burcum/shared';
import { apiClient } from '../client';

export function useDailyHoroscope(sign: ZodiacSign | undefined) {
  return useQuery({
    queryKey: ['horoscope', 'daily', sign],
    queryFn: () => apiClient.get<HoroscopeReading>(`/horoscope/daily/${sign}`),
    enabled: !!sign,
    staleTime: 1000 * 60 * 60, // 1 saat
    gcTime: 1000 * 60 * 60 * 24, // 24 saat
  });
}

export function useWeeklyHoroscope(sign: ZodiacSign | undefined) {
  return useQuery({
    queryKey: ['horoscope', 'weekly', sign],
    queryFn: () => apiClient.get<HoroscopeReading>(`/horoscope/weekly/${sign}`),
    enabled: !!sign,
    staleTime: 1000 * 60 * 60 * 24, // 24 saat
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 gün
  });
}

export function useMonthlyHoroscope(sign: ZodiacSign | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['horoscope', 'monthly', sign],
    queryFn: () => apiClient.get<HoroscopeReading>(`/horoscope/monthly/${sign}`),
    enabled: !!sign && enabled,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 gün
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 gün
    retry: false, // Premium gerektiren endpoint için retry yapma
  });
}

export function useYearlyHoroscope(sign: ZodiacSign | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['horoscope', 'yearly', sign],
    queryFn: () => apiClient.get<HoroscopeReading>(`/horoscope/yearly/${sign}`),
    enabled: !!sign && enabled,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 gün
    gcTime: 1000 * 60 * 60 * 24 * 365, // 365 gün
    retry: false, // Premium gerektiren endpoint için retry yapma
  });
}

export function useHoroscope(sign: ZodiacSign | undefined, type: ReadingType) {
  const hooks = {
    daily: useDailyHoroscope,
    weekly: useWeeklyHoroscope,
    monthly: useMonthlyHoroscope,
    yearly: useYearlyHoroscope,
  };

  return hooks[type](sign);
}

export function useCompatibility() {
  return useMutation({
    mutationFn: (data: { sign1: ZodiacSign; sign2: ZodiacSign }) =>
      apiClient.post<CompatibilityResult>('/compatibility', data),
  });
}

export function usePersonalReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) =>
      apiClient.post('/horoscope/personal', { question }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-readings'] });
    },
  });
}
