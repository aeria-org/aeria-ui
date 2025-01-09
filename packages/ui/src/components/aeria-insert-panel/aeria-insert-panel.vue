<script setup lang="ts">
import type { CollectionAction } from '@aeriajs/types'
import { computed, watch, onMounted } from 'vue'
import { useStore } from '@aeria-ui/state-management'
import { useI18n } from '@aeria-ui/i18n'

import AeriaPanel from '../aeria-panel/aeria-panel.vue'
import AeriaForm from '../form/aeria-form/aeria-form.vue'
import AeriaButton from '../aeria-button/aeria-button.vue'
import AeriaContextMenu from '../aeria-context-menu/aeria-context-menu.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

type Props = {
  individualActions?: (CollectionAction<any> & {
    action: string
    click: ()=> void
  })[]
  collection: string
  form?: string[]
  float?: boolean
  fixedRight?: boolean
  visible?: any
  modelValue?: unknown
  readOnly?: boolean
  includeId?: boolean
  includeTimestamps?: boolean
}

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue' | 'insert', value: unknown): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
})

const emit = defineEmits<Emits>()

const metaStore = useStore('meta')
const collectionName = props.collection

const store = useStore(collectionName)

onMounted(() => {
  if( props.modelValue ) {
    store.$actions.setItem(props.modelValue)
  }
})

const form = computed(() => {
  if( props.form ) {
    return store.$actions.useProperties(props.form)
  }

  return store.description.form
    ? store.$actions.useProperties(store.description.form)
    : store.properties
})

const insert = async () => {
  const { error, result } = await store.$actions.deepInsert()
  if( error ) {
    metaStore.$actions.spawnToast({
      text: `${t('error', { capitalize: true })}: ${error.code}`,
      icon: 'warning',
    })
    return
  }

  emit('update:visible', false)
  emit('update:modelValue', result)
  emit('insert', result)
  store.$actions.clearItem()
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
    emit('update:visible', false)
  }
})
</script>

<template>
  <aeria-panel
    v-bind="{
      modelValue: visible,
      loading: store.loading.get,
      float,
      fixedRight,
    }"
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
        collection: collectionName,
        readOnly,
        includeId,
        includeTimestamps,
        form,
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
        v-if="individualActions"
        v-slot="{
          visible: contextMenuVisible,
        }"
        v-bind="{
          subject: store.item,
          actions: individualActions
            .filter(({ action }) => action !== 'spawnEdit'),
          overlayLayer: 60,
        }"
        @action-click="emit('update:visible', false)"
      >
        <aeria-icon
          v-if="store.item._id"
          v-clickable
          reactive
          :active="contextMenuVisible"
          icon="dots-three"
        />
      </aeria-context-menu>
    </template>
    <template
      v-if="!readOnly"
      #footer
    >
      <aeria-button
        v-if="float || fixedRight"
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

