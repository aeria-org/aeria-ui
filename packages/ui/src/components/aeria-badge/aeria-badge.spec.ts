import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import AeriaBadge from './aeria-badge.vue'

test('renders aeria-badge correctly', () => {
  const wrapper = mount(AeriaBadge, { slots: { default: 'Badge text' } })

  expect(wrapper.html()).toContain('Badge text')
})

