import {
  CursorEditor,
  withCursors,
  withYHistory,
  withYjs,
  YHistoryEditor,
  YjsEditor,
} from './plugins'
import { slateNodesToInsertDelta, yTextToSlateElement } from './utils/convert'
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from './utils/position'

export {
  // Base cursor plugin
  CursorEditor,
  relativePositionToSlatePoint,
  // Utils
  relativeRangeToSlateRange,
  slateNodesToInsertDelta,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
  withCursors,
  // History plugin
  withYHistory,
  withYjs,
  YHistoryEditor,
  YjsEditor,
  yTextToSlateElement,
}

export type { RelativeRange } from './module/custom-types'
export type {
  CursorState,
  CursorStateChangeEvent,
  RemoteCursorChangeEventListener,
  WithCursorsOptions,
  WithYHistoryOptions,
  WithYjsOptions,
} from './plugins'
