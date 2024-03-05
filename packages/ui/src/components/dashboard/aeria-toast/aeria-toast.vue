<script setup lang="ts">
import type { Icon } from '@aeriajs/types'
import { useStore } from '@aeria-ui/state-management'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'

type Props = {
  idx: number
  itr: number
  date: string
  icon?: Icon
}

defineProps<Props>()

const metaStore = useStore('meta')
</script>

<template>
  <div
    v-clickable
    :class="{
      'toast': true,
      'toast--animate': metaStore.toasts[0].itr === itr
    }"
    @animationend="metaStore.$actions.popToast()"
    @click="metaStore.$actions.popToast(itr)"
  >
    <aeria-icon
      v-bind="
        icon
          ? { icon }
          : { icon: 'warning-circle' }
      "
      style="
        --icon-size: 4rem;
        --icon-color: var(--theme-brand-color-shade-3);
      "
    />

    <div class="toast__content">
      <slot />

      <div class="toast__time">
        {{ formatDateTime(date, { hoursOnly: true }) }}
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-toast.less"></style>
