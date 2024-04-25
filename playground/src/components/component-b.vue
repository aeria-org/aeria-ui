<script setup lang="ts">
import { useStore } from 'aeria-ui'
const animalStore = useStore('animal')
</script>

<template>
  <div>
    specie (from component b): {{ animalStore.num }}
  </div>
</template>
