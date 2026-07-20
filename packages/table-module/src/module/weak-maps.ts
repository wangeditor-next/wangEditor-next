import { BaseEditor, BaseElement } from 'slate'

import { Edge, NodeEntryWithContext } from '../utils'

/** Weak reference between the `Editor` and the selected elements */
export const EDITOR_TO_SELECTION = new WeakMap<BaseEditor, NodeEntryWithContext[][]>()

/** Weak reference between the `Editor` and a set of the selected elements */
export const EDITOR_TO_SELECTION_SET = new WeakMap<BaseEditor, WeakSet<BaseElement>>()

/**
 * Stores the outer edges owned by each selected cell. Keeping this state separate from the
 * selection matrix lets the renderer draw one perimeter without covering authored backgrounds.
 */
export const EDITOR_TO_SELECTION_EDGES = new WeakMap<
  BaseEditor,
  WeakMap<BaseElement, ReadonlySet<Edge>>
>()
