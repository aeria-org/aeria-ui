<script setup lang="ts">
import type { LayoutOptions, CollectionAction } from '@aeriajs/types'
import { computed } from 'vue'
import { getStoreId } from '@aeria-ui/state-management'
import { useParentCollectionStore } from '@aeria-ui/core'
import AeriaTable from '../../../../aeria-table/aeria-table.vue'

type Props = {
  individualActions?: (CollectionAction<any> & {
    action: string
    click: ()=> void
  })[]
  layoutOptions: LayoutOptions
  componentProps?: Record<string, unknown>
}

const props = defineProps<Props>()
const store = useParentCollectionStore()

const storeId = getStoreId()
const componentProps = computed(() => {
  const original = {
    collection: storeId!,
    checkbox: store.hasSelectionActions,
    columns: store.tableProperties,
    rows: store.items,
    actions: props.individualActions,
    layout: store.tableLayout,
  }

  return Object.assign(original, props.componentProps)
})
</script>

<template>
  <div>
    <slot
      v-if="$slots.inner"
      name="inner"
    />
    <aeria-table
      v-if="store.properties"
      v-bind="componentProps"
      :key="store.$id"
    >
      <template
        v-for="slotName in Object.keys($slots).filter(key => !['inner'].includes(key))"
        #[slotName]="slotProps"
      >
        <slot
          v-bind="slotProps"
          :name="slotName"
        />
      </template>
    </aeria-table>
  </div>
</template>
