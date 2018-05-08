<template>
  <li :class="['suggestion-item', data.category]" :tabindex="index"
    @click="select" @keyup.enter="select">
    <span class="tag"></span>
    <span class="title">{{ data.title }}</span>
    <span class="subtitle" v-if="data.subtitle">{{ data.subtitle }}</span>
  </li>
</template>

<script>
import {remote, clipboard} from 'electron'

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
      switch (this.data.type) {
        case 'hyperlink':
          remote.shell.openExternal(this.data.link)
          break
        case 'file':
          remote.shell.openItem(this.data.link)
          break
        case 'clipboard':
          clipboard.writeText(this.data.link)
          break
        // no default
      }
      remote.getCurrentWindow().hide()
    }
  },
}
</script>

<style>
.suggestion-item {
  display: flex;
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
.suggestion-item .subtitle {
  margin-left: 12px;
  width: 0;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.5;
}
.suggestion-item .tag {
  color: rgba(0, 0, 0, 0.1);
}
.suggestion-item .tag::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  margin-top: 9px;
  vertical-align: top;
  border-radius: 50%;
  background: currentColor;
}
.suggestion-item.program .tag {
  color: #f99157;
}
.suggestion-item.document .tag {
  color: #fac863;
}
.suggestion-item.search-engine .tag {
  color: #6699cc;
}
</style>
