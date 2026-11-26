import { Editor } from 'slate'
import * as Y from 'yjs'

import createEditor from '../../../tests/utils/create-editor'
import flushPromises from '../../../tests/utils/flush-promises'
import createCoreEditor from '../../core/__tests__/create-core-editor'
import { slateNodesToInsertDelta } from '../src'
import { withYHistory } from '../src/plugins/withYHistory'
import { withYjs, YjsEditor } from '../src/plugins/withYjs'

function createSharedRoot(text = 'hello') {
  const doc = new Y.Doc()
  const sharedRoot = doc.get('content', Y.XmlText)

  sharedRoot.applyDelta(
    slateNodesToInsertDelta([
      {
        type: 'paragraph',
        children: [{ text }],
      },
    ])
  )

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

function createConnectedHistoryEditor(sharedRoot: Y.XmlText) {
  const editor = withYjs(sharedRoot, {
    localOrigin: Symbol('test-local-origin'),
    positionStorageOrigin: Symbol('test-position-origin'),
  })(createCoreEditor())
  const historyEditor = withYHistory()(editor)

  YjsEditor.connect(historyEditor)
  return historyEditor
}

function connectDocuments(first: Y.Doc, second: Y.Doc) {
  const remoteOrigin = Symbol('remote-update')

  first.on('update', (update, origin) => {
    if (origin !== remoteOrigin) {
      Y.applyUpdate(second, update, remoteOrigin)
    }
  })
  second.on('update', (update, origin) => {
    if (origin !== remoteOrigin) {
      Y.applyUpdate(first, update, remoteOrigin)
    }
  })

  return remoteOrigin
}

function selectOffsets(
  editor: ReturnType<typeof createConnectedEditor>,
  start: number,
  end = start
) {
  editor.select({
    anchor: { path: [0, 0], offset: start },
    focus: { path: [0, 0], offset: end },
  })
}

describe('yjs collaboration', () => {
  it('syncs automatic table dimensions without consuming either client’s undo or redo', async () => {
    const callbacks = new WeakMap<Element, ResizeObserverCallback>()

    vi.stubGlobal('ResizeObserver', class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(el: Element) { callbacks.set(el, this.callback) }
      disconnect() {}
    })
    const docs = [new Y.Doc(), new Y.Doc()]
    const editors = docs.map(() => createEditor({ html: '<table><tr><td>A</td></tr></table><p>R</p>' }))

    docs[0].get('content', Y.XmlText).applyDelta(slateNodesToInsertDelta(editors[0].children))
    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]))
    connectDocuments(docs[0], docs[1])
    const [first, second] = editors.map((editor, i) => {
      const result = withYHistory()(withYjs(docs[i].get('content', Y.XmlText))(editor))

      YjsEditor.connect(result)
      return result
    })
    const measure = (height: number) => {
      const table = first.getEditableContainer().querySelector('table')!

      callbacks.get(table)!([{ contentRect: { width: 90, height } } as ResizeObserverEntry], {} as ResizeObserver)
    }

    try {
      const aborted = new Error('measurement failed')

      expect(() => first.withoutSavingHistory!(() => { throw aborted })).toThrow(aborted)
      expect(YjsEditor.origin(first)).toBe(first.localOrigin)
      second.select(second.end([1]))
      second.insertText('emote')
      await flushPromises()
      first.select(first.end([0, 0, 0]))
      first.insertText('B')
      await flushPromises()
      first.undoManager.stopCapturing()
      const sizes = [first, second].map(e => e.undoManager.undoStack.length)

      measure(85)
      await flushPromises()
      expect(second.children[0]).toMatchObject({ height: 85 })
      expect([first, second].map(e => e.undoManager.undoStack.length)).toEqual(sizes)
      first.undo()
      await flushPromises()
      expect(first.getText()).toBe('A\nRemote')
      expect(second.getText()).toBe(first.getText())
      measure(61)
      await flushPromises()
      expect(first.undoManager.redoStack).toHaveLength(1)
      expect(second.children[0]).toMatchObject({ height: 61 })
      first.redo()
      await flushPromises()
      expect(first.getText()).toBe('AB\nRemote')
      expect(second.children).toEqual(first.children)
    } finally {
      YjsEditor.disconnect(first)
      YjsEditor.disconnect(second)
      docs.forEach(doc => doc.destroy())
      vi.unstubAllGlobals()
    }
  })

  it('preserves text order when moving a node forward in the same parent', async () => {
    const firstDoc = new Y.Doc()
    const secondDoc = new Y.Doc()
    const firstRoot = firstDoc.get('content', Y.XmlText)

    firstRoot.applyDelta(
      slateNodesToInsertDelta([
        {
          type: 'paragraph',
          children: [
            { text: 'REMOTEKEEP' },
            { text: 'native-one-two' },
            { text: 'LOCALUNDO', bold: true },
          ],
        },
      ])
    )
    Y.applyUpdate(secondDoc, Y.encodeStateAsUpdate(firstDoc))
    connectDocuments(firstDoc, secondDoc)

    const first = createConnectedEditor(firstRoot)
    const second = createConnectedEditor(secondDoc.get('content', Y.XmlText))

    first.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'REMOTEKEEP' },
          { text: 'native-one-two' },
          { text: 'LOCALUNDO', bold: true },
        ],
      },
    ]
    first.apply({
      type: 'move_node',
      path: [0, 0],
      newPath: [0, 1],
    })
    await flushPromises()

    expect(first.getText()).toBe('native-one-twoREMOTEKEEPLOCALUNDO')
    expect(second.getText()).toBe('native-one-twoREMOTEKEEPLOCALUNDO')
  })

  it('converges after undoing a marked insertion next to a remote edit', async () => {
    const firstDoc = new Y.Doc()
    const secondDoc = new Y.Doc()
    const firstRoot = firstDoc.get('content', Y.XmlText)

    firstRoot.applyDelta(
      slateNodesToInsertDelta([
        {
          type: 'paragraph',
          children: [{ text: 'native-one-two' }],
        },
      ])
    )
    Y.applyUpdate(secondDoc, Y.encodeStateAsUpdate(firstDoc))
    connectDocuments(firstDoc, secondDoc)

    const first = createConnectedHistoryEditor(firstRoot)
    const second = createConnectedHistoryEditor(secondDoc.get('content', Y.XmlText))

    selectOffsets(first, first.getText().length)
    first.undoManager.stopCapturing()
    first.addMark('bold', true)
    first.insertText('LOCALUNDO')
    first.removeMark('bold')
    first.undoManager.stopCapturing()
    await flushPromises()

    const secondParagraph = second.children[0] as { children: Array<{ text: string }> }
    const textIndex = secondParagraph.children.length - 1
    const offset = secondParagraph.children[textIndex].text.length

    second.select({
      anchor: { path: [0, textIndex], offset },
      focus: { path: [0, textIndex], offset },
    })
    second.removeMark('bold')
    second.insertText('REMOTEKEEP')
    await flushPromises()

    first.undo()
    await flushPromises()

    expect(first.children).toEqual(second.children)
    expect(first.getText()).toBe('native-one-twoREMOTEKEEP')
  })

  it('syncs edits between editors backed by separate documents', async () => {
    const firstDoc = new Y.Doc()
    const secondDoc = new Y.Doc()
    const firstRoot = firstDoc.get('content', Y.XmlText)

    firstRoot.applyDelta(
      slateNodesToInsertDelta([
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ])
    )
    Y.applyUpdate(secondDoc, Y.encodeStateAsUpdate(firstDoc))
    const remoteOrigin = connectDocuments(firstDoc, secondDoc)
    let echoedUpdateCount = 0

    secondDoc.on('update', (_update, origin) => {
      if (origin !== remoteOrigin) {
        echoedUpdateCount += 1
      }
    })

    const first = createConnectedEditor(firstRoot)
    const second = createConnectedEditor(secondDoc.get('content', Y.XmlText))

    first.select(Editor.end(first, []))
    for (const character of 'network') {
      first.insertText(character)
      await flushPromises()
    }

    expect(first.getText()).toBe('network')
    expect(second.getText()).toBe('network')
    expect(echoedUpdateCount).toBe(0)
  })

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
