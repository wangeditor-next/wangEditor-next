/**
 * @description align video menu
 */

import { DomEditor, IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
import { Transforms } from 'slate'

import { getVideoAlign } from '../alignment'
import { VideoAlign, VideoElement } from '../custom-types'

class VideoAlignMenu implements IButtonMenu {
  readonly tag = 'button'

  readonly title: string

  constructor(
    readonly align: VideoAlign,
    titleKey: string,
    readonly iconSvg: string
  ) {
    this.title = t(titleKey)
  }

  private getSelectedVideo(editor: IDomEditor): VideoElement | null {
    return DomEditor.getSelectedNodeByType(editor, 'video') as VideoElement | null
  }

  getValue(editor: IDomEditor): string | boolean {
    const video = this.getSelectedVideo(editor)

    return video ? getVideoAlign(video) : false
  }

  isActive(editor: IDomEditor): boolean {
    return this.getValue(editor) === this.align
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) {
      return true
    }
    return this.getSelectedVideo(editor) == null
  }

  exec(editor: IDomEditor, _value: string | boolean): void {
    if (this.isDisabled(editor)) {
      return
    }

    const props: Partial<VideoElement> = { align: this.align }

    Transforms.setNodes(editor, props, {
      match: node => DomEditor.checkNodeType(node, 'video'),
    })
  }
}

export default VideoAlignMenu
