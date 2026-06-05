import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from '@/components/content/DataTable.vue'

describe('DataTable', () => {
  it('renders a table', () => {
    const wrapper = mount(DataTable, {
      props: {
        block: {
          type: 'table',
          rows: [
            { cells: [{ html: 'Col 1' }, { html: 'Col 2' }] },
            { cells: [{ html: 'A' }, { html: 'B' }] },
          ],
        },
      },
    })
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('first row uses th elements', () => {
    const wrapper = mount(DataTable, {
      props: {
        block: {
          type: 'table',
          rows: [
            { cells: [{ html: 'Header 1' }, { html: 'Header 2' }] },
            { cells: [{ html: 'Data 1' }, { html: 'Data 2' }] },
          ],
        },
      },
    })
    const rows = wrapper.findAll('tr')
    expect(rows[0].findAll('th')).toHaveLength(2)
    expect(rows[1].findAll('td')).toHaveLength(2)
  })

  it('renders colspan on cells', () => {
    const wrapper = mount(DataTable, {
      props: {
        block: {
          type: 'table',
          rows: [{ cells: [{ html: 'Wide', span: '2' }] }],
        },
      },
    })
    expect(wrapper.find('th').attributes('colspan')).toBe('2')
  })

  it('renders inline HTML in cells', () => {
    const wrapper = mount(DataTable, {
      props: {
        block: {
          type: 'table',
          rows: [{ cells: [{ html: '<strong>Bold</strong>' }] }],
        },
      },
    })
    expect(wrapper.find('th').html()).toContain('<strong>Bold</strong>')
  })

  it('renders empty table with no rows', () => {
    const wrapper = mount(DataTable, {
      props: { block: { type: 'table', rows: [] } },
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tr')).toHaveLength(0)
  })
})
