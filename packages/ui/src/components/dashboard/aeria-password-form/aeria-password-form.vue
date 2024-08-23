<script setup lang="ts">
import { usePasswordPolicy } from '@aeria-ui/core'
import { STORE_ID } from '@aeria-ui/state-management'
import { computed, provide } from 'vue'
import AeriaForm from '../../form/aeria-form/aeria-form.vue'

type Props = {
  modelValue: Record<string, unknown> & {
    password: string
    confirmation: string
  }
}

const props = defineProps<Props>()
provide(STORE_ID, null)

defineEmits<{
  (e: 'update:modelValue', value: Props['modelValue']): void
}>()

const passwordPolicy = usePasswordPolicy()

const passwordError = computed(() => {
  return passwordPolicy(
    props.modelValue.password,
    props.modelValue.confirmation,
  )
})
</script>

<template>
  <aeria-form
    :form="{
      password: {
        type: 'string',
        icon: 'key',
        inputType: 'password'
      },
      confirmation: {
        type: 'string',
        icon: 'key',
        inputType: 'password'
      },
    }"

    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #after>
      <div>
        {{ passwordError || 'Senhas conferem' }}
      </div>

      <slot v-bind="{ passwordError }" />
    </template>
  </aeria-form>
</template>

