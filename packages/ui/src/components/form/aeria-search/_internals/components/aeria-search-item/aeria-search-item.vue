<script setup lang="ts">
import type { SearchProperty } from '../../../../types'
import { getReferenceProperty } from '@aeriajs/common'
import { computed } from 'vue'
import { useParentStore } from '@aeria-ui/state-management'

type Props = {
  item: Record<string, any>
  indexes: readonly string[]
  modelValue?: any
  property: SearchProperty
}

type Emits = {
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'change', value: Props['item']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const property = props.property
const refProperty = getReferenceProperty(property)!
const store = useParentStore()

const isAlreadySelected = computed(() => {
  if( Array.isArray(props.modelValue) ) {
    return Array.isArray(props.modelValue)
      && Object.values(props.modelValue).some(({ _id: itemId }) => props.item._id === itemId)
  }

  return props.modelValue
    && props.modelValue._id === props.item._id
})

const select = () => {
  if( isAlreadySelected.value ) {
    return
  }

  const filterEmpties = (array: any[]) => array.filter((e) => !!e?._id)
  const modelValue = 'items' in property
    ? filterEmpties(Array.isArray(props.modelValue)
? props.modelValue
: [props.modelValue])
    : props.modelValue

  emit('update:modelValue', Array.isArray(modelValue)
    ? [
 ...modelValue,
props.item,
]
    : props.item)

  emit('change', props.item)
}

const deselect = async (options?: { purge?: true }) => {
  if( refProperty.purge && options?.purge ) {
    const { _id: itemId } = props.item
    await store.$actions.remove({
 filters: {
 _id: itemId,
},
})
  }

  const deleteFirst = () => {
    const modelValue = [ ...props.modelValue ]
    const idx = modelValue.findIndex((option: any) => option._id === props.item._id)

    modelValue.splice(idx, 1)
    return modelValue
  }

  emit('update:modelValue', 'items' in property
    ? deleteFirst()
    : null)
}
</script>

<template>
  <div
    v-clickable
    :class="{
      'item': true,
      'item--selected': isAlreadySelected
    }"

    @click="isAlreadySelected
      ? deselect()
      : select()"
  >
    <slot />

    <div class="item__values">
      <div
        v-for="(index, idx) in indexes"
        :key="`index-${item._id}-${idx}`"
        class="item__value"
      >
        {{ item[index] }}
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-search-item.less"></style>
