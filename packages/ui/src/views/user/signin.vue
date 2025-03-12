<script setup lang="ts">
import type { InstanceConfig } from '@aeria-ui/cli'
import { STORAGE_NAMESPACE, INSTANCE_VARS_SYMBOL } from '@aeria-ui/core'
import { useStore } from '@aeria-ui/state-management'
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import AeriaForm from '../../components/form/aeria-form/aeria-form.vue'
import AeriaButton from '../../components/aeria-button/aeria-button.vue'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const instanceVars = inject<InstanceConfig['site']>(INSTANCE_VARS_SYMBOL, {})

const goToTarget = () => {
  if( typeof localStorage !== 'undefined' ) {
    const { next } = router.currentRoute.value.query
    if( typeof next === 'string' && localStorage.getItem(`${STORAGE_NAMESPACE}:auth:next`) ) {
      return router.push(next)
    }
  }

  return router.push('/dashboard/')
}

const authenticate = async () => {
  const { error } = await userStore.$actions.authenticate(userStore.credentials)
  if( !error ) {
    goToTarget()
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if( event.key === 'Enter' ) {
    if( userStore.credentials.email ) {
      if( userStore.credentials.password ) {
        return authenticate()
      }
    }
  }
}
</script>

<template>
  <div class="signin">
    <h1
      v-if="instanceVars.signinText"
      class="signin__header"
      v-html="instanceVars.signinText"
    />
    <div v-if="instanceVars.signupForm">
      <span>{{ t('signin.no_account') }}&nbsp;</span>
      <router-link to="/user/signup">
        {{ t('signin.create_account') }}
      </router-link>
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
    @keypress="handleEnter"
  />

  <div class="signin__buttons">
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

<style scoped src="./signin.less"></style>

