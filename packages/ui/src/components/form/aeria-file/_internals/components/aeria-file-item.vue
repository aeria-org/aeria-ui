<script setup lang="ts">
import type { File as AeriaFile } from '@aeriajs/builtins'
import type { UploadedFile } from '../../../types.js'

type Props = {
  modelValue: AeriaFile | UploadedFile
}

type NormalizedFile =
  | {
    name: string
    type: string
    size: number
  }
  | {
    _id: unknown
    name: string
    type: string
    size: number
    link: string
  }

const props = defineProps<Props>()
const file: NormalizedFile = '_id' in props.modelValue
  ? props.modelValue
  : props.modelValue.file

const humanReadableSize = (size: number) => {
  const i = size === 0
    ? 0
    : Math.floor(Math.log(size) / Math.log(1024))

  const numeric = (size / Math.pow(1024, i)).toFixed(2)
  return `${numeric} ${[
'B',
'kB',
'MB',
'GB',
'TB',
][i]}`
}
</script>

<template>
  <div class="item">
    <aeria-picture
      v-if="'_id' in file && file.type.startsWith('image/')"
      bordered
      expandable
      :url="file.link"
      class="item__picture"
    />

    <div class="item__presentation">
      <aeria-icon
        v-if="'_id' in file"
        icon="arrow-square-out"
        :href="file.link"
        target="_blank"
        class="
          item__name
          item__name--link
        "
      >
        {{ file.name }}
      </aeria-icon>
      <div
        v-else
        class="item__name"
      >
        {{ file.name }}
      </div>
      <div class="item__size">
        {{ humanReadableSize(file.size) }}
      </div>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped src="./aeria-file-item.less"></style>

