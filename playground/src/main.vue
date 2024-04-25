<script setup lang="ts">
import { useStore } from 'aeria-ui'

const animalStore = useStore('animal')
</script>

<template>
  <main
    id="main"
    class="
      main
      main--default
      tw-p-4
    "
  >
    <div class="
      tw-flex
      tw-gap-1
    ">
      <aeria-button small @click="animalStore.$actions.inc">Inc</aeria-button>
      <aeria-button small @click="animalStore.$actions.bobby">Thor Bobby</aeria-button>
    </div>

    <component-a></component-a>
    <component-b></component-b>

    <pre>{{ animalStore }}</pre>

    <div class="
      tw-inline-flex
      tw-flex-col
      tw-gap-2
    ">
      <aeria-input v-model="animalStore.specie">
        Espécie
      </aeria-input>
      <aeria-input v-model="animalStore.deep.dog.name">
        Nome cachorro
      </aeria-input>
    </div>
  </main>
</template>

