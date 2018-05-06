<template>
  <ul class="suggestion">
    <suggestion-item v-for="item, index in suggestions" :key="index"
      :data="item"></suggestion-item>
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
      suggestions: []
    }
  },
  computed: {
    settings: state('global/settings'),
  },
  created() {
    this.$flux.on('input/changed', debounce(value => {
      this.search(value)
      this.resize()
    }, 200))
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
      console.log(value, this.suggestions)
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
}
</style>
