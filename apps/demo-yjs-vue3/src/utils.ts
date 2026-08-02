import { faker } from '@faker-js/faker'
import randomColor from 'randomcolor'

import type { CursorData } from './types'

const {
  name: { firstName, lastName },
} = faker
const DEFAULT_COLLABORATION_ROOM = 'wangeditor-next-yjs'
const DEMO_ROOM_STORAGE_KEY = 'wangeditor-next-yjs-demo-room'

function createDemoRoom(): string {
  const roomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `wangeditor-next-demo-${roomId}`
}

export function randomCursorData(): CursorData {
  return {
    color: randomColor({
      luminosity: 'dark',
      alpha: 1,
      format: 'hex',
    }),
    name: `${firstName()} ${lastName()}`,
  }
}

export function getCollaborationRoom(): string {
  const room = new URLSearchParams(window.location.search).get('room')

  if (room) {
    return room
  }

  if (import.meta.env.VITE_YJS_DEMO_MODE !== 'true') {
    return DEFAULT_COLLABORATION_ROOM
  }

  const savedRoom = window.sessionStorage.getItem(DEMO_ROOM_STORAGE_KEY)

  if (savedRoom) {
    return savedRoom
  }

  const generatedRoom = createDemoRoom()

  window.sessionStorage.setItem(DEMO_ROOM_STORAGE_KEY, generatedRoom)

  return generatedRoom
}

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)

  return hexColor + normalized.toString(16).toUpperCase()
}
