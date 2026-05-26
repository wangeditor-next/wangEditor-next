/**
 * @description table menu
 * @author wangfupeng
 */

import CellProperty from './CellProperty'
import DeleteCol from './DeleteCol'
import DeleteRow from './DeleteRow'
import DeleteTable from './DeleteTable'
import FullWidth from './FullWidth'
import InsertCol from './InsertCol'
import InsertRow from './InsertRow'
import InsertTable from './InsertTable'
import MergeCell from './MergeCell'
import SplitCell from './SplitCell'
import TableHander from './TableHeader'
import TableProperty from './TableProperty'

export const insertTableMenuConf = {
  key: 'insertTable',
  config: {
    minWidth: 60,
    minRowHeight: 30,
    tableHeader: {
      selected: true,
    },
    tableFullWidth: {
      selected: false,
    },
    widthExportMode: 'explicit',
  },
  factory() {
    return new InsertTable()
  },
}

export const deleteTableMenuConf = {
  key: 'deleteTable',
  factory() {
    return new DeleteTable()
  },
}

export const insertTableRowConf = {
  key: 'insertTableRow',
  factory() {
    return new InsertRow()
  },
}

export const deleteTableRowConf = {
  key: 'deleteTableRow',
  factory() {
    return new DeleteRow()
  },
}

export const insertTableColConf = {
  key: 'insertTableCol',
  factory() {
    return new InsertCol()
  },
}

export const deleteTableColConf = {
  key: 'deleteTableCol',
  factory() {
    return new DeleteCol()
  },
}

export const tableHeaderMenuConf = {
  key: 'tableHeader',
  factory() {
    return new TableHander()
  },
}

export const tableFullWidthMenuConf = {
  key: 'tableFullWidth',
  factory() {
    return new FullWidth()
  },
}

/** Meger / Split conf */
export const mergeTableCellConf = {
  key: 'mergeTableCell',
  factory() {
    return new MergeCell()
  },
}

export const splitTableCellConf = {
  key: 'splitTableCell',
  factory() {
    return new SplitCell()
  },
}

/** set property conf */
export const setTablePropertyConf = {
  key: 'setTableProperty',
  factory() {
    return new TableProperty()
  },
}

export const setTableCellPropertyConf = {
  key: 'setTableCellProperty',
  factory() {
    return new CellProperty()
  },
}
