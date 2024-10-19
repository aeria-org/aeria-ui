import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import AeriaBareButton from './aeria-bare-button.vue'

test('renders aeria-bare-button correctly', () => {
  const wrapper = mount(AeriaBareButton, { slots: { default: 'Click me' } })

  expect(wrapper.html()).toContain('Click me')
})

