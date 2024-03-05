<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@aeria-ui/state-management'

import AeriaButton from '../../../../components/aeria-button/aeria-button.vue'
import AeriaPanel from '../../../../components/aeria-panel/aeria-panel.vue'
import AeriaPasswordForm from '../../../../components/dashboard/aeria-password-form/aeria-password-form.vue'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const password = ref({
  password: '',
  confirmation: '',
})

const insert = async () => {
  await userStore.$actions.insert({
    what: {
      _id: userStore.item._id,
      password: password.value.password,
    },
  })

  await metaStore.$actions.spawnModal({
    title: 'Feito!',
    body: 'A senha foi atualizada',
  })

  router.back()
}
</script>

<template>
  <aeria-panel style="max-width: 40rem;">
    <aeria-password-form
      v-slot="{ passwordError }"
      v-model="password"
    >
      <aeria-button
        class="passchange__save-button"
        :disabled="!!passwordError"
        @click.prevent="insert"
      >
        Salvar
      </aeria-button>
    </aeria-password-form>
  </aeria-panel>
</template>
