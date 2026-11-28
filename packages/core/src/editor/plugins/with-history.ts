/**
 * @description slate 插件 - history
 */

import { Editor } from 'slate'
import { HistoryEditor, withHistory as withSlateHistory } from 'slate-history'

import { IDomEditor } from '../interface'

export const withHistory = <T extends Editor>(editor: T) => {
  const historyEditor = withSlateHistory(editor) as T & IDomEditor & HistoryEditor

  historyEditor.withoutSavingHistory = fn => HistoryEditor.withoutSaving(historyEditor, fn)
  historyEditor.clearHistory = () => {
    historyEditor.history.undos = []
    historyEditor.history.redos = []
  }

  return historyEditor
}
