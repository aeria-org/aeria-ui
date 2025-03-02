<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { MenuNode } from 'aeria-ui'
import { getGlobalStateManager } from '@aeria-ui/state-management'
import { isCollapsibleRouteOpen, routeClick } from '@aeria-ui/theme'
import NavbarEntry from '../navbar-entry/navbar-entry.vue'

type Props = {
  item: MenuNode
  memoKey: string
  level?: number
}

withDefaults(defineProps<Props>(), {
  level: 0
})

const manager = getGlobalStateManager()
</script>

<template>
  <navbar-entry
    v-if="'meta' in item"
    v-bind="{
      item,
      level,
      memoKey
    }"
    @click.stop="routeClick(item, manager)"
  ></navbar-entry>

  <div v-if="isCollapsibleRouteOpen(item)">
    <div
      v-clickable
      v-for="(child, cindex) in item.children as (MenuNode & RouteRecordRaw)[]"
      :key="`child-${cindex}`"
      @click.stop="routeClick(child, manager)"
    >
      <navbar-entries
        v-bind="{
          item: child,
          level: 'meta' in item
            ? level + 1
            : level,
          memoKey: `${memoKey}-${cindex}`
      }"></navbar-entries>
    </div>
  </div>

</template>
