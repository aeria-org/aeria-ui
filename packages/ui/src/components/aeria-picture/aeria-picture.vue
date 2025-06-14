<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { API_URL } from '@aeria-ui/core'

type Props = {
  url?: string
  alt: string
  fileId?: string
  modelValue?: string
  bordered?: boolean
  expandable?: boolean
  meta?: {
    created_at: string
    updated_at: string
    owner: {
      name: string
    }
  }
  objectFit?: CSSProperties['objectFit']
  width?: CSSProperties['width']
  height?: CSSProperties['height']
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

const url = computed(() => {
  if( props.fileId ) {
    return `${API_URL}/file/${props.fileId}/picture`
  }

  return props.url || props.modelValue
})

const expand = ref(false)
</script>

<template>
  <figure class="picture">
    <teleport
      v-if="url && expand"
      to="main"
    >
      <div
        v-overlay="{
          layer: 60,
          click: () => {
            expand = false
          },
        }"
        style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "
      >
        <img
          :src="url"
          :alt="alt"
          :style="{
            maxHeight: '60vh',
            objectFit: 'contain',
          }"

          @click="expand = true"
        >

        <div
          v-if="meta?.owner"
          class="picture__meta"
        >
          {{ t('created_by') }} {{ meta.owner.name }} em {{ formatDateTime(meta.created_at, { hours: true }) }}
        </div>
      </div>
    </teleport>

    <img
      v-if="url"
      :src="url"
      :class="[
        'picture__image',
        { 'picture__image--bordered': bordered },
        { 'picture__image--expandable': expandable },
      ]"
      :style="{
        objectFit,
        width,
        height,
      }"

      @click="() => {
        if( expandable ) {
          expand = true
        }
      }"
    >

    <slot
      v-else-if="$slots.fallback"
      name="fallback"
    />
    <slot v-else-if="$slots.default" />
    <svg
      v-else
      class="picture__background"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      :style="{
        objectFit,
        width,
        height,
      }"
      :class="[
        { 'picture__image--bordered': bordered },
      ]"
    >
      <line
        x1="0"
        y1="0"
        x2="200"
        y2="200"
        stroke="#000"
        vector-effect="non-scaling-stroke"
      />
      <line
        x1="200"
        y1="0"
        x2="0"
        y2="200"
        stroke="#000"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <figcaption v-if="$slots.caption">
      <slot name="caption" />
    </figcaption>
  </figure>
</template>

<style scoped src="./aeria-picture.less"></style>
