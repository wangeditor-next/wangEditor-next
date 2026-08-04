/**
 * @description DOM 操作
 * @author wangfupeng
 */

import $, {
  append, click, hide, on, remove, val,
} from 'dom7'

export type { Dom7Array } from 'dom7'

if (append) { $.fn.append = append }
if (on) { $.fn.on = on }
if (remove) { $.fn.remove = remove }
if (val) { $.fn.val = val }
if (click) { $.fn.click = click }
if (hide) { $.fn.hide = hide }

export default $
