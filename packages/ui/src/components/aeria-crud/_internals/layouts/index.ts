import type { LayoutName } from '@aeriajs/types'
import AeriaTabular from './aeria-tabular/aeria-tabular.vue'
import AeriaGrid from './aeria-grid/aeria-grid.vue'

export const getLayout = (layoutName: LayoutName) => {
  const defaultLayouts = {
    tabular: AeriaTabular,
    grid: AeriaGrid,
    list: AeriaGrid,
  }

  return defaultLayouts[layoutName]
}
