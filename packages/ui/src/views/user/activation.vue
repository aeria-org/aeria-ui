<script setup lang="ts">
import type { user } from '@aeriajs/builtins'
import type { EndpointError, Result } from '@aeriajs/types'
import { useStore } from '@aeria-ui/state-management'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '@aeria-ui/i18n'

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

const password = ref({
  name: '',
  email: '',
  active: false,
  password: '',
  confirmation: '',
})

onMounted(async () => {
  userStore.$actions.signout()
  await getUserInfo()
})

const getUserInfo = async () => {
  const { error, result: userInfo } = await (userStore.$functions.getInfo({
    userId,
    token,
  }) as ReturnType<typeof user.functions.getInfo>)

  if( error ) {
    metaStore.$actions.spawnModal({
      title: `Error! ${error.httpStatus}`,
      body: error.code,
    })
    return
  }

  if(userInfo.active){
    metaStore.$actions.spawnModal({
      title: 'Attention!',
      body: 'User Already Activated',
    })
    return
  }
  password.value.name = userInfo.name
  password.value.email = userInfo.email
}

const confirm = async () => {
  const { error } = await userStore.$actions.custom<Result.Either<EndpointError, { userId: string }>>('activate', {
    password: password.value.password,
    userId,
    token,
  })
  if(error){
    metaStore.$actions.spawnModal({
      title: `Error! ${error.httpStatus}`,
      body: error.code,
    })
    return
  }
  userStore.credentials.email = password.value.email

  metaStore.$actions.spawnModal({
    title: 'Success!',
    body: 'Your account was successfully activated! Try loggin with your email and password.',
  })

  router.push('/user/signin')
}
</script>

<template>
  <div v-if="password.email !== ''">
    <div
      v-if="step === 'password' "
      style="display: grid; gap: 1rem;"
    >
      <h1>{{ t('register_password') }}</h1>
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
          @click.prevent="confirm"
        >
          {{ t('register_password') }}
        </aeria-button>
      </aeria-password-form>
    </div>

    <div
      v-else
      style="display: grid; gap: 1rem;"
    >
      <h1>{{ t('successfully_activated_account') }}</h1>

      <aeria-button @click="router.push('/user/signin')">
        {{ t('go_to_login_page') }}
      </aeria-button>
    </div>
  </div>
  <div
    v-else
    style="display: grid; gap: 1rem;"
  >
    <h1>{{ t('invalid_link') }}</h1>

    <aeria-button @click="router.push('/user/signin')">
      {{ t('go_to_login_page') }}
    </aeria-button>
  </div>
</template>
