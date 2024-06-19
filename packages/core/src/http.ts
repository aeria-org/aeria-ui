import type { RequestConfig } from '@aeriajs/common'
import type { InstanceConfig } from 'aeria-sdk'
import { request as originalRequest } from 'aeria-sdk/http'
import { API_URL, STORAGE_NAMESPACE } from './constants.js'

export const request = <ResponseType = any>(url: string, payload?: any, requestConfig?: RequestConfig) => {
  const config: InstanceConfig = {
    publicUrl: API_URL,
    storage: {
      strategy: 'localStorage',
      namespace: STORAGE_NAMESPACE,
    },
  }

  return originalRequest<ResponseType>(config, url, payload, requestConfig)
}

