import { CursorEditor, YHistoryEditor, YjsEditor } from '@wangeditor-next/yjs'
import type { Descendant } from 'slate'

export type CursorData = {
  name: string
  color: string
}

export type CustomText = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  text: string
}

export type Paragraph = {
  type: 'paragraph'
  children: Descendant[]
}

export type InlineCode = {
  type: 'inline-code'
  children: Descendant[]
}

export type HeadingOne = {
  type: 'heading-one'
  children: Descendant[]
}

export type HeadingTwo = {
  type: 'heading-two'
  children: Descendant[]
}

export type BlockQuote = {
  type: 'block-quote'
  children: Descendant[]
}

export type CustomElement = Paragraph | InlineCode | HeadingOne | HeadingTwo | BlockQuote

export type CustomEditor = YjsEditor & YHistoryEditor & CursorEditor<CursorData>

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}
