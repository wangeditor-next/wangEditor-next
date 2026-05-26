import '../src/module/local'

import { i18nChangeLanguage, t } from '@wangeditor-next/editor'

describe('plugin-attachment i18n', () => {
  it('zh-CN text', () => {
    i18nChangeLanguage('zh-CN')
    expect(t('attachment.upload')).toBe('上传附件')
  })

  it('en text', () => {
    i18nChangeLanguage('en')
    expect(t('attachment.upload')).toBe('Upload Attachment')
  })
})
