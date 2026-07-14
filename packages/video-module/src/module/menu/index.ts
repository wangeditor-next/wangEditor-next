/**
 * @description video menu
 * @author wangfupeng
 */

import {
  VIDEO_ALIGN_CENTER_SVG,
  VIDEO_ALIGN_LEFT_SVG,
  VIDEO_ALIGN_RIGHT_SVG,
} from '../../constants/svg'
import { genInsertVideoMenuConfig, genUploadVideoMenuConfig } from './config'
import EditorVideoSizeMenu from './EditVideoSizeMenu'
import EditorVideoSrcMenu from './EditVideoSrcMenu'
import InsertVideoMenu from './InsertVideoMenu'
// import DeleteVideoMenu from './DeleteVideoMenu'
import UploadVideoMenu from './UploadVideoMenu'
import VideoAlignMenu from './VideoAlignMenu'

export const insertVideoMenuConf = {
  key: 'insertVideo',
  factory() {
    return new InsertVideoMenu()
  },

  // 默认的菜单菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
  // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
  config: genInsertVideoMenuConfig(),
}

export const uploadVideoMenuConf = {
  key: 'uploadVideo',
  factory() {
    return new UploadVideoMenu()
  },

  // 默认的菜单菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
  // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
  config: genUploadVideoMenuConfig(),
}

export const editorVideoSizeMenuConf = {
  key: 'editVideoSize',
  factory() {
    return new EditorVideoSizeMenu()
  },
}

export const editorVideoSrcMenuConf = {
  key: 'editVideoSrc',
  factory() {
    return new EditorVideoSrcMenu()
  },
}

export const videoAlignLeftMenuConf = {
  key: 'videoAlignLeft',
  factory() {
    return new VideoAlignMenu('left', 'videoModule.alignLeft', VIDEO_ALIGN_LEFT_SVG)
  },
}

export const videoAlignCenterMenuConf = {
  key: 'videoAlignCenter',
  factory() {
    return new VideoAlignMenu('center', 'videoModule.alignCenter', VIDEO_ALIGN_CENTER_SVG)
  },
}

export const videoAlignRightMenuConf = {
  key: 'videoAlignRight',
  factory() {
    return new VideoAlignMenu('right', 'videoModule.alignRight', VIDEO_ALIGN_RIGHT_SVG)
  },
}

// export const deleteVideoMenuConf = {
//   key: 'deleteVideo',
//   factory() {
//     return new DeleteVideoMenu()
//   },
// }
// 键盘能删除 video 了，注释掉这个菜单 wangfupeng 22.02.23
