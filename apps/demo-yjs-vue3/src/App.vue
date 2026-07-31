<template>
  <remote-cursors-overlay-page v-if="!showBaseVersion" />
  <simple v-else></simple>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, ref } from 'vue'

const RemoteCursorsOverlayPage = defineAsyncComponent(
  () => import('./components/RemoteCursorsOverlayPage.vue')
)
const Simple = defineAsyncComponent(() => import('./components/Simple.vue'))

export default defineComponent({
  components: { Simple, RemoteCursorsOverlayPage },
  setup() {
    const showBaseVersion = ref(false)

    return {
      showBaseVersion,
    }
  },
})
</script>

<style scoped></style>
