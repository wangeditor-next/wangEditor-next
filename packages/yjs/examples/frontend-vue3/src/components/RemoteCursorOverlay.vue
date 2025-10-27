<template>
  <div class="relative" ref="containerRef">
    <slot />
    <template v-if="cursors && cursors.length > 0">
      <template v-for="cursor in cursors" :key="cursor.clientId">
        <template v-for="(selectionRect, index) in cursor.selectionRects" :key="index">
          <div
            class="absolute pointer-events-none"
            :style="{
              backgroundColor: addAlpha(cursor.data.color, 0.5),
              left: selectionRect.left + 'px',
              top: selectionRect.top + 'px',
              height: selectionRect.height + 'px',
              width: selectionRect.width + 'px',
            }"
          />
        </template>

        <template v-if="cursor.caretPosition">
          <div
            class="w-0.5 absolute"
            :style="{
              background: cursor.data.color,
              left: cursor.caretPosition.left + 'px',
              top: cursor.caretPosition.top + 'px',
              height: cursor.caretPosition.height + 'px',
            }"
          >
            <div
              class="absolute text-xs text-white whitespace-nowrap top-0 rounded rounded-bl-none px-1.5 py-0.5"
              :style="{ transform: 'translateY(-100%)', background: cursor.data.color }"
            >
              {{ cursor.data.name }}
            </div>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { useRemoteCursorOverlayPositions } from '@wangeditor-next/yjs-for-vue'
import { defineComponent, ref } from 'vue'

import type { CursorData } from '../types'
import { addAlpha } from '../utils'

export default defineComponent({
  name: 'RemoteCursorOverlay',
  setup() {
    const containerRef = ref<HTMLDivElement>()

    const { cursors } = useRemoteCursorOverlayPositions<CursorData, HTMLDivElement>({
      containerRef,
    })

    return {
      containerRef,
      cursors,
      addAlpha,
    }
  },
})
</script>

<style scoped></style>
