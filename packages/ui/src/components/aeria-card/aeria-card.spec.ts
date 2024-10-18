import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import AeriaCard from './aeria-card.vue'

test('renders aeria-card correctly', () => {
  const wrapper = mount(AeriaCard, {
    slots: {
      default: 'Picture',
      actions: 'Actions',
      badge: 'Badge',
      footer: 'Footer',
    },
  })

  expect(wrapper.html()).toContain('Picture')
  expect(wrapper.html()).toContain('Actions')
  expect(wrapper.html()).toContain('Badge')
  expect(wrapper.html()).toContain('Footer')
})

