# `@aeria-ui/theme`

This package provides an API to develop Aeria UI themes.

Example usage:

```vue
<script setup lang="ts">
import { initTheme, routes, isCurrent, routeClick } from '@aeria-ui/theme'
import { t } from 'aeria'

initTheme()
</script>

<template>
  <div>
    <nav>
      <div
        v-for="route in routes"
        :key="route.name"
        :class="{
          'navbar__item': true,
          'navbar__item--current': isCurrent(route)
        }"

        @click.stop="routeClick(item)"
      >
        {{ t(route.meta.title) }}
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>
```

