import { createApi } from '@reduxjs/toolkit/query/react';
import axios from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError, AxiosRequestConfig } from 'axios';

const { org, app } = window;
const origin = window.location.origin;

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<{
    url: string;
    method: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    headers?: AxiosRequestConfig['headers'];
  }> =>
  async ({ url, method, data, headers }) => {
    try {
      const result = await axios(baseUrl + url, { method, data, headers });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: { status: err.response?.status, data: err.response?.data },
      };
    }
  };

export enum TagTypes {
  Instances = 'Instances',
  AppLanguage = 'AppLanguage',
}

export const appApi = createApi({
  reducerPath: 'appApi',
  tagTypes: Object.values(TagTypes),
  baseQuery: axiosBaseQuery({
    baseUrl: `${origin}/${org}/${app}`,
  }),
  endpoints: () => ({}),
});
