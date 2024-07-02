<script setup lang="ts">
import type { Property, CollectionAction, TableLayout } from '@aeriajs/types'
import { computed, type Ref } from 'vue'
import { evaluateCondition, getReferenceProperty, arraysIntersect } from '@aeriajs/common'
import { useBreakpoints } from '@aeria-ui/core'
import { useStore, getStoreId } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

import AeriaBareButton from '../aeria-bare-button/aeria-bare-button.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'
import AeriaPicture from '../aeria-picture/aeria-picture.vue'
import AeriaContextMenu from '../aeria-context-menu/aeria-context-menu.vue'

type Props = {
  columns?: Record<string, Property>
  rows?: any
  collection?: string | Ref<string>
  checkbox?: boolean
  actions?: (CollectionAction<any> & {
    action: string
    click: (...args: any[])=> void
  })[]
  layout?: any
}

type Emits = {
  (e: 'itemClick', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const breakpoints = useBreakpoints()

const collectionName = props.collection || getStoreId()
const store = collectionName
  ? useStore(typeof collectionName === 'string'
? collectionName
: collectionName.value)
  : null

const selected = computed({
  get: () => store?.selected,
  set: (items: any[]) => store?.$actions.selectManyItems(items, true),
})

const isActionButton = (layout: TableLayout<any>['actions'][string], subject: any) => {
  if( !layout?.button ) {
    return false
  }

  if( typeof layout.button === 'object' ) {
    const result = evaluateCondition(subject, layout.button)
    return result.satisfied
  }

  return layout.button
}

const buttonActions = (subject: any) => {
  if( !breakpoints.value.xl || !props.layout?.actions || !props.actions ) {
    return []
  }

  return props.actions.filter((action) => {
    const layout = props.layout.actions[action.action]
    return isActionButton(layout, subject)
  })
}

const dropdownActions = (subject: any) => {
  if( !props.actions ) {
    return []
  }

  if( !breakpoints.value.xl || !props.layout?.actions ) {
    return props.actions
  }

  return props.actions.filter((action) => {
    const layout = props.layout.actions[action.action]
    if( action.roles ) {
      const userStore = useStore('user')
      const intersects = arraysIntersect(action.roles, userStore.currentUser.roles)

      if( !intersects ) {
        return false
      }
    }

    return !isActionButton(layout, subject)
  })
}

const buttonStyle = (subject: any, action: any) => {
  const style = []
  const layout = props.layout?.actions?.[action.action]

  if( layout?.if ) {
    const result = evaluateCondition(
      subject,
      layout.if,
    )

    if( !result.satisfied ) {
      style.push('display: none;')
    }
  }

  return style.join('')
}
</script>

<template>
  <table
    v-if="(columns && Object.keys(columns).length > 0) || $slots.thead"
    class="
      table
      aeria-surface
    "
  >
    <thead v-if="$slots.thead">
      <slot name="thead" />
    </thead>

    <thead v-else>
      <tr>
        <th v-if="checkbox && store && breakpoints.md">
          <input
            type="checkbox"
            :checked="store.selected.length > 0 && store.selected.length === store.itemsCount"
            @change="store.$actions.selectAllItems(($event.target as HTMLInputElement).checked)"
          >
        </th>
        <th
          v-for="([propertyName, property], index) in Object.entries(columns!)"
          :key="`header-${index}`"
          class="table__header"
        >
          {{ property.description || t(propertyName) }}
        </th>
        <th
          v-if="actions?.length"
          style="text-align: right;"
        />
      </tr>
    </thead>

    <tbody v-if="$slots.tbody">
      <slot name="tbody" />
    </tbody>

    <tbody v-else>
      <tr
        v-for="row in rows"
        :key="row._id"
        @click="emit('itemClick', row)"
      >
        <td v-if="store && checkbox && breakpoints.md">
          <input
            v-model="selected"
            type="checkbox"
            :value="row._id"
          >
        </td>
        <td
          v-for="([column, property], cindex) in Object.entries(columns!)"
          :key="`column-${row._id}-${cindex}`"
        >
          <div class="table__cell-mobile-label">
            {{ property.description || t(column) }}
          </div>

          <div
            v-if="`row-${column}` in $slots"
            class="table__cell-container"
          >
            <slot
              v-bind="{
                store,
                column,
                property,
                row
              }"

              :name="`row-${column}`"
            />
          </div>
          <div
            v-else
            class="table__cell-container"
          >
            <div class="table__cell-grid">
              <div v-if="'type' in property && property.type === 'boolean'">
                <aeria-icon
                  v-if="row[column]"
                  icon="check"
                  icon-classes="aeria-blueish"
                >
                  {{ t('yes') }}
                </aeria-icon>
                <aeria-icon
                  v-else
                  icon="x"
                  icon-classes="aeria-redish"
                >
                  {{ t('no') }}
                </aeria-icon>
              </div>

              <div v-else-if="getReferenceProperty(property)?.$ref === 'file'">
                <div v-if="row[column]">
                  <aeria-picture
                    v-if="'items' in property && row[column][0] && /^image/.test(row[column][0].type)"
                    v-model="row[column][0].link"
                    expandable
                    :meta="row[column][0]"
                    alt="Row image"
                    class="table__picture"
                  />

                  <aeria-picture
                    v-else-if="/^image/.test(row[column].type)"
                    v-model="row[column].link"
                    expandable
                    :meta="row[column]"
                    alt="Row image"
                    class="table__picture"
                  />

                  <a
                    v-else-if="row[column].link"
                    :href="row[column].link"
                    style="font-size: 10pt"
                  >
                    {{ row[column].filename }}
                  </a>
                  <div v-else>
                    -
                  </div>
                </div>

                <div v-else>
                  -
                </div>
              </div>

              <div v-else>
                <span v-if="store">
                  {{
                    store.$actions.formatValue({
                      value: row[column],
                      key: column,
                      property
                    })
                  }}
                </span>
                <span v-else>
                  {{
                    Array.isArray(row[column])
                      ? row[column].filter((value: string) => !!value).join(', ')
                      : ![undefined, null].includes(row[column])
                        ? row[column]
                        : '-'
                  }}
                </span>

                <div v-if="getReferenceProperty(property)?.indexes?.length! > 1">
                  <div
                    v-for="(subvalue, index) in getReferenceProperty(property)!.indexes!.slice(1, 2)"
                    :key="`subvalue-${index}`"
                    class="table__cell-subvalue"
                  >
                    {{
                      store!.$actions.formatValue({
                        value: row[column],
                        key: column,
                        property,
                        index: subvalue
                      })
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
        <td
          v-if="actions?.length && breakpoints.md"
          class="no-print"
        >
          <div class="table__cell-actions">
            <aeria-button
              v-for="action in buttonActions(row)"
              :key="`action-${action.action}`"

              small
              variant="transparent"
              :icon="action.icon"

              :style="buttonStyle(row, action)"
              @click="action.click(row)"
            >
              {{ t(action.label) }}
            </aeria-button>

            <aeria-context-menu
              v-if="dropdownActions(row).length > 0"
              v-bind="{
                subject: row,
                actions: dropdownActions(row)
              }"
            >
              <aeria-icon
                v-clickable
                reactive
                icon="dots-three"
              />
            </aeria-context-menu>
          </div>
        </td>

        <td
          v-else-if="actions?.length"
          class="
            no-print
            table__mobile-actions
          "
        >
          <div
            class="table__mobile-actions-grid"
            :style="`grid-template-columns: repeat(${buttonActions(row).length + (dropdownActions(row).length ? 1 : 0)}, 1fr);`"
          >
            <aeria-bare-button
              v-for="action in buttonActions(row)"
              :key="`action-${action.action}`"

              class="table__mobile-actions-button"
              @click="action.click(row)"
            >
              <aeria-icon :icon="action.icon || 'gear'">
                {{ t(action.label) }}
              </aeria-icon>
            </aeria-bare-button>

            <aeria-context-menu
              v-if="dropdownActions(row).length > 0"
              v-bind="{
                subject: row,
                actions: dropdownActions(row)
              }"
            >
              <aeria-icon
                icon="dots-three"
                class="table__mobile-actions-button"
              />
            </aeria-context-menu>
          </div>
        </td>

        <div :id="`dropdown-${row._id}`" />
      </tr>
    </tbody>
    <tfoot>
      <slot
        v-if="$slots.tfoot"
        name="tfoot"
      />

      <tr v-else-if="columns && !rows?.length && !store?.loading.getAll">
        <td :colspan="10">
          <div class="table__empty">
            Não foram encontrados resultados.
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<style scoped src="./aeria-table.less"></style>
