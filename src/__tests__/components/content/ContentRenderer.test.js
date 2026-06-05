import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentRenderer from '@/components/content/ContentRenderer.vue'

describe('ContentRenderer', () => {
  it('renders known block types', () => {
    const wrapper = mount(ContentRenderer, {
      props: {
        blocks: [
          { type: 'h2', text: 'Title' },
          { type: 'paragraph', html: 'Para' },
        ],
      },
      global: {
        stubs: {
          ContentHeading: { template: '<h2 v-html="block.text" />', props: ['block'] },
          ContentParagraph: { template: '<p v-html="block.html" />', props: ['block'] },
        },
      },
    })
    expect(wrapper.find('h2').text()).toBe('Title')
    expect(wrapper.find('p').text()).toBe('Para')
  })

  it('falls back to div for unknown block types', () => {
    const wrapper = mount(ContentRenderer, {
      props: { blocks: [{ type: 'custom-thing', text: 'test' }] },
    })
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('renders empty when no blocks', () => {
    const wrapper = mount(ContentRenderer, {
      props: { blocks: [] },
    })
    expect(wrapper.findAll('*')).toHaveLength(0)
  })

  it('renders section blocks', () => {
    const wrapper = mount(ContentRenderer, {
      props: {
        blocks: [
          {
            type: 'section',
            id: 'sec-1',
            content: [{ type: 'h3', text: 'Inside Section' }],
          },
        ],
      },
      global: {
        stubs: {
          ContentSection: {
            template:
              '<section :id="block.id"><h3 v-for="b in block.content" v-html="b.text" /></section>',
            props: ['block'],
          },
        },
      },
    })
    expect(wrapper.find('section#sec-1').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toBe('Inside Section')
  })
})
