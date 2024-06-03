<script setup lang="ts">
import type { FiltersPreset } from '@aeriajs/types'
import type { CollectionStore } from '@aeria-ui/core'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useParentStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import { togglePreset } from '../../aeria-crud/_internals/helpers'
import { AeriaAsync } from '../../utils'
import AeriaTabs from '../../aeria-tabs/aeria-tabs.vue'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'
import AeriaBadge from '../../aeria-badge/aeria-badge.vue'

type Props = {
  collection?: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = router.currentRoute

const store = computed(() => {
  try {
    const collection = props.collection
      ? props.collection
      : (route.value.meta.collection || route.value.params.collection) as string

    return useParentStore(collection) as CollectionStore
  } catch( e ) {
    return null
  }
})
</script>

<template>
  <aeria-tabs
    v-if="store && store.description.filtersPresets"
    dropdown
    query="section"
  >
    <template
      v-for="([presetName, preset]) in Object.entries(store.description.filtersPresets as Record<string, FiltersPreset<any>>)"
      :key="presetName"
      #[presetName]
    >
      <div
        class="topbar__preset"
        @click="togglePreset(preset, store)"
      >
        <aeria-icon
          v-if="preset.icon"
          :icon="preset.icon"
        >
          {{ preset.label || t(presetName, { plural: true }) }}
        </aeria-icon>
        <div v-else>
          {{ preset.label || t(presetName, { plural: true }) }}
        </div>

        <aeria-badge v-if="preset.badgeFunction">
          <aeria-async
            initial-value="0"
            :promise="store.$functions[preset.badgeFunction]({ filters: preset.filters })"
          />
        </aeria-badge>
      </div>
    </template>
  </aeria-tabs>
</template>

<style scoped src="./aeria-crud-topbar.less"></style>

