<script setup lang="ts">
import { useStore } from 'aeria-ui'
const animalStore = useStore('animal')
</script>

<template>
  <div>
    specie (component a): {{ animalStore.num }}
  </div>
</template>
