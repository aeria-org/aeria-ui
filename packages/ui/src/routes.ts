import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export const userRoutes = (component: Component | (()=> Promise<Component>), children: RouteRecordRaw[] = []): RouteRecordRaw => ({
  path: '/user',
  name: '/builtin:user',
  component,
  children: children.concat([
    {
      path: 'invite/:id',
      name: '/user/invite/:id',
      redirect: (to) => {
        return {
          path: '/user/signup',
          params: {
            inviteId: to.params.id,
          },
        }
      },
    },
    {
      path: 'signin',
      name: '/user/signin',
      component: () => import('./views/user/signin.vue'),
      meta: {
        title: 'Autenticação',
      },
    },
    {
      path: 'signup',
      name: '/user/signup',
      component: () => import('./views/user/signup.vue'),
      meta: {
        title: 'Registro',
      },
    },
    {
      path: 'activation',
      name: '/user/activation',
      component: () => import('./views/user/activation.vue'),
      meta: {
        title: 'Ativação',
      },
    },
  ]),
})

export const dashboardRoutes = (component: Component | (()=> Promise<Component>), children: RouteRecordRaw[] = []): RouteRecordRaw => ({
  path: '/dashboard',
  name: '/builtin:dashboard',
  component,
  redirect: {
    name: '/dashboard/',
  },
  meta: {
    title: 'Dashboard',
  },
  children: children.concat([
    {
      path: 'c/:collection?',
      name: '/dashboard/crud',
      props: true,
      components: {
        default: () => import('./views/dashboard/crud-view/crud-view.vue'),
        topbar: () => import('./components/dashboard/aeria-crud-topbar/aeria-crud-topbar.vue'),
      },
      meta: {
        title: '%viewTitle%',
      },
    },
    {
      path: 'user',
      name: '/dashboard/user',
      meta: {
        title: 'user',
        icon: 'users',
      },
      redirect: '/dashboard/c/user',
      children: [
        {
          path: 'profile',
          component: () => import('./views/dashboard/user/profile/profile.vue'),
          meta: {
            title: 'Meu perfil',
            icon: 'user-square',
          },
        },
        {
          path: 'changepass',
          name: '/dashboard/user/changepass',
          component: () => import('./views/dashboard/user/password-change/password-change.vue'),
          meta: {
            title: 'Mudar senha',
            icon: 'lock',
          },
        },
      ],
    },
  ]),
})

