<script setup lang="ts">
import { inject, watch } from 'vue'
import { isLeft } from '@aeriajs/common'
import { useStore } from '@aeria-ui/state-management'
import { useI18n } from '@aeria-ui/i18n'

import AeriaPanel from '../../../../aeria-panel/aeria-panel.vue'
import AeriaForm from '../../../../form/aeria-form/aeria-form.vue'
import AeriaButton from '../../../../aeria-button/aeria-button.vue'
import AeriaContextMenu from '../../../../aeria-context-menu/aeria-context-menu.vue'
import AeriaIcon from '../../../../aeria-icon/aeria-icon.vue'

import { isInsertVisible } from '../../store'

const metaStore = useStore('meta')
const store = useStore(metaStore.view.collection)
const individualActions = inject('individualActions', [])

// unused
const isInsertReadOnly = false

const insert = async () => {
  const resultEither = await store.$actions.deepInsert()
  if( !isLeft(resultEither) ) {
    isInsertVisible.value = false
  }
}

const { t } = useI18n()

const cancel = () => {
  metaStore.$actions.ask({
    action: () => {
      store.$actions.clearItem()
      store.validationErrors = {}
      isInsertVisible.value = false
    },
    body: t('prompt.close_panel'),
  })
}

watch(() => store.item._id, (_id) => {
  if( _id === null ) {
    isInsertVisible.value = false
  }
})
</script>

<template>
  <aeria-panel
    v-model="isInsertVisible"
    fixed-right
    :loading="store.loading.get"
    @overlay-click="cancel"
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
      <span>&nbsp;{{ t(metaStore.view.collection) }}</span>
    </template>

    <aeria-form
      v-model="store.item"
      v-bind="{
        collection: metaStore.view.collection,
        form: store.properties,
        isReadOnly: isInsertReadOnly,
        layout: store.description.formLayout || {}
      }"

      focus
      @add="$event.preventDefault()"
    >
      <template
        v-for="slotName in Object.keys($slots).filter(key => key.startsWith('field-'))"
        #[slotName]="slotProps"
      >
        <slot
          v-bind="slotProps"
          :name="slotName"
        />
      </template>
    </aeria-form>
    <template #extra>
      <aeria-context-menu
        v-bind="{
          subject: store.item,
          actions: individualActions
            .filter(({ action }) => action !== 'ui/spawnEdit')
        }"
        @action-click="isInsertVisible = false"
      >
        <aeria-icon
          v-if="store.item._id"
          v-clickable
          reactive
          icon="dots-three"
        />
      </aeria-context-menu>
    </template>
    <template #footer>
      <aeria-button
        variant="transparent"
        @click="cancel"
      >
        {{ t('action.cancel', { capitalize: true }) }}
      </aeria-button>
      <aeria-button
        large
        :disabled="!store.isInsertReady || isInsertReadOnly || store.loading.get"
        :loading="store.loading.insert"
        @click="insert"
      >
        {{ t('action.insert', { capitalize: true }) }}
      </aeria-button>
    </template>
  </aeria-panel>
</template>

