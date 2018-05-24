<template>
  <ul class="suggestion">
    <suggestion-item v-for="item, index in suggestions"
      :key="`${ item.link }@${ index }`" :index="index" :data="item"
      :active="index === selected"
      ></suggestion-item>
  </ul>
</template>

<script>
import {ipcRenderer, remote} from 'electron'
import {join, basename} from 'path'
import {promisify} from 'util'
import {readdir, lstat} from 'original-fs'
import debounce from 'lodash.debounce'
import fuzzysort from 'fuzzysort'
import SuggestionItem from './suggestion-item'
import {state} from '../plugins/flux'
import pinyin from '../lib/pinyin'

import queryCalculation from '../providers/calculator'
import queryPrograms from '../providers/program'
import queryDocuments from '../providers/document'
import querySearchEngines from '../providers/search-engine'

const plstat = promisify(lstat)

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
      cache: {},
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
      if (target < this.suggestions.length) {
        if (target >= -1) {
          this.selected = target
        }
        if (target < 0) {
          // Note: `input/focus` will trigger `focus`
          this.$flux.emit('input/focus')
        } else {
          this.$children[target].$el.focus()
        }
      }
    })
    this.$flux.on('suggestions/focus', target => {
      this.selected = target
    })
    this.$flux.on('suggestions/register', provider => {
      this.providers.unshift(provider)
    })
  },
  methods: {
    resize() {
      this.$nextTick(() => {
        // const height = document.body.scrollHeight + 12
        const length = Math.min(this.suggestions.length, 6)
        const height = 12 + 54 + 1 +
          (36 * length) + (8 * (length ? length + 1 : 0))
        ipcRenderer.send('resize/height', height)
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
        .sort(this.compareSuggestion)
    },
    resolve(suggestion) {
      const {length} = this.suggestions
      let index = this.suggestions
        .findIndex(item => this.compareSuggestion(suggestion, item) === -1)
      if (index === -1) index = length
      this.suggestions.splice(index, 0, suggestion)
      if (length < 6) {
        this.resize()
      }
    },
    queryFiles(value, {paths, exts, mapper}) {
      const ttl = this.settings['suggestions.caching']
      const key = exts.join(',')
      let cache = this.cache[key]
      if (!cache) {
        cache = {list: [], cachedAt: 0}
        this.cache[key] = cache
      }
      if (this.searchedAt - cache.cachedAt < ttl * 1000) {
        return cache.list.map(file => {
          const {matched, score, indexes} = this.matchFile(file, value)
          if (!matched) return null
          const entry = mapper(file)
          if (!entry) return null
          if (entry.highlight && indexes) {
            const pseudo = {target: entry.title, indexes}
            entry.title = fuzzysort.highlight(pseudo, '<strong>', '</strong>')
          }
          return Object.assign(entry, {score})
        }).filter(Boolean)
      }
      const start = this.searchedAt
      cache.cachedAt = start
      const callback = file => {
        if (start === cache.cachedAt) {
          cache.list.push(file)
        }
        if (start !== this.searchedAt) {
          return
        }
        const {matched, score, indexes} = this.matchFile(file, value)
        if (!matched) return
        const entry = mapper(file)
        if (!entry) return
        if (entry.highlight && indexes) {
          const pseudo = {target: entry.title, indexes}
          entry.title = fuzzysort.highlight(pseudo, '<strong>', '</strong>')
        }
        this.resolve(Object.assign(entry, {score}))
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
              if (exts.indexOf('/') !== -1) {
                callback({
                  name: file,
                  basename: file,
                  path: fullpath,
                })
              }
              return
            }
            const ext = exts.find(extname => {
              return file.slice(-extname.length) === extname
            })
            if (!ext) return
            const info = {
              name: file,
              basename: basename(file, ext),
              path: fullpath,
              icon: fullpath,
            }
            if (ext !== '.lnk' || process.platform !== 'win32') {
              callback(info)
              return
            }
            let details = null
            try {
              details = remote.shell.readShortcutLink(fullpath)
            } catch (e) {
              callback(info)
              return
            }
            info.path = details.target
            let condition = null
            if (exts.indexOf('/') !== -1) {
              condition = Promise.resolve()
            } else {
              condition = plstat(details.target).then(lstats => {
                if (lstats.isDirectory()) {
                  throw new Error('is directory')
                }
                return lstats
              })
            }
            condition.then(() => {
              info.icon = details.icon
              info.description = details.description
              if (details.args) {
                info.args = details.args.trim().split(/\s+/)
              }
            }).catch(e => {}).then(() => {
              callback(info)
            })
          })
        }
      })
    },
    matchFile(file, value) {
      const threshold = this.settings['suggestions.fuzzyThreshold']
      // Chinese pinyin search
      const chinese = /[\u4e00-\u9FA5]/g
      let haystack = file.name
      let transformed = false
      if (!chinese.test(value)) {
        haystack = haystack.replace(chinese, char => ` ${pinyin(char)} `).trim()
        transformed = true
      }
      const result = fuzzysort.single(value, haystack)
      if (!result) return {matched: false}
      return {
        matched: result.score > threshold,
        score: result.score,
        indexes: transformed ? null : result.indexes,
      }
    },
    compareSuggestion(foo, bar) {
      const categoryOrder = this.settings['suggestions.categoryOrder']
      let diff = 0
      if (foo.category !== bar.category) {
        diff = categoryOrder.indexOf(foo.category) -
          categoryOrder.indexOf(bar.category)
      } else {
        diff = bar.score - foo.score
      }
      if (!diff) return 0
      return diff > 0 ? 1 : -1
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
