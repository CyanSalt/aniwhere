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
import debounce from 'lodash.debounce'
import fuzzysort from 'fuzzysort'
import SuggestionItem from './suggestion-item'
import {state} from '../plugins/flux'
import pinyin from '../lib/pinyin'

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
      cache: {},
      workers: {
        'file-searcher': null,
      },
      recentItemCount: 0,
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
        if (length === this.recentItemCount) return
        this.recentItemCount = length
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
      const cacheKey = exts.join(',')
      let cache = this.cache[cacheKey]
      if (!cache) {
        cache = {list: [], cachedAt: 0}
        this.cache[cacheKey] = cache
      }
      if (this.searchedAt - cache.cachedAt < ttl * 1000) {
        return cache.list
          .map(file => this.getFileEntry(file, value, mapper))
          .filter(Boolean)
      }
      const start = this.searchedAt
      cache.cachedAt = start
      const callback = file => {
        const entry = this.getFileEntry(file, value, mapper)
        entry && this.resolve(entry)
      }
      for (const originalPath of paths) {
        const path = originalPath.replace(/%([^%]+)%/g, (full, name) => {
          return process.env[name] || full
        })
        this.searchFilesIn({path, exts}, {start, cacheKey}, callback)
      }
      return []
    },
    getFileEntry(file, value, mapper) {
      const {matched, score, indexes} = this.matchFile(file, value)
      if (!matched) return null
      const entry = mapper(file)
      if (!entry) return null
      if (entry.highlight && indexes) {
        const pseudo = {target: entry.title, indexes}
        entry.title = fuzzysort.highlight(pseudo, '<strong>', '</strong>')
      }
      return Object.assign(entry, {score})
    },
    searchFilesIn(args, newContext, callback) {
      if (!this.workers['file-searcher']) {
        this.workers['file-searcher'] = new Worker('workers/file-searcher.js')
      }
      const searcher = this.workers['file-searcher']
      searcher.onmessage = ({data}) => {
        const {info, context} = data
        if (info.shortcut) {
          try {
            const details = remote.shell.readShortcutLink(info.path)
            searcher.postMessage(['shortcut', context, {info, details}])
            return
          } catch (error) {}
        }
        const {start, cacheKey} = context
        const cache = this.cache[cacheKey]
        if (cache && start === cache.cachedAt) {
          cache.list.push(info)
        }
        if (start !== this.searchedAt) {
          return
        }
        callback(info)
      }
      searcher.postMessage(['search', newContext, args])
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
