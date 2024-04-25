import { registerStore } from 'aeria-ui'
import { reactive } from 'vue'

export const animal = registerStore(() => {
  const state = reactive({
    num: 0,
    specie: '',
    deep: {
      dog: {
        name: 'thor',
      },
    },
  })
  const store = {
    $id: 'animal',
    state,
    getters: {
      computedName: () => `sr ${state.deep.dog.name}`
    },
    actions: {
      inc: () => {
        state.num += 1
      },
      bobby: () => {
        state.deep.dog.name = 'thor bobby'
      },
    }
  }

  return store
})

