/**
 * @description i18n entry
 * @author wangfupeng
 */

import { i18nAddResources } from '@wangeditor-next/core'

import enResources from './en'
import zhResources from './zh-CN'

i18nAddResources('en', enResources)
i18nAddResources('zh-CN', zhResources)
