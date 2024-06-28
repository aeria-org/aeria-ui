<script setup lang="ts">
import type { ActionFilter, ActionEvent, Pagination, CollectionStore } from '@aeria-ui/core'
import type { Layout } from '@aeriajs/types'
import type { Component } from 'vue'
import type { RouteRecordNormalized } from 'vue-router'
import { onUnmounted, ref, computed, provide, inject, watch, unref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { deepClone, getReferenceProperty } from '@aeriajs/common'
import { useAction, useBreakpoints, useDebounce, useScrollObserver, convertFromSearchQuery } from '@aeria-ui/core'
import { useStore, getGlobalStateManager, STORE_ID } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

import AeriaPagination from '../aeria-pagination/aeria-pagination.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'
import AeriaInput from '../form/aeria-input/aeria-input.vue'
import AeriaContextMenu from '../aeria-context-menu/aeria-context-menu.vue'
import AeriaBadge from '../aeria-badge/aeria-badge.vue'
import AeriaFilterPanel from './_internals/components/aeria-filter-panel/aeria-filter-panel.vue'
import AeriaInsertPanel from './_internals/components/aeria-insert-panel/aeria-insert-panel.vue'

import { watchStore } from './_internals/helpers.js'
import { getLayout } from './_internals/layouts/index.js'

import {
  isInsertVisible,
  isInsertReadonly,
  isFilterVisible,
  call,
  actionEventBus,

} from './_internals/store.js'

type Props = {
  collection: string
  noControls?: boolean
  noActions?: boolean
  noFetch?: boolean
  noLayoutToggle?: boolean
  layout?: Layout
  action?: Ref<ReturnType<typeof useAction>> | ReturnType<typeof useAction>
  componentProps?: Record<string, any>
  scrollPagination?: boolean
  noQueryPersistence?: boolean
}

type Emits = {
  (e: 'uiEvent', event: ActionEvent): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()
const router = useRouter()

const debounce = useDebounce({
  delay: 600,
})

const metaStore = useStore('meta')
const breakpoints = useBreakpoints()
const { reachedEnd, detach: detachScrollListener } = useScrollObserver(null, {
  antecipate: 600,
})

const scrollPagination = !breakpoints.value.md || props.scrollPagination

if( scrollPagination ) {
  watch(reachedEnd, (value) => {
    if( value && store.pagination.recordsTotal > store.items.length && batch.value < MAX_BATCHES ) {
      batch.value += 1
      fetchItems()
    }
  })
}

const store = useStore(props.collection) as CollectionStore
watchStore(store, {
  persistInQuery: !props.noQueryPersistence,
})

const manager = getGlobalStateManager()

const action = props.action
  ? unref(props.action)
  : useAction(store, router, manager)

call.value = action[0]
actionEventBus.value = action[1]

const batch = ref(0)
const MAX_BATCHES = 30

const firstFetch = ref(false)

const fetchItems = async (optPayload?: ActionFilter) => {
  store.activeFilters = Object.assign({}, optPayload?.filters || store.$filters)
  Object.assign(store.activeFilters, store.filtersPreset)

  const payload: ActionFilter = {
    filters: store.activeFilters,
    limit: store.pagination.limit,
    offset: store.pagination.offset,
    project: store.preferredTableProperties.length > 0
      ? store.preferredTableProperties
      : store.description.table as string[] | undefined || Object.keys(store.properties),
  }

  if( batch.value > 0 ) {
    payload.limit = 15
    payload.offset = batch.value * payload.limit
  }

  if( store.description.tableMeta ) {
    payload.project = payload.project!.concat(store.description.tableMeta as string[])
  }

  if( optPayload ) {
    Object.assign(payload, optPayload)
  }

  store.loading.getAll = true
  const { error, result } = await store.$actions.retrieveItems(payload)
  if( error ) {
    return
  }

  const { data, pagination } = result
  store.pagination.recordsCount = pagination.recordsCount
  store.pagination.recordsTotal = pagination.recordsTotal

  if( batch.value === 0 ) {
    store.items.splice(0)
  }

  store.items.push(...data)
  store.loading.getAll = false
  firstFetch.value = true
}

const paginate = async (pagination: Pick<Pagination, 'offset' | 'limit'>) => {
  router.push({
    query: {
      ...router.currentRoute.value.query,
      offset: pagination.offset,
      limit: pagination.limit,
    },
  })

  store.pagination.offset = pagination.offset
  store.pagination.limit = pagination.limit

  fetchItems()
}

const noResultsComponent = inject('noResultsComponent', null)

watch(() => [
router.currentRoute.value.path,
router.currentRoute.value.query.section,
], async (newVal, oldVal) => {
  if( oldVal ) {
    if( oldVal[0] === newVal[0] && oldVal[1] === newVal[1] ) {
      return
    }
  }

  const route = router.currentRoute.value
  metaStore.view.title = props.collection
  metaStore.view.collection = props.collection
  isInsertReadonly.value = false

  if( !props.noFetch && !route.query._popstate ) {
    const filters = convertFromSearchQuery(store, route as unknown as RouteRecordNormalized)
    if( Object.keys(filters).length > 0 ) {
      Object.assign(store.filters, filters)
    }

    await fetchItems()
  }
}, {
  immediate: true,
  flush: 'post',
})

const [performLazySearch] = debounce((value: string) => {
  router.push({
    query: {
      search: value || undefined,
    },
  })

  if( !value ) {
    store.filters = deepClone(store.freshFilters)
    batch.value = 0
    return fetchItems()
  }

  store.filters = Object.assign(deepClone(store.freshFilters), {
    $text: {
      $search: `"${value}"`,
      $caseSensitive: false,
    },
  })

  return fetchItems({
    offset: 0,
  })
})

watch(() => store.textQuery, (value) => {
  performLazySearch(value)
})

const toggleLayout = (store: any) => {
  store.currentLayout = store.currentLayout === 'tabular'
    ? store.description.layout!.name
    : 'tabular'
}

onUnmounted(() => {
  store.$actions.clearFilters()
  store.textQuery = ''
  detachScrollListener()
})

watch(() => actionEventBus.value, async (_event) => {
  const event = deepClone(_event)
  let getPromise: ReturnType<typeof store.$actions.get>
  if( !event ) {
    return
  }

  if (
    [
      'spawnEdit',
      'spawnView',
      'duplicate',
    ].includes(event.name)
  ) {
    getPromise = store.$actions.get({
      filters: {
        _id: event.params._id,
      },
    })
  }

  if( event.name === 'spawnAdd' ) {
    store.$actions.clearItem()
    if( event.params?.item ) {
      store.$actions.setItem(event.params.item)
      Object.keys(event.params.item).forEach((key) => {
        delete store.referenceItem[key]
      })
    }
    isInsertVisible.value = 'add'
  } else if( event.name === 'spawnEdit' ) {
    store.$actions.setItem(event.params)
    isInsertVisible.value = 'edit'
  } else if( event.name === 'spawnView' ) {
    isInsertReadonly.value = true
    isInsertVisible.value = 'view'
  } else if( event.name === 'duplicate' ) {
    await getPromise!

    const newItem = Object.entries(store.item).reduce((a, [key, value]) => {
      if( !(key in store.properties) ) {
        return {
          ...a,
          [key]: value,
        }
      }

      const property = store.properties[key]
      if( property.readOnly ) {
        return a
      }

      const unbound = (value: any) => {
        const refProperty = getReferenceProperty(property)
        if( !refProperty ) {
          return value
        }

        if( refProperty.$ref === 'file' ) {
          return {}
        }

        if( refProperty.inline && value ) {
          const { _id: itemId, ...rest } = value
          return rest
        }
        return value
      }

      value = Array.isArray(value)
        ? value.map(unbound)
        : unbound(value)

      return {
        ...a,
        [key]: value,
      }
    }, {})

    store.$actions.setItem(newItem)
    delete store.item._id

    store.referenceItem = {}
    isInsertVisible.value = 'duplicate'
  } else {
    emit('uiEvent', event)
  }

}, {
 deep: true,
})

watch(() => isInsertVisible, (value) => {
  if( value.value === false ) {
    metaStore.view.collection = props.collection
    store.$actions.clearItem()
  }
})

const individualActions = computed(() => {
  return store.individualActions.map((action: any) => ({
    click: call.value(action),
    ...action,
  }))
})

const actionButtons = computed(() => {
  return store.actions.filter((action) => !action.button)
})

provide(STORE_ID, computed(() => props.collection))
provide('individualActions', individualActions)
</script>

<template>
  <aeria-filter-panel
    v-if="isFilterVisible"
    :key="store.$id"
    v-model="isFilterVisible"
  />

  <aeria-insert-panel v-if="isInsertVisible">
    <template
      v-for="slotName in Object.keys($slots).filter(key => key.startsWith('field-'))"
      #[slotName]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slotName"
      />
    </template>
  </aeria-insert-panel>

  <div
    v-if="!noActions && (
      store.description.search
      || Object.keys(store.availableFilters).length > 0
      || (store?.actions.length > 0 || $slots.actions)
      || (
        !noLayoutToggle
        && store.description.layout
        && store.description.layout?.name !== 'tabular'
      )
    )"
    class="crud__controls"
  >
    <div
      v-if="store.description.search"
      class="crud__search"
    >
      <aeria-input
        v-model="store.textQuery"
        v-bind="{
          property: {
            type: 'string',
            placeholder: store.description.search.placeholder || 'Pesquise aqui',
            inputType: 'search'
          }
        }"
      />
    </div>

    <div class="crud__actions">
      <aeria-context-menu
        v-if="
          actionButtons.length > 0
            || (!noLayoutToggle
              && store.description.layout
              && store.description.layout?.name !== 'tabular'
            )
        "
      >
        <aeria-button
          variant="alt"
          icon="sliders"
        >
          <aeria-badge v-if="store.filtersCount">
            {{ store.filtersCount }}
          </aeria-badge>
        </aeria-button>

        <template
          v-if="Object.keys(store.availableFilters).length > 0"
          #filter
        >
          <aeria-icon
            v-clickable
            icon="funnel"
            @click="isFilterVisible = true"
          >
            {{ t('filters', { capitalize: true }) }}
          </aeria-icon>

          <div class="crud__context-badge">
            <aeria-badge v-if="store.filtersCount">
              {{ store.filtersCount }}
            </aeria-badge>
          </div>
        </template>

        <template
          v-if="
            !noLayoutToggle
              && store.description.layout
              && store.description.layout?.name !== 'tabular'
          "
          #layout-toggle
        >
          <aeria-icon
            v-clickable
            icon="table"
            @click="toggleLayout(store)"
          >
            {{ t('change_layout', { capitalize: true }) }}
          </aeria-icon>
        </template>

        <!-- <aeria-icon icon="gear"></aeria-icon> -->
        <template
          v-for="(actionProps, index) in actionButtons"
          :key="actionProps.label"
          #[`action-${index}`]
        >
          <aeria-icon
            v-if="actionProps"
            :icon="actionProps.icon || 'gear'"
            :disabled="store.selected.length === 0 && actionProps.selection"

            @click="call(actionProps)({ _id: store.selected.map((item) => item._id) })"
          >
            {{ t(actionProps.label, { capitalize: true }) }}
          </aeria-icon>
        </template>
      </aeria-context-menu>

      <aeria-button
        v-else-if="Object.keys(store.availableFilters).length > 0"
        variant="alt"
        icon="funnel"
        @click="isFilterVisible = true"
      >
        <div>Filtros</div>
        <aeria-badge v-if="store.filtersCount">
          {{ store.filtersCount }}
        </aeria-badge>
      </aeria-button>

      <aeria-button
        v-for="(actionProps, index) in store.actions.filter((action: any) => action.button)"
        :key="`action-${index}`"

        :icon="actionProps.icon"
        :disabled="store.selected.length === 0 && actionProps.selection"

        @click="call(actionProps)({ _id: store.selected.map((item) => item._id) })"
      >
        {{ t(actionProps.label, { capitalize: true }) }}
      </aeria-button>

      <slot
        v-if="$slots.actions"
        name="actions"
      />
    </div>
  </div>

  <div v-loading="(!scrollPagination || batch === MAX_BATCHES) && store.loading.getAll">
    <div
      v-if="
        store.itemsCount === 0
          && !store.loading.getAll
          && firstFetch
          && (noResultsComponent || $slots.empty)
      "
    >
      <component
        :is="noResultsComponent as Component"
        v-if="noResultsComponent"
        v-bind="{
          collection: store.$id
        }"
      >
        <aeria-button
          v-if="store.filtersCount === 0 && store.description.actions && 'ui:spawnAdd' in store.description.actions"
          icon="plus"
          @click="call({
            action: 'ui:spawnAdd'
          })()"
        >
          {{ t('add_first_item', { capitalize: true }) }}
        </aeria-button>
      </component>

      <slot
        v-else
        v-bind="{
          collection: store.$id
        }"
        name="empty"
      />
    </div>

    <slot
      v-else-if="$slots.component"
      v-bind="{
        store
      }"
      name="component"
    />

    <component
      v-bind="{
        individualActions,
        layoutOptions: layout?.options || store.layout.options!,
        componentProps
      }"
      :is="getLayout(layout?.name || store.$currentLayout as any)"
      v-else
      :component-name="layout?.name || store.$currentLayout"
    >
      <template
        v-for="slotName in Object.keys($slots).filter(key => key.startsWith('row-'))"
        #[slotName]="slotProps"
      >
        <slot
          v-bind="slotProps"
          :name="slotName"
        />
      </template>

      <template
        v-if="$slots.tfoot"
        #tfoot
      >
        <slot name="tfoot" />
      </template>
    </component>
  </div>

  <div
    v-if="!store.loading.getAll && store.itemsCount > 0"
    class="crud__pagination"
  >
    <aeria-pagination
      :pagination="store.pagination"
      @paginate="paginate"
    />
  </div>
</template>

<style scoped src="./aeria-crud.less"></style>

