<script setup lang="ts">
import { useStore } from '@aeria-ui/state-management'
import { user } from '@aeriajs/builtins'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AeriaForm from '../../components/form/aeria-form/aeria-form.vue'
import AeriaButton from '../../components/aeria-button/aeria-button.vue'
import AeriaPasswordForm from '../../components/dashboard/aeria-password-form/aeria-password-form.vue'

type Step =
  | 'success'
  | 'password'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const step = router.currentRoute.value.query.step as Step | undefined || 'success'
const userId = router.currentRoute.value.query.u
const token = router.currentRoute.value.query.t

const { error, result: userInfo } = await <ReturnType<typeof user.functions.getInfo>>userStore.$functions.getInfo({
  userId,
  token,
})

if( error )
{
  throw error
}

const password = ref({
  name: userInfo.name,
  email: userInfo.email,
  password: '',
  confirmation: '',
})

const confirm = async () => {
  await userStore.$actions.custom(`activate?u=${userId}&t=${token}`, {
    password: password.value.password,
  })

  userStore.credentials.email = password.value.email

  await metaStore.$actions.spawnModal({
    title: 'Sucesso!',
    body: 'Sua conta foi ativada com sucesso. Experimente fazer login com o seu email e senha.',
  })

  router.push('/user/signin')
}
</script>

<template>
  <div
    v-if="step === 'password'"
    style="display: grid; gap: 1rem;"
  >
    <h1>Cadastre uma senha</h1>
    <aeria-form
      v-model="password"
      :form="{
        name: {
          type: 'string',
          readOnly: true
        },
        email: {
          type: 'string',
          readOnly: true
        },
      }"
    />

    <aeria-password-form
      v-slot="{ passwordError }"
      v-model="password"
    >
      <aeria-button
        :disabled="!!passwordError"
        @click="confirm"
      >
        Cadastrar senha
      </aeria-button>
    </aeria-password-form>
  </div>

  <div
    v-else
    style="display: grid; gap: 1rem;"
  >
    <h1>Conta ativada com sucesso!</h1>

    <aeria-button @click="router.push('/user/signin')">
      Ir para a página de login
    </aeria-button>
  </div>
</template>
