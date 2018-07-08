<template>
  <li :class="['suggestion-item', data.category]" :tabindex="index"
    @click="select" @contextmenu="select" @keyup.enter="select">
    <div class="information">
      <span class="tag"></span>
      <img class="icon" :src="icon" v-if="icon"></span>
      <span class="title" v-html="data.title"></span>
      <span class="subtitle" v-if="data.subtitle">{{ data.subtitle }}</span>
    </div>
    <div class="indicator" v-if="data.type === 'setting'">
      <checkbox :checked="settings[data.link]" v-if="settingUI.type === 'checkbox'"></checkbox>
      <template v-else-if="settingUI.type === 'select'">
        <span class="icon-more" v-if="data.value === null"></span>
        <checkbox :checked="settings[data.link].indexOf(data.value) !== -1" v-else-if="settingUI.multiple"></checkbox>
        <checkbox :checked="settings[data.link] === data.value" v-else></checkbox>
      </template>
    </div>
  </li>
</template>

<script>
import {remote, clipboard} from 'electron'
import {spawn} from 'child_process'
import Checkbox from './checkbox'
import {state} from '../plugins/flux'
import settings from '../assets/settings-ui.json'

export default {
  components: {
    'checkbox': Checkbox
  },
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
    settingUI() {
      return this.data.type === 'setting' ? settings[this.data.link] : null
    }
  },
  mounted() {
    const highPerformance = this.settings['presets.highPerformance']
    const showFileIcons = highPerformance !== 'speed' &&
      this.settings['suggestions.files.showFileIcons']
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
      let signal = true
      if (e.ctrlKey || e.button === 2) {
        signal = this.gesture()
      } else {
        signal = this.execute()
      }
      if (signal) {
        remote.getCurrentWindow().hide()
      }
    },
    execute() {
      switch (this.data.type) {
        case 'hyperlink':
          remote.shell.openExternal(this.data.link)
          break
        case 'file':
          if (this.data.args) {
            spawn(this.data.link, this.data.args)
          } else {
            remote.shell.openItem(this.data.link)
          }
          break
        case 'clipboard':
          clipboard.writeText(this.data.link)
          break
        case 'setting':
          this.executeSettings()
          return false
        // no default
      }
      return true
    },
    gesture() {
      switch (this.data.type) {
        case 'hyperlink':
          clipboard.writeText(this.data.link)
          break
        case 'file':
          remote.shell.showItemInFolder(this.data.link)
          return true
        default:
          this.execute()
      }
      return false
    },
    executeSettings() {
      switch (this.settingUI.type) {
        case 'checkbox':
          this.settings[this.data.link] = !this.settings[this.data.link]
          this.$flux.emit('settings/save')
          break
        case 'select': {
          if (this.data.value === null) {
            const query = `:select ${this.data.link}`
            this.$flux.set('input/text', query)
            this.$flux.emit('input/changed', query)
            this.$flux.emit('input/focus')
          } else {
            if (this.settingUI.multiple) {
              const index = this.settings[this.data.link]
                .indexOf(this.data.value)
              if (index === -1) {
                this.settings[this.data.link].push(this.data.value)
              } else {
                this.settings[this.data.link].splice(index, 1)
              }
            } else {
              this.settings[this.data.link] = this.data.value
            }
            this.$flux.emit('settings/save')
          }
          break
        }
        // no default
      }
    }
  },
}
</script>

<style>
.suggestion-item {
  display: flex;
  justify-content: space-between;
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
.suggestion-item .information {
  display: flex;
  flex-grow: 1;
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
.suggestion-item.calculator .tag,
.suggestion-item.calendar .tag {
  color: #99c794;
}
.suggestion-item .indicator .icon-more {
  color: rgba(0, 0, 0, 0.3);
}
</style>
