<script setup lang="ts">
import { inject, watch } from 'vue'
import { useStore } from '@aeria-ui/state-management'
import { useI18n } from '@aeria-ui/i18n'

import AeriaPanel from '../aeria-panel/aeria-panel.vue'
import AeriaForm from '../form/aeria-form/aeria-form.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaContextMenu from '../aeria-context-menu/aeria-context-menu.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

type Props = {
  collection?: string
  modelValue?: boolean | string
  readOnly?: boolean
  includeId?: boolean
  includeTimestamps?: boolean
}

type Emits = {
  (e: 'update:modelValue', value: boolean): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const metaStore = useStore('meta')
const store = useStore(props.collection || metaStore.view.collection)
const individualActions = inject('individualActions', [])

const insert = async () => {
  const { error } = await store.$actions.deepInsert()
  if( !error ) {
    emit('update:modelValue', false)
  }
}

const { t } = useI18n()

const askToCancel = () => {
  metaStore.$actions.ask({
    action: () => {
      store.$actions.clearItem()
      store.validationErrors = {}
      emit('cancel')
    },
    body: t('prompt.close_panel'),
  })
}

const spawnClipboardToast = () => {
  return metaStore.$actions.spawnToast({
    icon: 'info',
    text: t('copied_to_clipboard'),
  })
}

watch(() => store.item._id, (_id) => {
  if( _id === null ) {
    emit('update:modelValue', false)
  }
})
</script>

<template>
  <aeria-panel
    :loading="store.loading.get"
    @overlay-click="askToCancel"
  >
    <template
      v-if="$slots.header"
      #header
    >
      <slot name="header" />
    </template>

    <aeria-form
      v-model="store.item"
      v-bind="{
        readOnly,
        includeId,
        includeTimestamps,
        collection: metaStore.view.collection,
        form: store.description.form
          ? store.$actions.useProperties(store.description.form)
          : store.properties,
        layout: store.description.formLayout || {}
      }"

      focus
      @clipboard-copy="spawnClipboardToast"
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
            .filter(({ action }) => action !== 'ui:spawnEdit')
        }"
        @action-click="emit('update:modelValue', false)"
      >
        <aeria-icon
          v-if="store.item._id"
          v-clickable
          reactive
          icon="dots-three"
        />
      </aeria-context-menu>
    </template>
    <template
      v-if="!readOnly"
      #footer
    >
      <aeria-button
        variant="transparent"
        @click="askToCancel"
      >
        {{ t('action.cancel', { capitalize: true }) }}
      </aeria-button>
      <aeria-button
        large
        :disabled="!store.isInsertReady || store.loading.get"
        :loading="store.loading.insert"
        @click="insert"
      >
        {{ t('action.insert', { capitalize: true }) }}
      </aeria-button>
    </template>
  </aeria-panel>
</template>

