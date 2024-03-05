import {
  formatDateTime,
  getRelativeTimeFromNow,
  arraysIntersects,

} from '@aeriajs/common'

import { useStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

const hasRoles = (roles: string | string[]) => {
  const userStore = useStore('user')
  return arraysIntersects(roles, userStore.currentUser.roles)
}

export const templateFunctions = {
  formatDateTime,
  getRelativeTimeFromNow,
  hasRoles,
  t,
}

export type TemplateFunctions = typeof templateFunctions
