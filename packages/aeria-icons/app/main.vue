<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { icons as catalog, IconStyle } from '@phosphor-icons/core'
import Icon from './components/icon.vue'

const styles = Object.values(IconStyle)

const categories = new Set(catalog.reduce((a, icon) => [
  ...a,
  ...icon.categories,
], []))

const currentStyle = ref(IconStyle.REGULAR)
const currentCategory = ref('')
const color = ref('#00557f')
const search = ref('')
const batch = ref(1)

window.addEventListener('scroll', () => {
  if( document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight ) {
    batch.value = batch.value + 1
  }
})

watch(() => [currentStyle.value, currentCategory.value, search.value], () => {
  window.scrollTo(0, 0)
  batch.value = 1
})

const icons = computed(() => {
  return catalog.filter((icon) => (
    (
      !search.value || (
        new RegExp(search.value).test(icon.name)
        || icon.tags.some((tag: string) => new RegExp(search.value).test(tag))
      )
    ) && (
      !currentCategory.value || (
        (<readonly string[]>icon.categories).includes(currentCategory.value)
      )
    )
  ))
  .slice(0, 30 + (30 * batch.value))
})

const clear = () => {
  currentStyle.value = IconStyle.REGULAR
  currentCategory.value = ''
  search.value = ''
}
</script>

<template>
  <div class="topstrip">
    <div class="logo">
      Aeria Icons
    </div>
    <input v-model.lazy="search"/>
    <input v-model.lazy="color" type="color" />
    <div class="styles">
      <select v-model="currentStyle">
        <option
          v-for="style in styles"
          :key="`style-${style}`"
          :value="style"
        >
          {{ style }}
        </option>
      </select>
    </div>

    <div class="categories">
      <select v-model="currentCategory">
        <option value="">
          All
        </option>
        <option
          v-for="category in categories"
          :key="`category-${category}`"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <button @click="clear">clear</button>
    <a href="https://github.com/sonata-api/aeria-icons" target="_blank">
      <icon name="github-logo" width="32" height="32"></icon>
    </a>
  </div>

  <div class="icons-grid">
    <div
      v-for="icon in icons"
      :key="`icon-${icon.name}`"
      class="icon-container"
    >
      <icon
        v-bind="{
          name: icon.name,
          variant: currentStyle
        }"
        :fill="color"
      ></icon>
      <div class="icon-info">
        <div>{{ icon.name }}</div>
      </div>
    </div>
  </div>
</template>

<style src="./main.less"></style>

