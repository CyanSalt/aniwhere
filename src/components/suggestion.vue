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

import queryCalculation from '../providers/calculator'
import queryPrograms from '../providers/program'
import queryDocuments from '../providers/document'
import querySearchEngines from '../providers/search-engine'

export default {
  components: {
    'suggestion-item': SuggestionItem,
  },
  data() {
    return {
      providers: [
        queryCalculation,
        queryPrograms,
        queryDocuments,
        querySearchEngines,
      ],
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
      this.suggestions = this.providers
        .map(provider => provider.call(this, value))
        .reduce((suggestions, result) => suggestions.concat(result), [])
    },
    // eslint-disable-next-line max-params
    queryFiles(value, category, paths, exts) {
      const duration = this.settings['suggestions.caching'] || 0
      const cache = this.cache[category]
      if (this.searchedAt - cache.cachedAt < duration * 1000) {
        return cache.list
          .filter(file => this.matchFile(file, value))
          .map(file => this.getFileEntry(category, file))
          .sort(this.compareSuggestion)
      }
      const start = this.searchedAt
      cache.cachedAt = start
      const callback = file => {
        if (start === cache.cachedAt) {
          cache.list.push(file)
        }
        if (start === this.searchedAt && this.matchFile(file, value)) {
          const {length} = this.suggestions
          let index = this.suggestions
            .findIndex(item => this.compareSuggestion(file, item) === -1)
          if (index === -1) index = length
          this.suggestions.splice(index, 0, this.getFileEntry(category, file))
          if (length < 6) {
            this.resize()
          }
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
              callback({
                name: file,
                basename: basename(file, ext),
                path: fullpath,
              })
            }
          })
        }
      })
    },
    matchFile(file, value) {
      const delimiters = '.\\+*?[^]$(){}=!<>|:-'
      const regex = value.split('')
        .map(char => {
          return delimiters.indexOf(char) === -1 ? char : `\\${char}`
        }).join('.*?')
      return new RegExp(regex).test(file.name)
      // return file.name.indexOf(value) !== -1
    },
    getFileEntry(category, file) {
      return {
        type: 'file',
        category,
        link: file.path,
        text: category === 'program' ?
          file.basename : file.name
      }
    },
    compareSuggestion(foo, bar) {
      return -1
    }
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
