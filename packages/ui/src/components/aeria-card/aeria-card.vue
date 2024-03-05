<script setup lang="ts">
type Props = {
  inactive?: boolean
  horizontal?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="`
    card
    ${inactive && 'card--inactive'}
    ${horizontal && 'card--horizontal'}
  `"
  >
    <div class="card__picture">
      <slot />
    </div>

    <div class="card__footer">
      <div class="card__footer-upper">
        <div>
          <slot name="footer" />
        </div>
        <slot
          v-if="$slots.actions"
          name="actions"
        />
      </div>

      <div class="card__badge">
        <slot name="badge" />
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-card.less"></style>
