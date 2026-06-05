import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GlossaryList from '@/components/content/GlossaryList.vue'

describe('GlossaryList', () => {
  it('renders a definition list with glossary class', () => {
    const wrapper = mount(GlossaryList, {
      props: {
        block: {
          type: 'glossary',
          terms: [{ text: 'TDD' }, { text: 'BDD' }],
          definitions: [
            { text: 'Test-Driven Development' },
            { text: 'Behavior-Driven Development' },
          ],
        },
      },
    })
    expect(wrapper.find('dl.glossary').exists()).toBe(true)
    expect(wrapper.findAll('dt')).toHaveLength(2)
    expect(wrapper.findAll('dd')).toHaveLength(2)
    expect(wrapper.find('dt').text()).toBe('TDD')
    expect(wrapper.find('dd').text()).toBe('Test-Driven Development')
  })

  it('handles missing definitions', () => {
    const wrapper = mount(GlossaryList, {
      props: {
        block: {
          type: 'glossary',
          terms: [{ text: 'TDD' }, { text: 'BDD' }],
          definitions: [{ text: 'Test-Driven Development' }],
        },
      },
    })
    expect(wrapper.findAll('dt')).toHaveLength(2)
    expect(wrapper.findAll('dd')).toHaveLength(1)
  })

  it('renders empty list', () => {
    const wrapper = mount(GlossaryList, {
      props: { block: { type: 'glossary', terms: [], definitions: [] } },
    })
    expect(wrapper.find('dl').exists()).toBe(true)
    expect(wrapper.findAll('dt')).toHaveLength(0)
  })
})
