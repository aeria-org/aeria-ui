<script setup lang="ts">
import { useStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import AeriaCrud from '../../../components/aeria-crud/aeria-crud.vue'

type Props = {
  collection: string
}

const props = defineProps<Props>()

const metaStore = useStore('meta')
metaStore.view.title = t(props.collection, {
  capitalize: true,
})
</script>

<template>
  <aeria-crud
    v-if="collection"
    :key="collection"
    :collection="collection"
  >
    <template
      v-if="$slots['crud-empty']"
      #empty
    >
      <slot name="crud-empty" />
    </template>
  </aeria-crud>
</template>
