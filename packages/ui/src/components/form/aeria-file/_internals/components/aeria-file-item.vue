<script setup lang="ts">
import type { File as AeriaFile } from '@aeriajs/builtins'
import type { UploadedFile } from '../../../types.js'

type Props = {
  modelValue: AeriaFile | UploadedFile
}

type NormalizedFile = {
  name: string
}

const props = defineProps<Props>()
const file: NormalizedFile = '_id' in props.modelValue
  ? props.modelValue
  : props.modelValue.file
</script>

<template>
  <div class="file">
    {{ file.name }}
  </div>
</template>

<style scoped src="./aeria-file-item.less"></style>

