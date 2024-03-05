<script setup lang="ts">
import { useStore } from 'aeria-ui'

const animalStore = useStore('animal')
</script>

<template>
  <button @click="animalStore.$functions.get">Action!</button>
  <button @click="animalStore.$actions.getAll">Function!</button>
  <button @click="animalStore.$actions.insert({ what: { name: 'thor', specie: 'dog' } })">Insert</button>
  <button @click="animalStore.$actions.inc">Inc</button>
  <button @click="animalStore.$actions.bobby">Thor Bobby</button>

  <component-a></component-a>
  <component-b></component-b>

  <pre>{{ animalStore }}</pre>
</template>
