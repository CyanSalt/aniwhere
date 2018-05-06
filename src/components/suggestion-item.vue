<template>
  <li class="suggestion-item" @click="select">{{ data.text }}</li>
</template>

<script>
import {remote} from 'electron'

export default {
  props: {
    data: Object,
  },
  methods: {
    select() {
      if (this.data.type === 'hyperlink') {
        remote.shell.openExternal(this.data.url)
        remote.getCurrentWindow().hide()
        // return
      }
    }
  },
}
</script>

<style>
.suggestion-item {
  padding: 8px 16px;
  cursor: pointer;
}
</style>
