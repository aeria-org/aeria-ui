<script setup lang="ts">
import type { LayoutOptions, CollectionAction } from '@aeriajs/types'
import { useParentCollectionStore } from '@aeria-ui/core'
import { t } from '@aeria-ui/i18n'

import AeriaContextMenu from '../../../../aeria-context-menu/aeria-context-menu.vue'
import AeriaIcon from '../../../../aeria-icon/aeria-icon.vue'
import AeriaCard from '../../../../aeria-card/aeria-card.vue'
import AeriaGrid from '../../../../aeria-grid/aeria-grid.vue'
import AeriaBadge from '../../../../aeria-badge/aeria-badge.vue'
import AeriaPicture from '../../../../aeria-picture/aeria-picture.vue'

type Props = {
  individualActions?: (CollectionAction & { click: ()=> void })[]
  hasSelectionActions?: boolean
  layoutOptions: LayoutOptions
  componentName: string
}

const props = defineProps<Props>()
const layoutOptions = props.layoutOptions

const store = useParentCollectionStore()

const firstIfArray = (what: unknown) => {
  return Array.isArray(what)
    ? what[0]
    : what
}
</script>

<template>
  <aeria-grid :list="componentName === 'list'">
    <aeria-card
      v-for="item in store.items"
      :key="item._id as string"
      :inactive="!!(layoutOptions.active && !item[layoutOptions.active])"
      :horizontal="componentName === 'list'"
    >
      <aeria-picture
        expandable
        v-bind="{
          url: firstIfArray(item[layoutOptions.picture!])?.link,
          meta: firstIfArray(item[layoutOptions.picture!]),
          height: '16rem',
          alt: layoutOptions.title
            ? firstIfArray(item[layoutOptions.title])?.link
            : 'Item picture'
        }"
      />

      <template
        v-if="layoutOptions.badge && Array.isArray(item[layoutOptions.badge])"
        #badge
      >
        <aeria-badge
          v-for="badge in item[layoutOptions.badge!]"
          :key="`${item._id}-${badge}`"
          large
        >
          {{
            layoutOptions.translateBadge
              ? t(badge)
              : badge
          }}
        </aeria-badge>
      </template>

      <template
        v-else-if="layoutOptions.badge"
        #badge
      >
        <aeria-badge>
          {{
            layoutOptions.translateBadge && typeof item[layoutOptions.badge!] === 'string'
              ? t(item[layoutOptions.badge!])
              : item[layoutOptions.badge!]
          }}
        </aeria-badge>
      </template>

      <template #footer>
        <div v-if="layoutOptions.title">
          {{ item[layoutOptions.title] }}
        </div>

        <div
          v-if="Array.isArray(layoutOptions.information)"
          class="card__information"
        >
          <div
            v-for="propName of layoutOptions.information"
            :key="`info-${propName}`"
          >
            {{ item[propName] }}
          </div>
        </div>
        <div
          v-else-if="layoutOptions.information"
          class="card__information"
        >
          {{ item[layoutOptions.information as string] }}
        </div>
      </template>

      <template #actions>
        <aeria-context-menu
          v-if="individualActions?.length"
          v-slot="{
            visible,
          }"
          v-bind="{
            subject: item,
            actions: individualActions,
          }"
        >
          <aeria-icon
            v-clickable
            reactive
            :active="visible"
            icon="dots-three-vertical"
          />
        </aeria-context-menu>
      </template>
    </aeria-card>
  </aeria-grid>
</template>

<style scoped src="./aeria-grid.less"></style>
