<script setup lang="ts">
const animalStore = useStore('animal')
</script>

<template>
  <div>
    specie (from component b): {{ animalStore.num }}
  </div>
</template>
