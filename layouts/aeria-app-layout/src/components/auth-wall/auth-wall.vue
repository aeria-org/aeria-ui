<script setup lang="ts">
import { provide } from 'vue'

provide('buttonSize', 'large')
provide('inputVariant', 'bold')
provide('innerInputLabel', true)
</script>

<template>
  <div class="auth">
    <div class="
      auth__content
      aeria-surface
    ">
      <div class="auth__view">
        <router-view></router-view>
      </div>
    </div>
    <div class="auth__background"></div>
  </div>
</template>

<style scoped src="./auth-wall.less"></style>
