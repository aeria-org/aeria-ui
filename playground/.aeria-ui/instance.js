// @ts-check
import vueRouter from 'unplugin-vue-router/vite'

/** @type {import('@aeria-ui/cli').InstanceConfig} */
export default {
  site: {
    title: 'Quickstart',
    signinText: 'Admin panel',
    signupForm: true,
  },
  icons: {
    libraries: [
      '@aeria-ui/ui',
      'aeria-app-layout',
    ],
    safeList: [
      'moon',
      'sun',
    ]
  },
  vite: {
    // resolve: {
    //   preserveSymlinks: true
    // },
    plugins: [
      vueRouter({
        dts: './.aeria-ui/typed-router.d.ts'
      })
    ],
  },
}

