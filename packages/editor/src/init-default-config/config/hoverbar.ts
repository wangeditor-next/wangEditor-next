/**
 * @description hoverbar 配置
 * @author wangfupeng
 */

const COMMON_HOVERBAR_KEYS = {
  // key 即 element type
  link: {
    menuKeys: ['editLink', 'unLink', 'viewLink'],
  },
  image: {
    menuKeys: [
      'imageWidth30',
      'imageWidth50',
      'imageWidth100',
      'editorImageSizeMenu',
      'editImage',
      'previewImage',
      'viewImageLink',
      'deleteImage',
    ],
  },
  pre: {
    menuKeys: ['enter', 'codeBlock', 'codeSelectLang'],
  },
  table: {
    menuKeys: [
      'enter',
      'tableHeader',
      'tableFullWidth',
      'insertTableRow',
      'deleteTableRow',
      'insertTableCol',
      'deleteTableCol',
      'deleteTable',
      /** 注册单元格合并 拆分 */
      'mergeTableCell',
      'splitTableCell',
      /** 注册表格/单元格属性设置 */
      'setTableProperty',
      'setTableCellProperty',
    ],
  },
  divider: {
    menuKeys: ['enter'],
  },
  video: {
    menuKeys: [
      'enter',
      'videoAlignLeft',
      'videoAlignCenter',
      'videoAlignRight',
      'editVideoSize',
      'editVideoSrc',
    ],
  },
}

export function genDefaultHoverbarKeys() {
  return {
    ...COMMON_HOVERBAR_KEYS,

    // 也可以自定义 match 来匹配元素，此时 key 就随意了
    text: {
      menuKeys: [
        'formatPainter',
        'headerSelect',
        'insertLink',
        'bulletedList',
        '|',
        'bold',
        'through',
        'color',
        'bgColor',
        'clearStyle',
      ],
    },
    // other hover bar ...
  }
}

export function genSimpleHoverbarKeys() {
  return COMMON_HOVERBAR_KEYS
}
