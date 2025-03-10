import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { getEnvironmentLoginUrl } from 'src/utils/urls/appUrlHelper';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const redirectToLogin = (appOidcProvider: string | null): void => {
  window.location.href = getEnvironmentLoginUrl(appOidcProvider);
};

export const useRefreshJwtTokenQuery = (
  appOidcProvider: string | null,
  options: {
    enabled: boolean;
    refetchOnWindowFocus: boolean;
    refetchInterval: number;
  },
): UseQueryResult<void> => {
  const { fetchRefreshJwtToken } = useAppQueries();
  return useQuery(['refreshJwtToken'], fetchRefreshJwtToken, {
    ...options,
    onError: (error: HttpClientError) => {
      try {
        redirectToLogin(appOidcProvider || null);
      } catch {
        console.error(error);
      }
    },
  });
};
