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
import {join, basename} from 'path'
import {readdir, lstat} from 'original-fs'
import SuggestionItem from './suggestion-item'
import {state} from '../plugins/flux'

export default {
  components: {
    'suggestion-item': SuggestionItem,
  },
  data() {
    return {
      suggestions: [],
      searchedAt: 0,
      selected: -1,
      cache: {
        program: {
          list: [],
          cachedAt: 0,
        },
        document: {
          list: [],
          cachedAt: 0,
        },
      }
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
      this.searchedAt = Date.now()
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
      const paths = this.settings['suggestions.programPaths'] || []
      const exts = this.settings['suggestions.programExts'] || []
      return this.queryFiles(value, 'program', paths, exts)
    },
    queryDocuments(value) {
      const paths = this.settings['suggestions.documentPaths'] || []
      const exts = this.settings['suggestions.documentExts'] || []
      return this.queryFiles(value, 'document', paths, exts)
    },
    querySearchEngines(value) {
      const engines = this.settings['suggestions.searchEngines'] || []
      const encoded = encodeURIComponent(value)
      return engines.map(engine => ({
        type: 'hyperlink',
        category: 'search-engine',
        link: engine.url.replace('%W', encoded),
        text: this.i18n('Search by %N: %W#!2')
          .replace('%N', engine.name).replace('%W', value)
      }))
    },
    // eslint-disable-next-line max-params
    queryFiles(value, category, paths, exts) {
      const duration = this.settings['suggestions.caching'] || 0
      const cache = this.cache[category]
      if (this.searchedAt - cache.cachedAt < duration * 1000) {
        return cache.list
          .filter(file => this.matchFile(file, value))
          .map(file => this.getFileEntry(category, file))
      }
      const start = this.searchedAt
      cache.cachedAt = start
      const callback = file => {
        if (start === cache.cachedAt) {
          cache.list.push(file)
        }
        if (start === this.searchedAt && this.matchFile(file, value)) {
          this.suggestions.unshift(this.getFileEntry(category, file))
        }
      }
      for (const path of paths) {
        const realpath = path.replace(/%([^%]+)%/g, (full, name) => {
          return process.env[name]
        })
        this.searchFilesIn(realpath, exts, callback)
      }
      return []
    },
    searchFilesIn(path, exts, callback) {
      readdir(path, (readdirerr, files) => {
        if (readdirerr) return
        for (const file of files) {
          const fullpath = join(path, file)
          lstat(fullpath, (lstaterr, stats) => {
            if (lstaterr) return
            if (stats.isDirectory()) {
              this.searchFilesIn(fullpath, exts, callback)
              return
            }
            const ext = exts.find(extname => {
              return file.slice(-extname.length) === extname
            })
            if (ext) {
              const name = basename(file, ext)
              const program = {name, path: fullpath}
              callback(program)
            }
          })
        }
      })
    },
    matchFile(program, value) {
      return program.name.indexOf(value) !== -1
    },
    getFileEntry(category, file) {
      return {
        type: 'file',
        category,
        link: file.path,
        text: file.name
      }
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
