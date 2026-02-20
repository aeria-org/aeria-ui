<script setup lang="ts">
import { useStore } from 'aeria-ui'
import { watch, reactive } from 'vue'

const state = reactive({
  date: new Date(),
  date2: '2025-01-15T00:00:00.000Z',
  datetime: new Date(),
  ceps: [],
  color: null,
})

const animalStore = useStore('animal')
watch(() => animalStore.specie, (value) => {
  console.log('modelValue:', value)
})
</script>

<template>
  <main
    id="main"
    class="
      main
      main--default
    "
  >
    <div class="main__actions">
      <aeria-button small @click="animalStore.$actions.inc" icon="user">Inc</aeria-button>
      <aeria-button small @click="animalStore.$actions.reassign">Re-assign</aeria-button>
    </div>

    <div class="main__content">
      <component-a></component-a>
      <component-b></component-b>

      <pre>{{ animalStore }}</pre>

      <div>
        <aeria-input
          v-model="animalStore.specie"
          :property="{
            type: 'string',
          }"
        >
          Espécie
        </aeria-input>
        <aeria-input v-model="animalStore.deep.dog.name">
          Nome cachorro
        </aeria-input>
      </div>

      <pre>{{ state }}</pre>
      <aeria-select
          v-model="state.color"
          boolean-ref
          :property="{
            enum: [
              'true',
              'false',
            ],
          }"
        >
      </aeria-select>
      <aeria-form
        v-model="state"
        :property="{
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
            date2: {
              type: 'string',
              format: 'date',
            },
            datetime: {
              type: 'string',
              format: 'date-time',
            },
            bool: {
              type: 'boolean',
            },
            color: {
              enum: [
                'blue',
                'yellow',
                'green',
              ],
            },
            ceps: {
              type: 'array',
              items: {
                type: 'string',
                mask: '##-#'
              }
            }
          }
        }"
      ></aeria-form>
      <aeria-button @click="state.date = new Date">Update date</aeria-button>
    </div>

  </main>
</template>

