<script setup lang="ts">
import type { CollectionStore } from '@aeria-ui/core'
import { inject, unref } from 'vue'
import { useParentStore, STORE_ID } from '@aeria-ui/state-management'
import { convertToSearchQuery } from '@aeria-ui/core'
import { deepMerge } from '@aeriajs/common'
import { useRouter } from 'vue-router'
import AeriaPanel from '../aeria-panel/aeria-panel.vue'
import AeriaForm from '../form/aeria-form/aeria-form.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaBadge from '../aeria-badge/aeria-badge.vue'

type Emits = {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()
const store = useParentStore() as CollectionStore
const router = useRouter()

const storeId = unref(inject<string>(STORE_ID))

const filter = () => {
  store.pagination.offset = 0
  store.$actions.filter()
  emit('update:modelValue', false)

  if( 'query' in router.currentRoute && router.currentRoute.query && typeof router.currentRoute.query === 'object' ) {
    const query = router.currentRoute.query as Record<string, unknown>
    for( const param of Object.keys(query) ) {
      if( param.startsWith(`${storeId}.`) ) {
        delete query[param]
      }
    }
  }

  const { query, ...route } = router.currentRoute.value
  router.push(deepMerge(route, {
    query: convertToSearchQuery(store),
  }))
}
</script>

<template>
  <aeria-panel
    close-hint
    fixed-right
    :title="t('filter_by', { capitalize: true })"

    @close="emit('update:modelValue', false)"
    @overlay-click="emit('update:modelValue', false)"
  >
    <aeria-form
      v-model="store.filters"
      v-bind="{
        form: store.$actions.useProperties(
          Array.isArray(store.description.filters)
            ? store.description.filters
            : Object.keys(store.description.filters!)
        ),
        layout: store.description.formLayout as never,
      }"

      focus
      search-only
    />
    <template #footer>
      <aeria-button
        v-if="store.filtersCount > 0"
        variant="transparent"
        @click="
          store.$actions.clearFilters();
          filter();
          emit('update:modelValue', false)
        "
      >
        {{ t('action.clear', { capitalize: true }) }}
        <aeria-badge>
          {{ store.filtersCount }}
        </aeria-badge>
      </aeria-button>
      <aeria-button
        large
        icon="funnel"
        :disabled="!store.hasActiveFilters"
        @click="filter"
      >
        {{ t('action.filter', { capitalize: true }) }}
      </aeria-button>
    </template>
  </aeria-panel>
</template>

