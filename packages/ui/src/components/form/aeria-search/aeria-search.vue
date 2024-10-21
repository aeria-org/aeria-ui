<script setup lang="ts">
import type { FormFieldProps, SearchProperty } from '../types.js'
import { getReferenceProperty } from '@aeriajs/common'
import { provide, computed, ref, watch, onMounted, unref } from 'vue'
import { useDebounce, type Pagination } from '@aeria-ui/core'
import { convertConditionToQuery } from '@aeria-ui/utils'
import { useStore, useParentStore, getStoreId, STORE_ID, type Store } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

import AeriaPanel from '../../aeria-panel/aeria-panel.vue'
import AeriaButton from '../../aeria-button/aeria-button.vue'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'
import AeriaInput from '../aeria-input/aeria-input.vue'
import AeriaSearchContainer from './_internals/components/aeria-search-container/aeria-search-container.vue'
import AeriaSearchItem from './_internals/components/aeria-search-item/aeria-search-item.vue'

type Props = Omit<FormFieldProps<any>, 'property' | 'propertyName'> & {
  property: SearchProperty
  propertyName: string
  selectOnly?: boolean
  panel?: unknown
}

const DEFAULT_LIMIT = 10

const props = withDefaults(defineProps<Props>(), {
  panel: undefined,
})

const metaStore = useStore('meta')
const refProperty = getReferenceProperty(props.property)!

const panel = props.panel !== undefined
  ? computed(() => props.panel)
  : ref(false)

const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', event: unknown): void
  (e: 'update:panel', event: boolean): void
}>()

const store = useStore(getReferenceProperty(props.property)!.$ref)

const parentStoreId = getStoreId()
const parentStore = parentStoreId
  ? useParentStore()
  : null

const indexes = refProperty.indexes!

provide(STORE_ID, getReferenceProperty(props.property)!.$ref)
provide('innerInputLabel', true)
provide('omitInputLabels', true)

const selected = ref(props.modelValue)

const searchResponse = ref({
  data: [] as (unknown & { _id: string })[],
  pagination: {} as Pagination,
})

const matchingItems = computed(() => searchResponse.value.data)
const pagination = computed(() => searchResponse.value.pagination)
const batch = ref(0)

const isTyping = ref(false)
const inputValue = ref('')

const defaultFilters = () => {
  const subject: Record<string, Store> = {}
  if( parentStoreId ) {
    const key = unref(parentStoreId)
    subject[key] = parentStore!
  }

  return refProperty.constraints
    ? convertConditionToQuery(refProperty.constraints, subject)
    : {}
}

const nextBatch = () => {
  if( matchingItems.value.length < pagination.value.recordsTotal ) {
    batch.value += 1
    search()
  }
}

const getSearchResults = async () => {
  if( inputValue.value.length === 0 ) {
    return store.$actions.custom('getAll', {
      limit: DEFAULT_LIMIT,
      offset: batch.value * DEFAULT_LIMIT,
      filters: defaultFilters(),
    })
  }

  return store.$actions.custom('getAll', {
    limit: DEFAULT_LIMIT,
    offset: batch.value * DEFAULT_LIMIT,
    filters: {
      $text: {
        $search: `"${inputValue.value}"`,
        $caseSensitive: false,
      },
      ...defaultFilters(),
    },
  })
}

const search = async () => {
  if( store.loading.getAll ) {
    return
  }

  const { error, result } = await getSearchResults()
  if( error ) {
    metaStore.$actions.spawnToast({
      text: 'Request failed',
      icon: 'warning',
    })
    return
  }

  searchResponse.value.pagination = result.pagination

  if( batch.value === 0 ) {
    searchResponse.value.data.splice(0)
  }

  searchResponse.value.data.push(...result.data)
}

const [doLazySearch] = useDebounce({
 delay: 800,
})(() => {
  batch.value = 0
  search()
  isTyping.value = false
})

const lazySearch = () => {
  isTyping.value = true
  doLazySearch()
}

const openSelectPanel = () => {
  if( 'effect' in panel ) {
    emit('update:panel', true)
  } else {
    panel.value = true
  }

  search()
}

const closeSelectPanel = () => {
  batch.value = 0
  searchResponse.value.data.splice(0)

  if( 'effect' in panel ) {
    emit('update:panel', false)
  } else {
    panel.value = false
  }
}

watch(() => inputValue.value.length, (val, oldVal) => {
  if( val && !oldVal ) {
    search()
  }
})

onMounted(() => {
  if( props.selectOnly ) {
    search()
  }
})

const update = (newVal: typeof props.modelValue) => {
  selected.value = newVal
  if( !props.selectOnly ) {
    emit('update:modelValue', newVal)
  }
}

const save = () => {
  closeSelectPanel()
  emit('update:modelValue', selected.value)
}
</script>

<template>
  <div>
    <teleport
      v-if="panel"
      to="main"
    >
      <aeria-panel
        float
        close-hint
        :title="`${t('action.select', { capitalize: true })} ${t(propertyName)}`"
        :overlay-layer="65"
        :model-value="panel"

        style="
          --panel-max-width: 36rem;
        "
        @close="closeSelectPanel"
        @overlay-click="closeSelectPanel"
      >
        <div class="search__panel">
          <aeria-input
            v-model="inputValue"
            v-bind="{
              property: {
                type: 'string',
                placeholder: 'Pesquise aqui',
                inputType: 'search'
              }
            }"
            @input="lazySearch"
          />

          <aeria-search-container
            v-if="matchingItems.length"
            observe-scroll
            @end-reached="nextBatch"
          >
            <aeria-search-item
              v-for="item in matchingItems"
              v-bind="{
                item,
                indexes,
                property,
              }"
              :key="`matching-${item._id}`"
              v-model="selected"
            />
          </aeria-search-container>

          <div v-else>
            <div v-if="isTyping">
              {{ t('searching', { capitalize: true }) }}...
            </div>
            <div
              v-else-if="
                !store.loading.getAll
                  && Object.values(inputValue).filter((v) => !!v).length > 0
                  && !(('items' in property && modelValue?.length) || (!Array.isArray(modelValue) && modelValue?._id))
              "
            >
              {{ t('no_results', { capitalize: true }) }}
            </div>
          </div>
        </div>

        <div class="search__summary">
          {{ t('showing', { capitalize: true }) }} {{ matchingItems.length }} {{ t('of') }} {{ pagination.recordsTotal }}
        </div>

        <template #footer>
          <aeria-button
            large
            @click="save"
          >
            {{ t('action.save', { capitalize: true }) }}
          </aeria-button>
        </template>
      </aeria-panel>
    </teleport>

    <div
      v-if="!selectOnly"
      class="search"
    >
      <aeria-search-container>
        <div v-if="'items' in property">
          <aeria-search-item
            v-for="item in modelValue"
            v-bind="{
              item,
              indexes,
              property,
              readOnly,
              modelValue,
            }"

            :key="`selected-${item._id}`"
            @update:model-value="update"
          />
        </div>

        <aeria-search-item
          v-else-if="modelValue?._id"
          v-bind="{
            item: modelValue,
            indexes,
            property: refProperty,
            readOnly,
            modelValue,
          }"
          @update:model-value="update"
        />

        <template
          v-if="!readOnly"
          #footer
        >
          <aeria-icon
            v-clickable
            icon="plus"
            @click="openSelectPanel"
          >
            {{ t('action.select', { capitalize: true }) }}
          </aeria-icon>
        </template>
      </aeria-search-container>
    </div>
  </div>
</template>

<style scoped src="./aeria-search.less"></style>
