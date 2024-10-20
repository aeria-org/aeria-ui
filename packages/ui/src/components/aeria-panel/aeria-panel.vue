<script setup lang="ts">
import { ref } from 'vue'
import { useScrollObserver } from '@aeria-ui/core'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

// #region props
type Props = {
  closeHint?: boolean
  modelValue?:
    | boolean
    | object
  title?: string
  float?: boolean
  fixedRight?: boolean
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
      condition: overlay || fixedRight || float,
      invisible: invisibleOverlay,
      click: overlayClick,
      layer: overlayLayer || (float
        ? 60
        : fixedRight
          ? 50
          : 0
      )
    }"

    :class="[
      'panel',
      { 'panel--fixed': fixedRight },
    ]"
  >
    <Component
      :is="
        float || fixedRight
          ? 'dialog'
          : 'div'
      "

      data-component="panel"
      :class="[
        'aeria-surface',
        'panel__content',
        { 'panel__content--float': float },
        { 'panel__content--bordered': bordered },
        { 'panel__content--fixed-right': fixedRight },
        { 'panel__content--transparent': transparent },
        { 'panel__content--transparent-mobile': transparentMobile },
        { 'panel__content--outer-header': outerHeader },
      ]"
      @click="$event.stopPropagation()"
    >
      <div
        v-if="$slots.header || title"
        :class="[
          'panel__header',
          { 'panel__header--collapsed': isCollapsed },
          { 'panel__header--outer': outerHeader },
        ]"
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
        tabindex="0"
        :class="[
          'panel__body',
          { 'panel__body--padded': fill },
        ]"
      >
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        :class="[
          'panel__footer',
          { 'panel__footer--padded': fillFooter },
          { 'panel__footer--shadowed': reachedEnd },
        ]"
      >
        <slot name="footer" />
      </div>
    </component>
  </div>
</template>

<style scoped src="./aeria-panel.less"></style>

