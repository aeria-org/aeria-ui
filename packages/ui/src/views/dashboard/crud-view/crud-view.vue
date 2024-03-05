<script setup lang="ts">
import AeriaCrud from '../../../components/aeria-crud/aeria-crud.vue'

type Props = {
  collection: string
}

defineProps<Props>()
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
