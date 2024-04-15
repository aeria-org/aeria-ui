<script setup lang="ts">
import { STORAGE_NAMESPACE } from '@aeria-ui/core'
import { useStore } from '@aeria-ui/state-management'
import { useRouter } from 'vue-router'
import { isRight } from '@aeriajs/common'
import AeriaForm from '../../components/form/aeria-form/aeria-form.vue'
import AeriaButton from '../../components/aeria-button/aeria-button.vue'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const goToTarget = () => {
  const { next } = router.currentRoute.value.query
  router.push(next && localStorage.getItem(`${STORAGE_NAMESPACE}:auth:next`) === next
      ? next
      : '/dashboard/')
}

const authenticate = async () => {
  const resultEither = await userStore.$actions.authenticate(userStore.credentials)
  if( isRight(resultEither) ) {
    goToTarget()
  }
}
</script>

<template>
  <div style="text-align: center">
    <h1
      v-if="instanceVars.signinText"
      style="font-size: 2.4rem; margin-bottom: .8rem"
      v-html="instanceVars.signinText"
    />
    <div v-if="instanceVars.signupForm">
      <span>{{ t('signin.no_account') }}&nbsp;</span>
      <span
        v-clickable
        style="color: #2d96fa"
        @click="router.push('/user/signup')"
      >
        {{ t('signin.create_account') }}
      </span>
    </div>
  </div>

  <aeria-form
    v-model="userStore.credentials"
    :form="{
      email: {
        type: 'string',
        icon: 'user',
      },
      password: {
        type: 'string',
        icon: 'lock',
        inputType: 'password'
      }
    }"
  />

  <div
    style="
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  "
  >
    <aeria-button
      :loading="userStore.loading.authenticate"

      :disabled="
        !userStore.credentials.email
          || !userStore.credentials.password"
      @click="authenticate"
    >
      {{ t('action.signin', { capitalize: true }) }}
    </aeria-button>

    <aeria-button
      v-if="userStore.currentUser._id && !metaStore.isLoading"
      :disabled="userStore.loading.authenticate || metaStore.isLoading"
      @click="goToTarget"
    >
      {{ t('signin.proceed_as') }} {{ userStore.currentUser.name }}
    </aeria-button>
  </div>
</template>

