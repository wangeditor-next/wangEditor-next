/**
 * @description textarea event handlers entry
 * @author wangfupeng
 */

import handleBeforeInput from './beforeInput'
import handleOnBlur from './blur'
import handleOnClick from './click'
import {
  handleCompositionEnd,
  handleCompositionStart,
  handleCompositionUpdate,
} from './composition'
import handleOnCopy from './copy'
import handleOnCut from './cut'
import { handleOnDragend, handleOnDragover, handleOnDragstart } from './drag'
import handleOnDrop from './drop'
import handleOnFocus from './focus'
import handleOnKeydown from './keydown'
import handleKeypress from './keypress'
import handleOnPaste from './paste'

const eventConf = {
  beforeinput: handleBeforeInput,
  blur: handleOnBlur,
  focus: handleOnFocus,
  click: handleOnClick,
  compositionstart: handleCompositionStart,
  compositionend: handleCompositionEnd,
  compositionupdate: handleCompositionUpdate,
  keydown: handleOnKeydown,
  keypress: handleKeypress,
  copy: handleOnCopy,
  cut: handleOnCut,
  paste: handleOnPaste,
  dragover: handleOnDragover,
  dragstart: handleOnDragstart,
  dragend: handleOnDragend,
  drop: handleOnDrop,
}

export default eventConf
