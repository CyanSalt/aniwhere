<template>
  <li :class="['suggestion-item', data.category]" :tabindex="index"
    @click="select" @keyup.enter="select">
    <span class="tag"></span>
    <img class="icon" :src="icon" v-if="icon"></span>
    <span class="title" v-html="data.title"></span>
    <span class="subtitle" v-if="data.subtitle">{{ data.subtitle }}</span>
  </li>
</template>

<script>
import {remote, clipboard} from 'electron'
import {spawn} from 'child_process'
import {state} from '../plugins/flux'

export default {
  props: {
    data: Object,
    index: Number,
    active: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      icon: null,
    }
  },
  computed: {
    settings: state('global/settings'),
  },
  mounted() {
    const showFileIcons = this.settings['suggestions.files.showFileIcon']
    if (this.data.icon && showFileIcons) {
      remote.app.getFileIcon(this.data.icon, (err, icon) => {
        err || (this.icon = icon.toDataURL())
      })
    } else {
      this.icon = null
    }
  },
  methods: {
    select(e) {
      this.$flux.emit('suggestions/focus', this.index)
      switch (this.data.type) {
        case 'hyperlink':
          remote.shell.openExternal(this.data.link)
          break
        case 'file':
          if (e.ctrlKey) {
            remote.shell.showItemInFolder(this.data.link)
          } else if (this.data.args) {
            spawn(this.data.link, this.data.args)
          } else {
            remote.shell.openItem(this.data.link)
          }
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
.suggestion-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.suggestion-item .icon {
  height: 20px;
  margin: 2px 4px 2px 0;
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
