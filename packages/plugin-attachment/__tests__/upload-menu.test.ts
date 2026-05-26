import createEditor from '../../../tests/utils/create-editor'
import { uploadAttachments } from '../src/module/menu/helper'
import UploadAttachmentMenu from '../src/module/menu/UploadAttachment'

vi.mock('../src/module/menu/helper', () => ({
  insertAttachment: vi.fn(),
  uploadAttachments: vi.fn(),
}))

describe('upload attachment menu', () => {
  let menu: UploadAttachmentMenu

  beforeEach(() => {
    menu = new UploadAttachmentMenu()
  })

  it('basic fields', () => {
    const editor = createEditor()

    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBe(false)
  })

  it('exec should call customBrowseAndUpload first', () => {
    const customBrowseAndUpload = vi.fn()
    const editor = createEditor()

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      customBrowseAndUpload,
    } as any)

    menu.exec(editor, '')
    expect(customBrowseAndUpload).toHaveBeenCalledTimes(1)
  })

  it('exec should create input and trigger upload', () => {
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadAttachment: {
            allowedFileTypes: ['.zip'],
          },
        },
      },
    })

    expect(document.querySelector('input[type="file"]')).toBeNull()

    menu.exec(editor, '')

    const inputFile = document.querySelector('input[type="file"]') as HTMLInputElement

    expect(inputFile).toBeTruthy()

    const files = [new File(['dummy'], 'demo.zip', { type: 'application/zip' })]

    Object.defineProperty(inputFile, 'files', { value: files })
    inputFile.dispatchEvent(new Event('change', { bubbles: true }))

    expect(uploadAttachments).toHaveBeenCalled()
  })
})
