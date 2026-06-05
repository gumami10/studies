import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BadgeList from '@/components/content/BadgeList.vue'

describe('BadgeList', () => {
  it('renders badges', () => {
    const wrapper = mount(BadgeList, {
      props: {
        block: {
          type: 'meta',
          badges: [{ text: 'K1' }, { text: 'K2' }, { text: 'K3' }],
        },
      },
    })
    expect(wrapper.find('.badge-list').exists()).toBe(true)
    const tags = wrapper.findAll('.p-tag')
    expect(tags).toHaveLength(3)
    expect(tags[0].text()).toBe('K1')
    expect(tags[1].text()).toBe('K2')
    expect(tags[2].text()).toBe('K3')
  })

  it('renders empty when no badges', () => {
    const wrapper = mount(BadgeList, {
      props: { block: { type: 'meta', badges: [] } },
    })
    expect(wrapper.find('.badge-list').exists()).toBe(true)
    expect(wrapper.findAll('.p-tag')).toHaveLength(0)
  })
})
