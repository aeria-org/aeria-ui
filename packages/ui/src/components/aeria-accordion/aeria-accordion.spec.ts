import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import AeriaAccordion from './aeria-accordion.vue'

test('renders aeria-accordion correctly', () => {
  const wrapper = mount(AeriaAccordion, {
    props: {
      headers: {
        slotA: 'slot A header',
        slotB: {
          title: 'slot B header',
          icon: 'x',
        },
      },
    },
    slots: {
      slotA: 'slot A text',
      slotB: 'slot B text',
    },
  })

  expect(wrapper.html()).toContain('slot A header')
  expect(wrapper.html()).toContain('slot B header')
})

