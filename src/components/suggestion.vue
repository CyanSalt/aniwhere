<template>
  <ul class="suggestion">
    <suggestion-item v-for="item, index in suggestions" :key="index"
      :index="index" :data="item" :active="index === selected"
      ></suggestion-item>
  </ul>
</template>

<script>
import debounce from 'lodash.debounce'
import {ipcRenderer, remote} from 'electron'
import SuggestionItem from './suggestion-item'
import {state} from '../plugins/flux'

export default {
  components: {
    'suggestion-item': SuggestionItem,
  },
  data() {
    return {
      suggestions: [],
      selected: -1,
    }
  },
  computed: {
    settings: state('global/settings'),
  },
  created() {
    this.$flux.on('input/changed', debounce(value => {
      this.selected = -1
      this.search(value)
      this.resize()
    }, 200))
    this.$flux.on('suggestions/toggle', step => {
      const target = this.selected + step
      if (target < 0) {
        // Note: `input/focus` will trigger `focus`
        this.$flux.emit('input/focus')
        return
      }
      if (target < this.suggestions.length) {
        this.selected = target
        this.$children[target].$el.focus()
      }
    })
    this.$flux.on('suggestions/focus', target => {
      this.selected = target
    })
  },
  methods: {
    resize() {
      this.$nextTick(() => {
        const frame = remote.getCurrentWindow()
        const height = document.body.scrollHeight + 12
        const [width, originalHeight] = frame.getSize()
        if (height !== originalHeight) {
          // Resize with margin size of body
          ipcRenderer.send('resize', width, height)
        }
      })
    },
    search(value) {
      if (!value) {
        this.suggestions = []
        return
      }
      this.suggestions = [].concat(
        this.queryPrograms(value),
        this.queryDocuments(value),
        this.querySearchEngines(value),
      )
    },
    queryPrograms(value) {
      return []
    },
    queryDocuments(value) {
      return []
    },
    querySearchEngines(value) {
      const engines = this.settings['suggestions.searchEngines'] || []
      const encoded = encodeURIComponent(value)
      return engines.map(engine => ({
        type: 'hyperlink',
        category: 'search-engine',
        url: engine.url.replace('%W', encoded),
        text: this.i18n('Search by %N: %W#!2')
          .replace('%N', engine.name).replace('%W', value)
      }))
    },
  },
}
</script>

<style>
.suggestion {
  margin: 0;
  padding: 0;
  list-style: none;
  /* (36 + 8) * 6 + 8 = 272 */
  max-height: 272px;
  overflow: hidden;
}
</style>
