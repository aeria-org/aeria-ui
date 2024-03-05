<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PAGINATION_PER_PAGE_DEFAULTS, type Pagination } from '@aeria-ui/web'
import { t } from '@aeria-ui/i18n'

import AeriaBareButton from '../aeria-bare-button/aeria-bare-button.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'
import AeriaInput from '../form/aeria-input/aeria-input.vue'
import AeriaSelect from '../form/aeria-select/aeria-select.vue'

type Props = {
  pagination: Pagination
}

type Emits = {
  (e: 'paginate', value: Pick<Pagination, 'offset' | 'limit'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const page = computed<number>({
  get: () => Math.floor(props.pagination.offset / props.pagination.limit),
  set: (page: number) => {
    props.pagination.offset = page * props.pagination.limit
  },
})

const limit = computed<number>({
  get: () => props.pagination.limit,
  set: (value) => {
    props.pagination.limit = Number(value)
  },
})

const pageInput = ref(page.value
? page.value + 1
: 1)
const pageCount = computed(() => Math.ceil(props.pagination.recordsTotal / props.pagination.limit))

const paginate = (direction: 'previous' | 'next') => {
  page.value = direction === 'previous'
    ? page.value - 1
    : page.value + 1
}

watch([
page,
limit,
], ([newPage]: [number, number]) => {
  pageInput.value = newPage + 1
  emit('paginate', {
    offset: page.value * limit.value,
    limit: limit.value,
  })
})
</script>

<template>
  <div class="pagination">
    <aeria-select
      v-model="limit"
      :property="{
        enum: [],
        icon: 'list'
      }"
      class="pagination__control"
    >
      <option
        v-for="limitOption in PAGINATION_PER_PAGE_DEFAULTS"
        :key="`limit-${limitOption}`"
        :value="limitOption"
      >
        {{ limitOption }}
      </option>
    </aeria-select>

    <div class="pagination__control">
      <aeria-bare-button @click="page = 0">
        <aeria-icon
          reactive
          icon="caret-double-left"
        />
      </aeria-bare-button>
      <aeria-bare-button
        :disabled="page === 0"
        @click="paginate('previous')"
      >
        <aeria-icon
          reactive
          icon="caret-left"
        />
      </aeria-bare-button>
      <div class="pagination__page-input">
        <aeria-input
          :key="page"
          v-model="pageInput"
          :property="{
            type: 'number',
            minimum: 1
          }"

          @change="page = pageInput === 0 ? 0 : pageInput - 1;"
        />
        <span>{{ t('of') }} {{ pageCount }}</span>
      </div>
      <aeria-bare-button
        :disabled="page === pageCount - 1"
        @click="paginate('next')"
      >
        <aeria-icon
          reactive
          icon="caret-right"
        />
      </aeria-bare-button>
      <aeria-bare-button @click="page = pageCount - 1">
        <aeria-icon
          reactive
          icon="caret-double-right"
        />
      </aeria-bare-button>
    </div>
  </div>
</template>

<style scoped src="./aeria-pagination.less"></style>

