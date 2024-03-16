<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@aeria-ui/state-management'
import { isLeft, unwrapEither } from '@aeriajs/common'
import AeriaForm from '../../components/form/aeria-form/aeria-form.vue'
import AeriaIcon from '../../components/aeria-icon/aeria-icon.vue'
import AeriaButton from '../../components/aeria-button/aeria-button.vue'
import AeriaCheckbox from '../../components/form/aeria-checkbox/aeria-checkbox.vue'
import AeriaPasswordForm from '../../components/dashboard/aeria-password-form/aeria-password-form.vue'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

if( !metaStore.descriptions.user ) {
  await metaStore.$actions.describe({
    collections: ['user'],
    roles: true,
  })
}

const tosAccepted = ref(false)

const newUser = ref({})
const password = ref({
  password: '',
  confirmation: '',
})

const insert = async () => {
  userStore.item.password = password.value.password
  const userEither = await userStore.$functions.createAccount({
    ...newUser.value,
    password: password.value.password,
  })

  if( isLeft(userEither) ) {
    const error = unwrapEither(userEither)
    await metaStore.$actions.spawnModal({
      title: 'Error',
      body: error,
    })
    return
  }

  await metaStore.$actions.spawnModal({
    title: 'Conta registrada',
    body: 'Verifique o link de confirmação no seu email',
  })

 router.push({
 path: '/user/signin',
})
}
</script>

<template>
  <div>
    <h1>{{ t('signup.header') }}</h1>
    <aeria-icon
      v-clickable
      icon="arrow-left"
      @click="router.push({ path: '/user/signin' })"
    >
      {{ t('signup.signin') }}
    </aeria-icon>
  </div>

  <aeria-form
    v-model="newUser"
    v-bind="{
      collection: 'user',
      form: userStore.$actions.useProperties([
        'name',
        'email',
        'phone'
      ])
    }"
  >
    <template #after>
      <aeria-password-form
        v-slot="{ passwordError }"
        v-model="password"
      >
        <div
          style="
          display: flex;
          flex-direction: column;
          align-items: start;
          gap: 2rem
        "
        >
          <aeria-checkbox
            v-model="tosAccepted"
            :property="{
              type: 'boolean',
              element: 'checkbox'
            }"
          >
            {{ t('signup.tos_checkbox') }}
          </aeria-checkbox>
        </div>

        <aeria-button
          :disabled="!!passwordError || !tosAccepted"
          @click.prevent="insert"
        >
          {{ t('signup.submit') }}
        </aeria-button>
      </aeria-password-form>
    </template>
  </aeria-form>
</template>
