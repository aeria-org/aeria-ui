import {
  formatDateTime,
  getRelativeTimeFromNow,
  arraysIntersect,

} from '@aeriajs/common'

import { useStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

const hasRoles = (roles: string | string[]) => {
  const userStore = useStore('user')
  return arraysIntersect(roles, userStore.currentUser.roles)
}

/**
 * Modify postinstall script everytime you change those.
 * A bit of manual work, but types won't work otherwise.
 * @link web/src/__scripts__/postinstall.ts
 */
export const templateFunctions = {
  formatDateTime,
  getRelativeTimeFromNow,
  hasRoles,
  t,
}

export type TemplateFunctions = typeof templateFunctions
