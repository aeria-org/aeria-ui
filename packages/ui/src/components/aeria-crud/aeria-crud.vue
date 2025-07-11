<script setup lang="ts">
import type { ActionEvent, Pagination, CollectionStore, CollectionStoreItem } from '@aeria-ui/core'
import type { GetAllPayload, Layout } from '@aeriajs/types'
import type { Component } from 'vue'
import { onUnmounted, ref, computed, provide, inject, watch, unref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { getReferenceProperty, deepClone, deepMerge } from '@aeriajs/common'
import { useCollectionStore, useAction, useBreakpoints, useDebounce, useScrollObserver, convertFromSearchQuery } from '@aeria-ui/core'
import { useStore, getGlobalStateManager, STORE_ID } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

import AeriaPagination from '../aeria-pagination/aeria-pagination.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'
import AeriaInput from '../form/aeria-input/aeria-input.vue'
import AeriaContextMenu from '../aeria-context-menu/aeria-context-menu.vue'
import AeriaBadge from '../aeria-badge/aeria-badge.vue'
import AeriaFilterPanel from '../aeria-filter-panel/aeria-filter-panel.vue'
import AeriaInsertPanel from '../aeria-insert-panel/aeria-insert-panel.vue'

import { watchStore } from './_internals/helpers.js'
import { getLayout } from './_internals/layouts/index.js'

const isInsertVisible = ref<boolean | string>(false)
const isFilterVisible = ref<boolean>(false)

const call = ref<ReturnType<typeof useAction>[0]>((..._args: unknown[]) => null as never)
const actionEventBus = ref<ActionEvent>()

type Props = {
  collection: string
  noControls?: boolean
  noActions?: boolean
  noFetch?: boolean
  noLayoutToggle?: boolean
  layout?: Layout
  action?: Ref<ReturnType<typeof useAction>> | ReturnType<typeof useAction>
  componentProps?: Record<string, unknown>
  scrollPagination?: boolean
  noQueryPersistence?: boolean
}

type Emits = {
  (e: 'uiEvent', event: ActionEvent): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()
const router = useRouter()

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

const store = useCollectionStore(props.collection)
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

const fetchItems = async (optPayload?: GetAllPayload<CollectionStoreItem>) => {
  store.activeFilters = Object.assign({}, optPayload?.filters || store.$filters)
  Object.assign(store.activeFilters, store.filtersPreset)

  const payload: NonNullable<typeof optPayload> = {
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
  router.push(deepMerge(router.currentRoute.value, {
    query: {
      offset: pagination.offset,
      limit: pagination.limit,
    },
  }))

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

  if( !props.noFetch && (!route.query._popstate || store.itemsCount === 0) ) {
    const filters = convertFromSearchQuery(store, route.query)
    if( Object.keys(filters).length > 0 ) {
      Object.assign(store.filters, filters)
    }

    await fetchItems()
  }
}, {
  immediate: true,
  flush: 'post',
})

const [performLazySearch] = useDebounce({
 delay: 600,
})((value: string) => {
  router.push(deepMerge(router.currentRoute.value, {
    query: {
      search: value || undefined,
    },
  }))

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

const toggleLayout = (store: CollectionStore) => {
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

  if ( event.name === 'spawnEdit' || event.name === 'duplicate' ) {
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

      const unbound = (reference: typeof store.item | undefined | null) => {
        const refProperty = getReferenceProperty(property)
        if( !refProperty ) {
          return reference
        }

        if( refProperty.$ref === 'file' ) {
          return {}
        }

        if( refProperty.inline && reference ) {
          const { _id: itemId, ...rest } = reference
          return rest
        }
        return reference
      }

      value = Array.isArray(value)
        ? value.map(unbound)
        : unbound(value as CollectionStoreItem)

      return {
        ...a,
        [key]: value,
      }
    }, {
      _id: undefined,
    })

    store.$actions.setItem(newItem)
    delete store.item._id

    store.referenceItem = {
      _id: undefined,
    }
    isInsertVisible.value = 'duplicate'
  } else {
    emit('uiEvent', event)
  }

}, {
 deep: true,
})

watch(() => isInsertVisible, ({ value: visible }) => {
  if( visible === false ) {
    store.$actions.clearItem()
  }
})

const individualActions = computed(() => {
  if( props.noActions ) {
    return
  }

  return store.individualActions.map((action) => {
    const [delayedCall] = useDebounce({
 delay: 100,
immediate: true,
})(call.value(action))
    return {
      click: delayedCall,
      ...action,
    }
  })
})

const actionButtons = computed(() => {
  return store.actions.filter((action) => !action.button)
})

provide(STORE_ID, computed(() => props.collection))
</script>

<template>
  <aeria-filter-panel
    v-if="isFilterVisible"
    :key="store.$id"
    v-model="isFilterVisible"
  />

  <aeria-insert-panel
    v-if="isInsertVisible"
    v-model:visible="isInsertVisible"
    fixed-right
    v-bind="{
      collection,
      individualActions,
    }"
    @cancel="isInsertVisible = false"
  >
    <template #header>
      <span>{{
        (() => {
          switch( isInsertVisible ) {
          case 'add':
            return t('action.add', { capitalize: true })
          case 'duplicate':
            return t('action.duplicate', { capitalize: true })
          case 'edit':
          default:
            return t('action.edit', { capitalize: true })
          }
        })() }}
      </span>
      <span>&nbsp;{{ t(collection) }}</span>
    </template>

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
            :disabled="store.selected.length === 0 && 'selection' in actionProps && actionProps.selection"

            @click="call(actionProps)({ _id: store.selected.map((item) => typeof item === 'string' || item._id) })"
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
        <div>{{ t('Filters') }}</div>
        <aeria-badge v-if="store.filtersCount">
          {{ store.filtersCount }}
        </aeria-badge>
      </aeria-button>

      <aeria-button
        v-for="(actionProps, index) in store.actions.filter((action) => action.button)"
        :key="`action-${index}`"

        :icon="actionProps.icon"
        :disabled="store.selected.length === 0 && 'selection' in actionProps && actionProps.selection"

        @click="call(actionProps)({ _id: store.selected.map((item) => typeof item === 'string' || item._id) })"
      >
        {{ t(actionProps.label, { capitalize: true }) }}
      </aeria-button>

      <slot
        v-if="$slots.actions"
        name="actions"
      />
    </div>
  </div>

  <div
    v-loading="(!scrollPagination || batch === MAX_BATCHES) && store.loading.getAll"
    class="crud__data"
  >
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
          v-if="store.filtersCount === 0 && store.description.actions && 'spawnAdd' in store.description.actions"
          icon="plus"
          @click="call({
            action: 'spawnAdd',
            event: 'spawnAdd',
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
      :is="getLayout(layout?.name || store.$currentLayout)"
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
    v-if="!scrollPagination && !noControls && !store.loading.getAll && store.itemsCount > 0"
    class="crud__pagination"
  >
    <aeria-pagination
      :pagination="store.pagination"
      @paginate="paginate"
    />
  </div>
</template>

<style scoped src="./aeria-crud.less"></style>

