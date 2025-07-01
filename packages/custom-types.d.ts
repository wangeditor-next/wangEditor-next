/**
 * @description 自定义扩展 slate 接口属性
 * @author wangfupeng
 */
/// <reference types="slate" />
import { BlockQuoteElement } from './basic-modules/src/modules/blockquote/custom-types'
import { CodeElement, PreElement } from './basic-modules/src/modules/code-block/custom-types'
import { ColorText } from './basic-modules/src/modules/color/custom-types'
import { DividerElement } from './basic-modules/src/modules/divider/custom-types'
import { FontSizeAndFamilyText } from './basic-modules/src/modules/font-size-family/custom-types'
import {
  Header1Element,
  Header2Element,
  Header3Element,
  Header4Element,
  Header5Element,
} from './basic-modules/src/modules/header/custom-types'
import { ImageElement } from './basic-modules/src/modules/image/custom-types'
import { IndentElement } from './basic-modules/src/modules/indent/custom-types'
import { JustifyElement } from './basic-modules/src/modules/justify/custom-types'
import { LineHeightElement } from './basic-modules/src/modules/line-height/custom-types'
import { LinkElement } from './basic-modules/src/modules/link/custom-types'
import { ParagraphElement } from './basic-modules/src/modules/paragraph/custom-types'
import { StyledText } from './basic-modules/src/modules/text-style/custom-types'
import { TodoElement } from './basic-modules/src/modules/todo/custom-types'
import { ListItemElement } from './list-module/src/module/custom-types'
import {
  TableCellElement,
  TableElement,
  TableRowElement,
} from './table-module/src/module/custom-types'
import { VideoElement } from './video-module/src/module/custom-types'

type PureText = {
  text: string
}

type CustomText = PureText | StyledText | FontSizeAndFamilyText | ColorText

type BaseElement = {
  type: string
  children: Array<CustomElement | CustomText>
}

type CustomElement =
  | BaseElement
  | LineHeightElement
  | JustifyElement
  | IndentElement
  | ParagraphElement
  | LinkElement
  | BlockQuoteElement
  | Header1Element
  | Header2Element
  | Header3Element
  | Header4Element
  | Header5Element
  | DividerElement
  | ImageElement
  | TodoElement
  | PreElement
  | CodeElement
  | VideoElement
  | TableCellElement
  | TableRowElement
  | TableElement
  | ListItemElement

type ElementType = CustomElement['type'];

declare global {
  interface Window {
    MSStream: boolean
  }

  interface DocumentOrShadowRoot {
    getSelection(): Selection | null
  }

  interface CaretPosition {
    readonly offsetNode: Node
    readonly offset: number
    getClientRect(): DOMRect | null
  }
  interface GetRootNodeOptions {
    composed?: boolean
  }
  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null
  }

  interface Node {
    getRootNode(options?: GetRootNodeOptions): Document | ShadowRoot
  }
}

declare module 'slate' {
  interface CustomTypes {
    // 扩展 Text
    Text: CustomText

    // 扩展 Element
    Element: CustomElement
  }
}

export { BaseElement, CustomElement, ElementType }
