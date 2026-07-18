import { MoveNodeOperation, Node, Path, Text } from 'slate'
import * as Y from 'yjs'

import { Delta } from '../../module/custom-types'
import { cloneInsertDeltaDeep } from '../../utils/clone'
import { getInsertDeltaLength, yTextToInsertDelta } from '../../utils/delta'
import { getYTarget } from '../../utils/location'
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '../../utils/position'

export function moveNode(sharedRoot: Y.XmlText, slateRoot: Node, op: MoveNodeOperation): void {
  const newParentPath = Path.parent(op.newPath)
  const newPathOffset = op.newPath[op.newPath.length - 1]
  const parent = Node.get(slateRoot, newParentPath)

  if (Text.isText(parent)) {
    throw new Error('Cannot move slate node into text element')
  }
  const normalizedNewPath = [...newParentPath, Math.min(newPathOffset, parent.children.length)]

  const origin = getYTarget(sharedRoot, slateRoot, op.path)
  const target = getYTarget(sharedRoot, slateRoot, normalizedNewPath)
  const insertDelta = cloneInsertDeltaDeep(origin.targetDelta)

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    origin.yParent,
    origin.targetDelta
  )

  const originLength = origin.textRange.end - origin.textRange.start
  const originPathOffset = op.path[op.path.length - 1]
  const movesForwardInSameParent =
    Path.equals(Path.parent(op.path), newParentPath) && originPathOffset < newPathOffset
  let targetOffset = movesForwardInSameParent ? target.textRange.end : target.textRange.start

  origin.yParent.delete(origin.textRange.start, originLength)

  if (origin.yParent === target.yParent && origin.textRange.start < targetOffset) {
    targetOffset -= originLength
  }

  const targetLength = getInsertDeltaLength(yTextToInsertDelta(target.yParent))
  const deltaApplyYOffset = Math.min(targetOffset, targetLength)
  const applyDelta: Delta = [{ retain: deltaApplyYOffset }, ...insertDelta]

  target.yParent.applyDelta(applyDelta, { sanitize: false })

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    target.yParent,
    storedPositions,
    insertDelta,
    deltaApplyYOffset,
    origin.textRange.start
  )
}
