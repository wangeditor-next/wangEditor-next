import { isHTMLElememt } from '@wangeditor-next/core'
import { h, VNode } from 'snabbdom'

export type SelectionRect = {
  top: number
  right: number
  bottom: number
  left: number
}

export type SelectionPerimeterSide = 'top' | 'right' | 'bottom' | 'left'

export type SelectionPerimeterSegment = {
  side: SelectionPerimeterSide
  offset: number
  start: number
  end: number
}

type Interval = [number, number]
type BoundaryMap = Map<number, Interval[]>
type OverlayElements = {
  container: HTMLElement
  table: HTMLElement
}

const COORDINATE_PRECISION = 100
const MIN_SEGMENT_LENGTH = 0.01
const HALO_WIDTH = 3
const SCALE_PROBE_SIZE = 100

function boundaryKey(value: number): number {
  return Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION
}

function addBoundary(map: BoundaryMap, offset: number, interval: Interval) {
  const key = boundaryKey(offset)
  const intervals = map.get(key) || []

  intervals.push(interval)
  map.set(key, intervals)
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort(([firstStart], [secondStart]) => firstStart - secondStart)

  return sorted.reduce<Interval[]>((merged, interval) => {
    const previous = merged[merged.length - 1]

    if (previous && interval[0] <= previous[1] + MIN_SEGMENT_LENGTH) {
      previous[1] = Math.max(previous[1], interval[1])
      return merged
    }

    merged.push([...interval])
    return merged
  }, [])
}

function mergeBoundaryIntervals(map: BoundaryMap) {
  map.forEach((intervals, offset) => {
    map.set(offset, mergeIntervals(intervals))
  })
}

function subtractIntervals(interval: Interval, blockers: Interval[]): Interval[] {
  const [start, end] = interval
  const visible: Interval[] = []
  let cursor = start

  for (const [rawBlockerStart, rawBlockerEnd] of blockers) {
    const blockerStart = Math.max(start, rawBlockerStart)
    const blockerEnd = Math.min(end, rawBlockerEnd)

    if (blockerEnd <= cursor + MIN_SEGMENT_LENGTH) {
      continue
    }

    if (blockerStart > cursor + MIN_SEGMENT_LENGTH) {
      visible.push([cursor, blockerStart])
    }

    cursor = Math.max(cursor, blockerEnd)
    if (cursor >= end - MIN_SEGMENT_LENGTH) {
      break
    }
  }

  if (cursor < end - MIN_SEGMENT_LENGTH) {
    visible.push([cursor, end])
  }

  return visible
}

function mergeAdjacentSegments(segments: SelectionPerimeterSegment[]): SelectionPerimeterSegment[] {
  const sorted = [...segments].sort(
    (first, second) =>
      first.side.localeCompare(second.side) ||
      first.offset - second.offset ||
      first.start - second.start
  )

  return sorted.reduce<SelectionPerimeterSegment[]>((merged, segment) => {
    const previous = merged[merged.length - 1]
    const sameBoundary =
      previous &&
      previous.side === segment.side &&
      boundaryKey(previous.offset) === boundaryKey(segment.offset)

    if (sameBoundary && segment.start <= previous.end + MIN_SEGMENT_LENGTH) {
      previous.end = Math.max(previous.end, segment.end)
      return merged
    }

    merged.push({ ...segment })
    return merged
  }, [])
}

/**
 * Returns the physical perimeter of a set of non-overlapping cell rectangles. Opposing edges
 * cancel only where they overlap, so partially exposed sides of merged cells remain precise.
 */
export function getSelectionPerimeterSegments(rects: SelectionRect[]): SelectionPerimeterSegment[] {
  const topBoundaries: BoundaryMap = new Map()
  const rightBoundaries: BoundaryMap = new Map()
  const bottomBoundaries: BoundaryMap = new Map()
  const leftBoundaries: BoundaryMap = new Map()

  rects.forEach(rect => {
    addBoundary(topBoundaries, rect.top, [rect.left, rect.right])
    addBoundary(rightBoundaries, rect.right, [rect.top, rect.bottom])
    addBoundary(bottomBoundaries, rect.bottom, [rect.left, rect.right])
    addBoundary(leftBoundaries, rect.left, [rect.top, rect.bottom])
  })

  mergeBoundaryIntervals(topBoundaries)
  mergeBoundaryIntervals(rightBoundaries)
  mergeBoundaryIntervals(bottomBoundaries)
  mergeBoundaryIntervals(leftBoundaries)

  const segments: SelectionPerimeterSegment[] = []
  const addVisibleSegments = (
    side: SelectionPerimeterSide,
    offset: number,
    interval: Interval,
    blockers: BoundaryMap
  ) => {
    const opposing = blockers.get(boundaryKey(offset)) || []

    subtractIntervals(interval, opposing).forEach(([start, end]) => {
      segments.push({ side, offset, start, end })
    })
  }

  rects.forEach(rect => {
    addVisibleSegments('top', rect.top, [rect.left, rect.right], bottomBoundaries)
    addVisibleSegments('right', rect.right, [rect.top, rect.bottom], leftBoundaries)
    addVisibleSegments('bottom', rect.bottom, [rect.left, rect.right], topBoundaries)
    addVisibleSegments('left', rect.left, [rect.top, rect.bottom], rightBoundaries)
  })

  return mergeAdjacentSegments(segments)
}

function replaceOverlayChildren(elm: HTMLElement, child?: Node) {
  while (elm.firstChild) {
    elm.removeChild(elm.firstChild)
  }

  if (child) {
    elm.appendChild(child)
  }
}

function getOverlayElements(elm: HTMLElement): OverlayElements | null {
  const container = elm.parentElement
  const table = Array.from(container?.children || []).find(child => child.tagName === 'TABLE')

  if (!isHTMLElememt(container) || !isHTMLElememt(table) || table.tagName !== 'TABLE') {
    return null
  }

  return { container, table }
}

function measureOverlay(elm: HTMLElement) {
  const probe = elm.ownerDocument.createElement('span')

  probe.style.position = 'absolute'
  probe.style.display = 'block'
  probe.style.top = '0'
  probe.style.left = '0'
  probe.style.width = `${SCALE_PROBE_SIZE}px`
  probe.style.height = `${SCALE_PROBE_SIZE}px`
  probe.style.margin = '0'
  probe.style.padding = '0'
  probe.style.border = '0'
  probe.style.boxSizing = 'border-box'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.transform = 'none'
  elm.appendChild(probe)

  const overlayRect = elm.getBoundingClientRect()
  const probeRect = probe.getBoundingClientRect()

  elm.removeChild(probe)

  const measuredScaleX = probeRect.width / SCALE_PROBE_SIZE
  const measuredScaleY = probeRect.height / SCALE_PROBE_SIZE

  return {
    overlayRect,
    scaleX: Number.isFinite(measuredScaleX) && measuredScaleX > 0 ? measuredScaleX : 1,
    scaleY: Number.isFinite(measuredScaleY) && measuredScaleY > 0 ? measuredScaleY : 1,
  }
}

export function drawSelectionOverlay(elm: Node | undefined) {
  if (!isHTMLElememt(elm)) {
    return
  }

  const elements = getOverlayElements(elm)

  if (!elements) {
    replaceOverlayChildren(elm)
    return
  }

  const { table } = elements

  const selectedCells = Array.from(
    table.querySelectorAll<HTMLElement>('td.w-e-selected, th.w-e-selected')
  ).filter(cell => cell.closest('table') === table)

  if (selectedCells.length === 0) {
    replaceOverlayChildren(elm)
    return
  }

  const { overlayRect, scaleX, scaleY } = measureOverlay(elm)
  const rects = selectedCells
    .map(cell => cell.getBoundingClientRect())
    .filter(rect => rect.width > 0 && rect.height > 0)
    .map(rect => ({
      top: (rect.top - overlayRect.top) / scaleY,
      right: (rect.right - overlayRect.left) / scaleX,
      bottom: (rect.bottom - overlayRect.top) / scaleY,
      left: (rect.left - overlayRect.left) / scaleX,
    }))
  const fragment = elm.ownerDocument.createDocumentFragment()

  getSelectionPerimeterSegments(rects).forEach(segment => {
    const line = elm.ownerDocument.createElement('span')
    const horizontal = segment.side === 'top' || segment.side === 'bottom'
    const left = horizontal
      ? segment.start
      : segment.offset - (segment.side === 'right' ? HALO_WIDTH : 0)
    const top = horizontal
      ? segment.offset - (segment.side === 'bottom' ? HALO_WIDTH : 0)
      : segment.start

    line.className = [
      'w-e-table-selection-segment',
      `w-e-table-selection-segment-${segment.side}`,
      horizontal
        ? 'w-e-table-selection-segment-horizontal'
        : 'w-e-table-selection-segment-vertical',
    ].join(' ')
    line.setAttribute('data-selection-edge', segment.side)
    line.style.left = `${left}px`
    line.style.top = `${top}px`
    line.style.width = `${horizontal ? segment.end - segment.start : HALO_WIDTH}px`
    line.style.height = `${horizontal ? HALO_WIDTH : segment.end - segment.start}px`
    fragment.appendChild(line)
  })

  replaceOverlayChildren(elm, fragment)
}

export function renderSelectionOverlay(): VNode {
  return h('div.w-e-table-selection-overlay', {
    attrs: {
      'aria-hidden': 'true',
      contenteditable: 'false',
    },
    hook: {
      insert: ({ elm }: VNode) => drawSelectionOverlay(elm),
      postpatch: (_oldVnode: VNode, { elm }: VNode) => drawSelectionOverlay(elm),
    },
  })
}
