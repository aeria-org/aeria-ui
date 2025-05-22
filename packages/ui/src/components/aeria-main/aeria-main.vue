<script setup lang="ts">
import { useStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import { computed } from 'vue'
import AeriaPanel from '../aeria-panel/aeria-panel.vue'
import AeriaPrompt from '../dashboard/aeria-prompt/aeria-prompt.vue'
import AeriaToast from '../dashboard/aeria-toast/aeria-toast.vue'

const metaStore = useStore('meta')
const theme = computed(() => metaStore.themeOverride || metaStore.theme)
</script>

<template>
  <main
    id="main"
    :class="[
      'main',
      `main--${theme}`,
      { 'dark': theme === 'dark' },
    ]"
  >
    <Suspense>
      <router-view v-slot="{ Component }">
        <component :is="Component">
          <template
            v-for="slotName of Object.keys($slots)"
            #[slotName]
          >
            <slot :name="slotName" />
          </template>
        </component>
      </router-view>
    </Suspense>

    <slot />

    <aeria-panel
      v-model="metaStore.modal.visible"
      float
      close-hint
      v-bind="metaStore.modal"
      :overlay-layer="70"
      @overlay-click="metaStore.modal.visible = false"
    >
      <div
        v-if="metaStore.modal.body"
        style="white-space: pre-wrap"
        v-html="metaStore.modal.body"
      />

      <component
        :is="metaStore.modal.component"
        v-if="metaStore.modal.component"
      />
    </aeria-panel>

    <aeria-prompt
      v-if="metaStore.prompt.visible"
      v-bind="metaStore.prompt"
      v-html="metaStore.prompt.body"
    ></aeria-prompt>

    <div class="main__toasts">
      <aeria-toast
        v-for="toast in metaStore.toasts"
        v-bind="toast"
        :key="`toast-${toast.itr}`"
      >
        <div v-html="t(toast.text)" />
      </aeria-toast>
    </div>
  </main>
</template>

<style scoped src="./aeria-main.less"></style>
<style src="../../less/main.less"></style>
