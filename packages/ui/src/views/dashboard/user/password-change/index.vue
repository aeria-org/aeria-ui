<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@aeria-ui/i18n'
import { useStore } from '@aeria-ui/state-management'

import AeriaButton from '../../../../components/aeria-button/aeria-button.vue'
import AeriaPanel from '../../../../components/aeria-panel/aeria-panel.vue'
import AeriaPasswordForm from '../../../../components/dashboard/aeria-password-form/aeria-password-form.vue'
import { CollectionItemWithId, EndpointError, Result } from '@aeriajs/types';

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const { t } = useI18n()

const password = ref({
  password: '',
  confirmation: '',
})

const insert = async () => {
  const { error } = await userStore.$actions.custom<Result.Either<EndpointError, CollectionItemWithId<'user'>>>('editProfile',{
    _id: userStore.item._id,
    password: password.value.password
  })

  if(error){
    metaStore.$actions.spawnModal({
      title: `Error! ${error.httpStatus}`,
      body: error.code,
    })
    return
  }

  metaStore.$actions.spawnModal({
      title: `${t('done', {
  capitalize: true,
  })}!`,
      body: t('password_has_been_changed', {
  capitalize: true,
  }),
  })

  router.back()
}
</script>

<template>
  <aeria-panel
    bordered
    style="--panel-max-width: 40rem;"
  >
    <aeria-password-form
      v-slot="{ passwordError }"
      v-model="password"
    >
      <aeria-button
        class="passchange__save-button"
        :disabled="!!passwordError"
        @click.prevent="insert"
      >
        {{ t('action.save', { capitalize: true }) }}
      </aeria-button>
    </aeria-password-form>
  </aeria-panel>
</template>

