<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@aeria-ui/state-management'
import { STORAGE_NAMESPACE } from '@aeria-ui/core'

import AeriaPanel from '../../../../components/aeria-panel/aeria-panel.vue'
import AeriaForm from '../../../../components/form/aeria-form/aeria-form.vue'
import AeriaButton from '../../../../components/aeria-button/aeria-button.vue'
import AeriaPicture from '../../../../components/aeria-picture/aeria-picture.vue'
import AeriaIcon from '../../../../components/aeria-icon/aeria-icon.vue'
import AeriaMenu from '../../../../components/aeria-menu/aeria-menu.vue'

const router = useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

const editPanel = ref(false)

userStore.$actions.setItem(userStore.currentUser)

const insert = async () => {
  await userStore.$actions.insert({
    what: userStore.item,
  })

  if( typeof localStorage !== 'undefined' ) {
    const auth = localStorage.getItem(`${STORAGE_NAMESPACE}:auth`)
    if( auth ) {
      const authObj = JSON.parse(auth)
      authObj.user = userStore.item
      localStorage.setItem(`${STORAGE_NAMESPACE}:auth`, JSON.stringify(authObj))
    }
  }

  await metaStore.$actions.spawnModal({
    title: 'Feito!',
    body: 'Suas informações foram salvas',
  })

  editPanel.value = false
}

const signout = async () => {
  await userStore.$actions.signout()
  router.push('/user/signin')
}
</script>

<template>
  <aeria-picture
    alt="User picture"
    v-bind="{
      width: '14rem',
      height: '14rem'
    }"

    bordered
    :file-id="userStore.item.picture_file && typeof userStore.item.picture_file === 'object'
      ? userStore.item.picture_file._id
      : userStore.item.picture_file"
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
    "
  >
    <template #caption>
      <div class="profile__user-name">
        {{ userStore.item.name }}
      </div>
    </template>
  </aeria-picture>

  <slot
    v-if="$slots['user-profile']"
    name="user-profile"
  />

  <aeria-menu>
    <template #edit-profile>
      <aeria-icon
        v-clickable
        icon="pencil"
        @click="editPanel = true"
      >
        {{ t('edit_profile', { capitalize: true }) }}
      </aeria-icon>
    </template>

    <template #change-password>
      <aeria-icon
        v-clickable
        icon="key"
        @click="router.push('/dashboard/user/changepass')"
      >
        {{ t('change_password', { capitalize: true }) }}
      </aeria-icon>
    </template>

    <template #signout>
      <aeria-icon
        v-clickable
        icon="sign-out"
        @click="signout"
      >
        {{ t('signout', { capitalize: true }) }}
      </aeria-icon>
    </template>
  </aeria-menu>

  <aeria-panel
    v-model="editPanel"
    float
    close-hint
    :title="t('edit_profile', { capitalize: true })"
    @overlay-click="editPanel = false"
  >
    <aeria-form
      v-model="userStore.item"
      v-bind="{
        collection: 'user',
        form: userStore.$actions.useProperties([
          'name',
          'email',
          'phone',
          'picture_file'
        ]),
        formLayout: userStore.description.formLayout
      }"
    />

    <template #footer>
      <aeria-button
        large
        :loading="userStore.loading.insert"
        @click="insert"
      >
        {{ t('action.save', { capitalize: true }) }}
      </aeria-button>
    </template>
  </aeria-panel>
</template>

<style scoped src="./index.less"></style>
