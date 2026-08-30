/**
 * @description 多语言
 * @author wangfupeng
 */

import { i18nAddResources } from '@wangeditor-next/editor'

i18nAddResources('en', {
  linkCard: {
    toCard: 'To Card',
    toLink: 'To Link',
    // delete: 'Delete',
  },
})

i18nAddResources('zh-CN', {
  linkCard: {
    toCard: '转为卡片',
    toLink: '转为链接',
    // delete: '删除',
  },
})
