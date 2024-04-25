<script setup lang="ts">
import { useStore } from 'aeria-ui'

const animalStore = useStore('animal')
</script>

<template>
  <main
    id="main"
    class="main main--default"
  >
    <div class="
      tw-flex
      tw-gap-2
    ">
      <aeria-button @click="animalStore.$actions.inc">Inc</aeria-button>
      <aeria-button @click="animalStore.$actions.bobby">Thor Bobby</aeria-button>
    </div>

    <component-a></component-a>
    <component-b></component-b>

    <pre>{{ animalStore }}</pre>

    <aeria-input v-model="animalStore.deep.dog.name">
      Nome cachorro
    </aeria-input>
  </main>
</template>
