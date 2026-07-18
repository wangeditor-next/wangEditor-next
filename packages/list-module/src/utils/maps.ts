/**
 * @description maps
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { BaseElement } from 'slate'

export const ELEM_TO_EDITOR = new WeakMap<BaseElement, IDomEditor>()
