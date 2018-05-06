<template>
  <li :class="['suggestion-item', data.category]" :tabindex="index"
    @click="select" @keyup.enter="select">{{ data.text }}</li>
</template>

<script>
import {remote} from 'electron'

export default {
  props: {
    data: Object,
    index: Number,
    active: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    select() {
      this.$flux.emit('suggestions/focus', this.index)
      if (this.data.type === 'hyperlink') {
        remote.shell.openExternal(this.data.link)
      } else {
        remote.shell.openItem(this.data.link)
      }
      remote.getCurrentWindow().hide()
    }
  },
}
</script>

<style>
.suggestion-item {
  margin: 8px 12px;
  padding: 6px 12px;
  border-radius: 4px;
  line-height: 24px;
  cursor: pointer;
  transition: background-color ease 0.2s;
}
.suggestion-item:focus {
  outline: none;
  background-color: rgba(0, 0, 0, 0.08);
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
.suggestion-item.program::before {
  background: #f99157;
}
.suggestion-item.document::before {
  background: #fac863;
}
.suggestion-item.search-engine::before {
  background: #6699cc;
}
</style>
