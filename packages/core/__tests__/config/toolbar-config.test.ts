/**
 * @description toolbar config test
 * @author wangfupeng
 */

// 注册几个菜单，测试用
import '../menus/register-menus/index'

import createToolbarForSrc from '../../src/create/create-toolbar'
import { IDomEditor } from '../../src/editor/interface'
import createCoreEditor from '../create-core-editor'

// 创建 toolbar
function createToolbar(editor: IDomEditor, customConfig = {}) {
  const container = document.createElement('div')

  document.body.appendChild(container)
  return createToolbarForSrc(editor, {
    selector: container,
    config: {
      toolbarKeys: ['myButtonMenu', 'mySelectMenu', 'myModalMenu'], // 已注册的菜单 key
      ...customConfig,
    },
  })
}

describe('toolbar config', () => {
  const editor = createCoreEditor()

  it('default config', () => {
    const toolbar = createToolbar(editor)
    const defaultConfig = toolbar.getConfig()
    const { excludeKeys = [], toolbarKeys = [] } = defaultConfig

    expect(excludeKeys.length).toBe(0)
    expect(toolbarKeys.length).toBeGreaterThan(0)
  })

  it('create editor is null', () => {
    const container = document.createElement('div')

    expect(() => {
      createToolbarForSrc(null as unknown as IDomEditor, {
        selector: container,
      })
    }).toThrow('Cannot create toolbar, because editor is null')
  })

  it('repeat create tool bar', () => {
    const container = document.createElement('div')

    createToolbarForSrc(editor, {
      selector: container,
    })
    expect(() => {
      createToolbarForSrc(editor, {
        selector: container,
      })
    }).toThrow(`Repeated create toolbar by selector '${container}'`)
  })

  it('toolbarKeys', () => {
    const keys = ['mySelectMenu', 'myModalMenu']

    const toolbar = createToolbar(editor, {
      toolbarKeys: keys,
    })

    const { toolbarKeys = [] } = toolbar.getConfig()

    expect(toolbarKeys).toEqual(keys)
  })

  it('excludeKeys', () => {
    const keys = ['myButtonMenu', 'mySelectMenu']
    const toolbar = createToolbar(editor, {
      excludeKeys: keys,
    })
    const { excludeKeys = [] } = toolbar.getConfig()

    expect(excludeKeys).toEqual(keys)
  })

  it('insertKeys', () => {
    const toolbarKeys = ['mySelectMenu', 'myModalMenu']
    const insertKeysInfo = {
      index: 0,
      keys: ['myButtonMenu'],
    }
    const toolbar = createToolbar(editor, {
      toolbarKeys,
      insertKeys: insertKeysInfo,
    })
    const { insertKeys = {} } = toolbar.getConfig()

    expect(insertKeys).toEqual(insertKeysInfo)
  })

  it('insertKeys array', () => {
    const toolbarKeys = ['mySelectMenu', 'myModalMenu']
    const insertKeysInfo = [
      {
        index: 0,
        keys: ['myButtonMenu'],
      },
      {
        index: 1,
        keys: ['mySelectMenu'],
      },
    ]
    const toolbar = createToolbar(editor, {
      toolbarKeys,
      insertKeys: insertKeysInfo,
    })
    const { insertKeys = {} } = toolbar.getConfig()

    expect(insertKeys).toEqual(insertKeysInfo)
  })
})
