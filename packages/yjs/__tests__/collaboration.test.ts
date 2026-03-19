import { Editor } from 'slate'
import * as Y from 'yjs'

import flushPromises from '../../../tests/utils/flush-promises'
import createCoreEditor from '../../core/__tests__/create-core-editor'
import { slateNodesToInsertDelta } from '../src'
import { withYjs, YjsEditor } from '../src/plugins/withYjs'

function createSharedRoot(text = 'hello') {
  const doc = new Y.Doc()
  const sharedRoot = doc.get('content', Y.XmlText)

  sharedRoot.applyDelta(slateNodesToInsertDelta([
    {
      type: 'paragraph',
      children: [{ text }],
    },
  ]))

  return sharedRoot
}

function createConnectedEditor(sharedRoot: Y.XmlText) {
  const editor = withYjs(sharedRoot, {
    localOrigin: Symbol('test-local-origin'),
    positionStorageOrigin: Symbol('test-position-origin'),
  })(createCoreEditor())

  YjsEditor.connect(editor)
  return editor
}

function selectOffsets(editor: ReturnType<typeof createConnectedEditor>, start: number, end = start) {
  editor.select({
    anchor: { path: [0, 0], offset: start },
    focus: { path: [0, 0], offset: end },
  })
}

describe('yjs collaboration', () => {
  it('syncs basic text edits between collaborators', async () => {
    const sharedRoot = createSharedRoot()
    const first = createConnectedEditor(sharedRoot)
    const second = createConnectedEditor(sharedRoot)

    first.select(Editor.end(first, []))
    first.insertText('!')

    await flushPromises()

    expect(first.getText()).toBe('hello!')
    expect(second.getText()).toBe('hello!')
  })

  it('keeps insert positions in sync across collaborators', async () => {
    const sharedRoot = createSharedRoot()
    const first = createConnectedEditor(sharedRoot)
    const second = createConnectedEditor(sharedRoot)

    selectOffsets(first, 2)
    selectOffsets(second, 2)
    first.insertText('2')

    await flushPromises()

    expect(first.getText()).toBe('he2llo')
    expect(second.getText()).toBe('he2llo')
  })

  it('syncs selection replace operations between collaborators', async () => {
    const sharedRoot = createSharedRoot()
    const first = createConnectedEditor(sharedRoot)
    const second = createConnectedEditor(sharedRoot)

    selectOffsets(first, 1, 4)
    first.insertText('i')

    await flushPromises()

    expect(first.getText()).toBe('hio')
    expect(second.getText()).toBe('hio')
  })

  it('hydrates late joiners with the latest shared content', async () => {
    const sharedRoot = createSharedRoot()
    const first = createConnectedEditor(sharedRoot)

    first.select(Editor.end(first, []))
    first.insertText('!')

    await flushPromises()

    const second = createConnectedEditor(sharedRoot)

    expect(first.getText()).toBe('hello!')
    expect(second.getText()).toBe('hello!')
  })
})
