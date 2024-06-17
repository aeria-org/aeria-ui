<script setup lang="ts">
import type { Property, FileProperty, EndpointError, Result } from '@aeriajs/types'
import type { FormFieldProps } from '../types'
import { ref, computed } from 'vue'
import { request, API_URL } from '@aeria-ui/core'
import { t } from '@aeria-ui/i18n'
import { useParentStore, getStoreId } from '@aeria-ui/state-management'
import AeriaPicture from '../../aeria-picture/aeria-picture.vue'
import AeriaButton from '../../aeria-button/aeria-button.vue'

type Props = FormFieldProps<any, Property & FileProperty> & {
  meta?: Record<string, any>
  modelValue?: any
  content?: any
}

type TempFile = {
  tempId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:content' | 'change', value: string | ArrayBuffer | null): void
  (e: 'update:modelValue', value: File | TempFile | null): void
}>()

const parentStoreId = getStoreId()
const store = parentStoreId
  ? useParentStore()
  : null

const fileRef = ref<File | null>(null)

const preview = computed(() =>
  fileRef.value
    ? URL.createObjectURL(fileRef.value)
    : props.modelValue?.link)

const isImage = computed(() =>
  (/^image\//.test(props.modelValue?.type) && !fileRef.value?.type)
    || /^image\//.test(fileRef.value?.type!))

const readFile = (file: File) => new Promise<string | ArrayBuffer | null>((resolve) => {
  const fr = new FileReader()
  fr.onload = () => resolve(fr.result)
  fr.readAsArrayBuffer(file)
})

const clearPreview = () => {
  fileRef.value = null
}

const insert = async (event: Event) => {
  fileRef.value = (event.target as HTMLInputElement).files![0]

  const file = fileRef.value
  const content = await readFile(file)

  if( store ) {
    const { data: { error, result } } = await request<Result.Either<EndpointError, TempFile>>(`${API_URL}/${store.$id}/upload?name=${file.name}`, content, {
      params: {
        method: 'POST',
        headers: {
          'content-type': file.type || 'application/octet-stream',
          'x-stream-request': '1',
        },
      },
    })

    if( error ) {
      return
    }

    emit('update:modelValue', result)

  } else {
    emit('update:modelValue', file)
  }

  emit('update:content', content)
  emit('change', content)
}

const remove = async () => {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="file">
    <div v-if="fileRef || modelValue?._id">
      <aeria-picture
        v-if="isImage"
        v-model="preview"
        alt="Image preview"
        :class="`
          file__image
          ${(!store || modelValue?._id) || 'file__image--unsent'}
        `"
      />
      <a
        v-if="modelValue?._id"
        :href="modelValue.download_link"
      >
        {{ modelValue.filename }}
      </a>
    </div>
    <div class="file__actions">
      <input
        ref="file"
        type="file"
        :accept="property?.accept?.join(',')"
        @change="insert"
      >
      <div
        v-if="fileRef"
        class="file__buttons"
      >
        <aeria-button
          small
          @click.prevent="clearPreview"
        >
          {{ t('action.clear', { capitalize: true }) }}
        </aeria-button>
      </div>
      <div
        v-else-if="modelValue?._id"
        class="file__buttons"
      >
        <aeria-button
          small
          @click.prevent="remove"
        >
          {{ t('action.remove', { capitalize: true }) }}
        </aeria-button>
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-file.less"></style>
