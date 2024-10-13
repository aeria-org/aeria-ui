<script setup lang="ts">
import type { Property, FileProperty, ArrayProperty, EndpointError, Result } from '@aeriajs/types'
import type { File as AeriaFile } from '@aeriajs/builtins'
import type { FormFieldProps, UploadedFile } from '../types.js'
import { computed } from 'vue'
import { getReferenceProperty } from '@aeriajs/common'
import { request, API_URL } from '@aeria-ui/core'
import { useParentStore, getStoreId } from '@aeria-ui/state-management'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'
import AeriaFileItem from './_internals/components/aeria-file-item.vue'

type Props = FormFieldProps<
  | UploadedFile
  | AeriaFile
  | (UploadedFile | AeriaFile)[]
  | null,
  Property & (FileProperty | ArrayProperty<FileProperty>)
> & {
  meta?: Record<string, unknown>
  content?: unknown
  multiple?: boolean
}

const props = defineProps<Props>()
const fileProperty = props.property && getReferenceProperty(props.property) as FileProperty

const emit = defineEmits<{
  (e: 'update:content' | 'change', value: (UploadedFile | AeriaFile)[]): void
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()

const parentStoreId = getStoreId()
const store = parentStoreId
  ? useParentStore()
  : null

const multiple = props.multiple || (props.property && 'type' in props.property && props.property.type === 'array')
const fileList = computed(() => {
  if( !props.modelValue ) {
    return
  }

  return Array.isArray(props.modelValue)
    ? props.modelValue
    : [props.modelValue]
})

const readFile = (file: File) => new Promise<string | ArrayBuffer | null>((resolve) => {
  const fr = new FileReader()
  fr.onload = () => resolve(fr.result)
  fr.readAsArrayBuffer(file)
})

const insert = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if( !files ) {
    return
  }

  const uploadedFiles: (UploadedFile | AeriaFile)[] = []

  for( const file of files ) {
    const content = await readFile(file)

    if( store ) {
      const { data: { error, result } } = await request<Result.Either<EndpointError, UploadedFile>>(`${API_URL}/${store.$id}/upload?name=${file.name}`, content, {
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

      uploadedFiles.unshift({
        tempId: result.tempId,
        file,
      })

    } else {
      uploadedFiles.unshift({
        file,
      })
    }
  }

  if( multiple ) {
    emit('update:modelValue', Array.isArray(props.modelValue)
      ? uploadedFiles.concat(props.modelValue)
      : uploadedFiles)
  } else {
    emit('update:modelValue', uploadedFiles[0])
  }

  emit('update:content', uploadedFiles)
  emit('change', uploadedFiles)
}

const remove = async (index: number) => {
  if( !props.modelValue ) {
    throw new Error
  }

  const files = Array.isArray(props.modelValue)
    ? props.modelValue.filter((_, i) => i !== index)
    : []

  if( multiple ) {
    emit('update:modelValue', files)
  } else {
    emit('update:modelValue', null)
  }

  emit('update:content', files)
  emit('change', files)
}
</script>

<template>
  <div class="file">
    <input
      v-if="!readOnly"
      ref="file"
      type="file"
      :accept="fileProperty?.accept?.join(',')"
      :multiple
      @change="insert"
    >

    <div
      v-if="fileList && fileList.length > 0"
      class="file__list"
    >
      <aeria-file-item
        v-for="(item, index) in fileList"
        :key="
          '_id' in item
            ? String(item._id)
            : item.file.name
        "
        :model-value="item"
      >
        <aeria-icon
          v-if="!readOnly"
          v-clickable
          reactive
          icon="trash"
          @click="remove(index)"
        />
      </aeria-file-item>
    </div>
  </div>
</template>

<style scoped src="./aeria-file.less"></style>

