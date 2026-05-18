import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BadgeList from '@/components/content/BadgeList.vue'

describe('BadgeList', () => {
  it('renders badges', () => {
    const wrapper = mount(BadgeList, {
      props: {
        block: {
          type: 'meta',
          badges: [{ text: 'K1' }, { text: 'K2' }, { text: 'K3' }]
        }
      }
    })
    expect(wrapper.find('.meta').exists()).toBe(true)
    const badges = wrapper.findAll('.badge')
    expect(badges).toHaveLength(3)
    expect(badges[0].text()).toBe('K1')
    expect(badges[1].text()).toBe('K2')
    expect(badges[2].text()).toBe('K3')
  })

  it('renders empty when no badges', () => {
    const wrapper = mount(BadgeList, {
      props: { block: { type: 'meta', badges: [] } }
    })
    expect(wrapper.find('.meta').exists()).toBe(true)
    expect(wrapper.findAll('.badge')).toHaveLength(0)
  })
})
