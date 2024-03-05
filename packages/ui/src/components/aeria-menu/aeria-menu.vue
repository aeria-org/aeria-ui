<template>
  <menu class="menu">
    <div
      v-for="slotName in Object.keys($slots)"
      :key="slotName"
      class="menu__entry"
    >
      <slot
        :name="slotName"
      />
    </div>
  </menu>
</template>

<style scoped src="./aeria-menu.less"></style>
