<script setup lang="ts">
import { watch } from 'vue'
import { useStore, getGlobalStateManager } from '@aeria-ui/state-management'
import AeriaInsertPanel from '../../../../components/aeria-insert-panel/aeria-insert-panel.vue'

type Props = {
  collection: string
  id: string
  section?:
    | 'edit'
}

const props = defineProps<Props>()
const manager = getGlobalStateManager()

watch(() => [props.collection, props.id], () => {
  const store = useStore(props.collection, manager)
  store.$actions.get({
    filters: {
      _id: props.id,
    },
  })
}, {
  immediate: true,
})
</script>

<template>
  <aeria-insert-panel
    :key="id"
    bordered
    rounded
    :collection="collection"
    :read-only="section !== 'edit'"
    style="--panel-max-width: 40rem;"
  />
</template>

