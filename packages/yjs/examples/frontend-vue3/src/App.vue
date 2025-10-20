<template>
  <remote-cursors-overlay-page v-if="!showBaseVersion"/>
  <simple v-else></simple>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import RemoteCursorsOverlayPage from './components/RemoteCursorsOverlayPage.vue'
import Simple from './components/Simple.vue'

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
