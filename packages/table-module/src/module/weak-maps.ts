import { BaseEditor, BaseElement } from 'slate'

import { NodeEntryWithContext } from '../utils'

/** Weak reference between the `Editor` and the selected elements */
export const EDITOR_TO_SELECTION = new WeakMap<BaseEditor, NodeEntryWithContext[][]>()

/** Weak reference between the `Editor` and a set of the selected elements */
export const EDITOR_TO_SELECTION_SET = new WeakMap<BaseEditor, WeakSet<BaseElement>>()
