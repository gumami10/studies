import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompareCards from '@/components/content/CompareCards.vue'

describe('CompareCards', () => {
  it('renders compare container', () => {
    const wrapper = mount(CompareCards, {
      props: { block: { type: 'compare', cards: [] } },
    })
    expect(wrapper.find('.compare').exists()).toBe(true)
  })

  it('renders cards with pos/neg classes', () => {
    const wrapper = mount(CompareCards, {
      props: {
        block: {
          type: 'compare',
          cards: [
            {
              cardType: 'pos',
              content: [{ type: 'paragraph', html: 'Good thing' }],
            },
            {
              cardType: 'neg',
              content: [{ type: 'paragraph', html: 'Bad thing' }],
            },
          ],
        },
      },
    })
    const cards = wrapper.findAll('.compare-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].classes()).toContain('pos')
    expect(cards[1].classes()).toContain('neg')
  })

  it('renders card content', () => {
    const wrapper = mount(CompareCards, {
      props: {
        block: {
          type: 'compare',
          cards: [
            {
              cardType: 'pos',
              content: [
                { type: 'heading', text: 'Pros' },
                { type: 'list', listType: 'ul', items: [{ html: 'Efficient' }] },
              ],
            },
          ],
        },
      },
    })
    expect(wrapper.find('h4').text()).toBe('Pros')
    expect(wrapper.find('li').text()).toBe('Efficient')
  })

  it('renders empty when no cards', () => {
    const wrapper = mount(CompareCards, {
      props: { block: { type: 'compare', cards: [] } },
    })
    expect(wrapper.findAll('.compare-card')).toHaveLength(0)
  })
})
