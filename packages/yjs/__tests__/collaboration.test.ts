import { Editor } from 'slate'
import * as Y from 'yjs'

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
