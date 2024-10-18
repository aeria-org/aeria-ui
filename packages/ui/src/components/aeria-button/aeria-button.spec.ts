import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import AeriaButton from './aeria-button.vue'

test('renders aeria-button correctly', () => {
  const wrapper = mount(AeriaButton, {
    slots: {
      default: 'Click me',
    },
  })

  expect(wrapper.html()).toContain('Click me')
})

