import { registerStore, createCollectionStore } from 'aeria-ui'
import { computed } from 'vue'

type Animal = {
  name: string
  owner: boolean
}

export const animal = () => registerStore(() => {
  return createCollectionStore<Animal>()({
    $id: 'animal',
    state: {
      num: 0,
      specie: '',
      deep: {
        dog: {
          name: 'thor',
        },
      },
    },
    getters: (state) => ({
      computedName: computed(() => `doguinho: ${state.deep.dog.name}`),
    }),
    actions: (state) => ({
      inc() {
        state.num += 1
      },
      bobby() {
        state.deep.dog.name = 'thor bobby'
      },
    }),
  })
})

