/**
 * @description Internal synchronous Copy/Cut integration.
 *
 * The public `setFragmentData` API stays `void`. A writer that wants to report
 * a failure registers for these internal events and records the result on the
 * shared context. That keeps the result observable even when an outer writer
 * delegates to an inner writer and discards its return value.
 *
 * A participant that takes ownership may also register one completion callback.
 * Core invokes it itself after the outer writer settles, inside `finally`, so it
 * still runs when the writer or a later listener throws, and it runs directly
 * before the caller consumes the result or deletes a Cut source. No listener is
 * emitted after it, which keeps completion outside the public ordering surface.
 *
 * @internal
 */

import type { IDomEditor } from './interface'

export type ClipboardFragmentAction = 'copy' | 'cut'

export type ClipboardFragmentData = Pick<DataTransfer, 'getData' | 'setData'>
  & Partial<Pick<DataTransfer, 'types' | 'clearData'>>

export interface IClipboardFragmentContext {
  action: ClipboardFragmentAction
  data: ClipboardFragmentData
  /** A participant has taken ownership of this native transfer. */
  handled: boolean
  /** Do not run the writer chain; the participant could not build a payload. */
  skipWrite: boolean
  /** Cancel the Copy/Cut side effect (Cut deletion or `customCopy`). */
  cancel: boolean
  error?: unknown
  /**
   * Register the single internal completion callback. Only the first
   * registration is kept, and it runs after the outer writer, in `finally`.
   * Returns `false` when a completion is already registered, so a later
   * participant never assumes it owns verification and cleanup.
   */
  setCompletion: (callback: () => void) => boolean
}

export const ClipboardFragmentEvents = {
  BEFORE_WRITE: 'wangeditor-next:clipboard-fragment:before-write',
} as const

type FragmentWriter = (data: ClipboardFragmentData) => unknown

/**
 * Run the complete `setFragmentData` writer chain for one native transfer.
 *
 * A strict `false` from the outermost writer only cancels a Cut, or a transfer
 * an internal participant has explicitly taken ownership of. Older writers
 * that return `undefined` (or anything else) keep their historical behaviour,
 * and an ordinary Copy still reaches `customCopy`.
 */
export function writeClipboardFragment(
  editor: IDomEditor,
  data: ClipboardFragmentData,
  action: ClipboardFragmentAction,
): IClipboardFragmentContext {
  let completion: (() => void) | undefined
  const context: IClipboardFragmentContext = {
    action,
    data,
    handled: false,
    skipWrite: false,
    cancel: false,
    setCompletion: callback => {
      if (completion !== undefined) { return false }
      completion = callback
      return true
    },
  }

  const emit = (type: string) => {
    if (typeof editor.emit === 'function') { editor.emit(type, context) }
  }

  try {
    try {
      emit(ClipboardFragmentEvents.BEFORE_WRITE)
    } catch (error) {
      // A later listener failed after a participant took ownership: cancel and
      // skip the writer, but still let the participant's completion callback
      // clean up and report inside `finally`.
      if (!context.handled) { throw error }
      context.error = error
      context.cancel = true
      context.skipWrite = true
    }

    if (!context.skipWrite) {
      try {
        const writer = editor.setFragmentData as FragmentWriter
        const result = writer.call(editor, data)

        if (result === false && (action === 'cut' || context.handled)) { context.cancel = true }
      } catch (error) {
        // A participant that opted into the integration gets its result verified
        // after the chain; do not surface a page error and delete the source.
        if (!context.handled) { throw error }
        context.error = error
        context.cancel = true
      }
    }
  } finally {
    // Runs once, after the outer writer and before the caller acts on the
    // result. No event is emitted after this point.
    if (completion) {
      try {
        completion()
      } catch (error) {
        if (!context.handled) { throw error }
        context.error = error
        context.cancel = true
      }
    }
  }

  return context
}
