<template>
  <li :class="['suggestion-item', data.category]"
    @click="select" @keyup.enter="select">{{ data.text }}</li>
</template>

<script>
import {remote} from 'electron'

export default {
  props: {
    data: Object,
    active: {
      type: Boolean,
      default: false,
    }
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
  line-height: 24px;
  cursor: pointer;
}
.suggestion-item::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  margin-top: 9px;
  vertical-align: top;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
}
.suggestion-item.search-engine::before {
  background: #6699cc;
}
</style>
