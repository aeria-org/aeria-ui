<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScrollObserver } from '@aeria-ui/core'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

// #region props
type Props = {
  closeHint?: boolean
  modelValue?: any
  title?: string
  float?: boolean
  fixedRight?: boolean
  floating?: boolean
  loading?: boolean
  bordered?: boolean
  overlay?: boolean
  invisibleOverlay?: boolean
  collapsed?: boolean
  collapsible?: boolean
  fill?: boolean
  fillFooter?: boolean
  transparent?: boolean
  transparentMobile?: boolean
  outerHeader?: boolean
  overlayLayer?: number
}
// #endregion props

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  closeHint: false,
  modelValue: true,
})

const emit = defineEmits<{
  (e:
    | 'update:modelValue'
    | 'update:collapsed'
    | 'update:closeHint',
    value: boolean
  ): void
  (e: 'overlayClick'): void
  (e: 'close'): void
}>()

const isFloating = computed(() => props.floating || props.float)
const isCollapsed = ref(props.collapsed)

const body = ref<HTMLElement | null>(null)
const { reachedEnd } = useScrollObserver(body)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const overlayClick = () => {
  emit('overlayClick')
}

const toggleCollapsed = (value: boolean) => {
  emit('update:collapsed', value)
  isCollapsed.value = value
}
</script>

<template>
  <div
    v-if="modelValue"
    v-overlay="{
      condition: overlay || fixedRight || isFloating,
      invisible: invisibleOverlay,
      click: overlayClick,
      layer: overlayLayer || (isFloating
        ? 60
        : fixedRight
          ? 50
          : 0
      )
    }"

    :class="`
      panel
      ${fixedRight && 'panel--fixed'}
  `"
  >
    <component
      :is="
        isFloating
          ? 'dialog'
          : 'div'
      "

      data-component="panel"
      :class="`
        aeria-surface
        panel__content
        ${isFloating && 'panel__content--floating'}
        ${bordered && 'panel__content--bordered'}
        ${fixedRight && 'panel__content--fixed-right'}
        ${transparent && 'panel__content--transparent'}
        ${transparentMobile && 'panel__content--transparent-mobile'}
        ${outerHeader && 'panel__content--outer-header'}
      `"
      @click="$event.stopPropagation()"
    >
      <div
        v-if="$slots.header || title"
        :class="`
          panel__header
          ${isCollapsed && 'panel__header--collapsed'}
          ${outerHeader && 'panel__header--outer'}
      `"
      >
        <div class="panel__header-left">
          <slot
            v-if="$slots.header"
            name="header"
          />
          <div v-else-if="title">
            {{ title }}
          </div>
          <div
            v-if="$slots.extra"
            style="margin-left: auto"
          >
            <slot name="extra" />
          </div>
        </div>

        <aeria-icon
          v-if="collapsible && isCollapsed"
          v-clickable
          reactive
          icon="plus"
          @click="toggleCollapsed(!isCollapsed)"
        />
        <aeria-icon
          v-else-if="collapsible && !isCollapsed"
          v-clickable
          reactive
          icon="minus"
          @click="toggleCollapsed(!isCollapsed)"
        />
        <aeria-icon
          v-else-if="closeHint"
          v-clickable
          reactive
          icon="x"
          @click="close"
        />
      </div>

      <div
        v-if="!isCollapsed"
        ref="body"
        v-loading="loading"
        :class="`
          panel__body
          ${fill || 'panel__body--padded'}
      `"
      >
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        :class="`
          panel__footer
          ${fillFooter || 'panel__footer--padded'}
          ${reachedEnd || 'panel__footer--shadowed'}
        `"
      >
        <slot name="footer" />
      </div>
    </component>
  </div>
</template>

<style scoped src="./aeria-panel.less"></style>

