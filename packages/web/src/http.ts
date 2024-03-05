import type { RequestConfig } from '@aeriajs/common'
import { request as originalRequest, type InstanceConfig } from 'aeria-sdk'
import { API_URL, STORAGE_NAMESPACE } from './constants.js'

export const request = <Return = any>(url: string, payload?: any, requestConfig?: RequestConfig) => {
  const config: InstanceConfig = {
    apiUrl: API_URL,
    storage: {
      strategy: 'localStorage',
      namespace: STORAGE_NAMESPACE,
    },
  }

  return originalRequest<Return>(config, url, payload, requestConfig)
}
