import { CustomTypes, ExtendedType } from 'slate'

type ElementType = ExtendedType<'Element', CustomTypes>['type']

export interface WithTableOptions {
  blocks: {
    td: ElementType
    th: ElementType
    content: ElementType
    tr: ElementType
    table: ElementType
    tbody: ElementType
    tfoot?: ElementType
    thead?: ElementType
  }
}

export const DEFAULT_WITH_TABLE_OPTIONS: WithTableOptions = {
  blocks: {
    td: 'table-cell',
    th: 'table-cell',
    content: 'paragraph',
    tr: 'table-row',
    table: 'table',
    tbody: 'table-body',
    // tfoot: "table-footer",
    // thead: "table-head",
  },
}
