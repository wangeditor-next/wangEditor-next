/**
 * @description register builtin modules
 * @author wangfupeng
 */

import basicModules from '@wangeditor-next/basic-modules'
// code-highlight
import { wangEditorCodeHighlightModule } from '@wangeditor-next/code-highlight'
import wangEditorListModule from '@wangeditor-next/list-module'
// table-module
import wangEditorTableModule from '@wangeditor-next/table-module'
// upload-image-module
import wangEditorUploadImageModule from '@wangeditor-next/upload-image-module'
// video-module
import wangEditorVideoModule from '@wangeditor-next/video-module'

import registerModule from './register'

basicModules.forEach(module => registerModule(module))
registerModule(wangEditorListModule)
registerModule(wangEditorTableModule)
registerModule(wangEditorVideoModule)
registerModule(wangEditorUploadImageModule)
registerModule(wangEditorCodeHighlightModule)
