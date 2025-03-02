<script setup lang="ts">
import type { MenuNode } from 'aeria-ui'
import { t } from '@aeria-ui/i18n'
import { AeriaIcon, AeriaBadge, AeriaAsync } from '@aeria-ui/ui'
import { isCurrent, memoizeBadge, isCollapsibleRouteOpen } from '@aeria-ui/theme'
import { onMounted, ref } from 'vue'

type Props = {
  item: MenuNode
  memoKey: string
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

let badgePromise: Promise<unknown> | undefined
const badgeReady = ref(false)

onMounted(() => {
  if( props.item.badge ) {
    badgePromise = memoizeBadge(props.item.badge, props.memoKey)
    badgePromise.then(() => {
      badgeReady.value = true
    })
  }
})
</script>

<template>
  <div
    :class="[
      'navbar__route',
      { 'navbar__route--current': isCurrent(item) },
      { 'navbar__route--sub': level > 0  },
    ]"

    :style="`--level-padding: ${level};`"
  >
    <aeria-icon
      :icon="item.meta!.icon!"
      style="
        --icon-size: 1.2rem;
        --icon-color: var(--theme-brand-color-shade-2);
      "
    >
      {{ t(item.meta!.title, { plural: true, capitalize: true }) }}
    </aeria-icon>

    <aeria-badge v-if="item.badge && badgeReady" alt>
      <aeria-async :promise="badgePromise"></aeria-async>
    </aeria-badge>

    <div v-if="'collapsed' in item">
      <aeria-icon v-if="isCollapsibleRouteOpen(item)" icon="caret-up"></aeria-icon>
      <aeria-icon v-else icon="caret-down"></aeria-icon>
    </div>

  </div>
</template>

<style scoped src="./navbar-entry.less"></style>

