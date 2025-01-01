<script setup lang="ts">
type Props = {
  inactive?: boolean
  horizontal?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="[
      'card',
      { 'card--inactive': inactive },
      { 'card--horizontal': horizontal },
    ]"
  >
    <div class="card__picture">
      <slot />
    </div>

    <div class="card__footer">
      <div class="card__footer-upper">
        <div>
          <slot name="footer" />
        </div>
        <div class="card__actions">
          <slot
            v-if="$slots.actions"
            name="actions"
          />
        </div>
      </div>

      <div class="card__badge">
        <slot name="badge" />
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-card.less"></style>
