export const PAGINATION_PER_PAGE_LIMIT = 150
export const PAGINATION_PER_PAGE_DEFAULTS = [
  10,
  35,
  100,
  150,
]

export const PAGINATION_PER_PAGE_DEFAULT = 10

export const API_URL = import.meta.env?.AERIA_API_URL || (process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : '/api')

export const STORAGE_NAMESPACE = import.meta.env?.AERIA_STORAGE_NAMESPACE || 'aeria'

