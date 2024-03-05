<script setup lang="ts">
const animalStore = STORES.animal
</script>

<template>
  <div>
    specie (from component b): {{ animalStore.num }}
  </div>
</template>
