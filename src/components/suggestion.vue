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
        programs: {
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
    // Search Programs
    queryPrograms(value) {
      const paths = this.settings['suggestions.programPaths'] || []
      const exts = this.settings['suggestions.programExts'] || []
      const duration = this.settings['suggestions.caching'] || 0
      const cache = this.cache.programs
      if (this.searchedAt - cache.cachedAt < duration * 1000) {
        return cache.list
          .filter(program => this.matchProgram(program, value))
          .map(this.getProgramEntry)
      }
      cache.cachedAt = this.searchedAt
      for (const path of paths) {
        const realpath = path.replace(/%([^%]+)%/g, (full, name) => {
          return process.env[name]
        })
        this.searchProgramsIn(value, realpath, exts, this.searchedAt)
      }
      return []
    },
    // eslint-disable-next-line max-params
    searchProgramsIn(value, path, exts, start) {
      readdir(path, (readdirerr, files) => {
        if (readdirerr) return
        for (const file of files) {
          const fullpath = join(path, file)
          lstat(fullpath, (lstaterr, stats) => {
            if (lstaterr) return
            if (stats.isDirectory()) {
              this.searchProgramsIn(value, fullpath, exts, start)
              return
            }
            const ext = exts.find(extname => {
              return file.slice(-extname.length) === extname
            })
            if (ext) {
              const name = basename(file, ext)
              const program = {name, path: fullpath}
              if (start === this.cache.programs.cachedAt) {
                this.cache.programs.list.push(program)
              }
              if (start === this.searchedAt &&
                this.matchProgram(program, value)
              ) {
                this.suggestions.unshift(this.getProgramEntry(program))
              }
            }
          })
        }
      })
    },
    matchProgram(program, value) {
      return program.name.indexOf(value) !== -1
    },
    getProgramEntry(program) {
      return {
        type: 'program',
        category: 'program',
        url: '',
        text: program.name
      }
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
