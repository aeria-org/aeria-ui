declare const localStorage: undefined | {
  getItem?: unknown
  setItem?: unknown
  removeItem?: unknown
}

export const isLocalStorageAvailable = () => {
  return typeof localStorage === 'object'
    && localStorage
    && typeof localStorage.getItem === 'function'
    && typeof localStorage.setItem === 'function'
    && typeof localStorage.removeItem === 'function'
}

