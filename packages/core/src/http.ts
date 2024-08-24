import type { RequestConfig } from '@aeriajs/common'
import type { InstanceConfig } from 'aeria-sdk'
import { request as originalRequest } from 'aeria-sdk/http'
import { API_URL, STORAGE_NAMESPACE } from './constants.js'

export const request = <TResponseType = unknown>(url: string, payload?: unknown, requestConfig?: RequestConfig) => {
  const config: InstanceConfig = {
    publicUrl: API_URL,
    storage: {
      strategy: 'localStorage',
      namespace: STORAGE_NAMESPACE,
    },
  }

  return originalRequest<TResponseType>(config, url, payload, requestConfig)
}

