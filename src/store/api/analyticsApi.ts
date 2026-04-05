import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type DateArray = [number, number, number]

export type CsvAnalyticsResponse = {
  kpi: {
    totalOrders?: number | null
    totalRevenue?: number | null
    avgRevenuePerOrder?: number | null
  }
  daily: Array<{
    date?: DateArray | string | null
    revenue?: number | null
  }>
  monthly: Array<{
    date?: DateArray | string | null
    revenue?: number | null
  }>
  byCode: Array<{
    code?: string | null
    revenue?: number | null
  }>
  detail: Array<{
    orderDate?: DateArray | string | null
    code?: string | null
    orders?: number | null
    revenue?: number | null
    revenuePerOrder?: number | null
  }>
}

export type AdscribeAnalyticsDetail = {
  orderDate?: DateArray | string | null
  date?: DateArray | string | null
  client?: string | null
  show?: string | null
  orders?: number | null
  revenue?: number | null
  impressions?: number | null
  revenuePerOrder?: number | null
  avgRevenuePerOrder?: number | null
  avgRevenuePerImpression?: number | null
  avgImpressionsPerOrder?: number | null
  [key: string]: string | number | DateArray | null | undefined
}

export type AdscribeAnalyticsResponse = {
  kpi: {
    totalRevenue?: number | null
    totalOrders?: number | null
    totalImpressions?: number | null
    avgRevenuePerOrder?: number | null
    avgRevenuePerImpression?: number | null
    avgImpressionsPerOrder?: number | null
  }
  daily: Array<{
    date?: DateArray | string | null
    revenue?: number | null
  }>
  byClient: Array<{
    client?: string | null
    revenue?: number | null
  }>
  topShows: Array<{
    show?: string | null
    revenue?: number | null
  }>
  detail: AdscribeAnalyticsDetail[]
}

export type CsvAnalyticsArgs = {
  client?: 'alpha' | 'beta' | 'gamma'
}

export type AdscribeAnalyticsArgs = {
  startDate: string
  endDate?: string
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getCsvAnalytics: builder.query<CsvAnalyticsResponse, CsvAnalyticsArgs | void>({
      query: (args) => ({
        url: '/api/analytics',
        params: args?.client ? { client: args.client } : undefined,
      }),
      providesTags: ['Analytics'],
    }),
    getAdscribeAnalytics: builder.query<
      AdscribeAnalyticsResponse,
      AdscribeAnalyticsArgs
    >({
      query: ({ startDate, endDate }) => ({
        url: '/api/adscribe/analytics',
        params: {
          startDate,
          ...(endDate ? { endDate } : {}),
        },
      }),
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetCsvAnalyticsQuery,
  useGetAdscribeAnalyticsQuery,
} = analyticsApi

