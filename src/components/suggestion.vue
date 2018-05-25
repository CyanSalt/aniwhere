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
      cache: {},
      workers: {
        'file-searcher': null,
        'fuzzy-rater': null,
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
      // Note: body.scrollHeight will change at the next tick
      // const height = document.body.scrollHeight + 12
      const length = Math.min(this.suggestions.length, 6)
      if (length === this.recentItemCount) return
      this.recentItemCount = length
      const height = 12 + 54 + 1 +
        (36 * length) + (8 * (length ? length + 1 : 0))
      ipcRenderer.send('resize/height', height)
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
      this.resize()
    },
    queryFiles(value, {paths, exts, mapper}) {
      const ttl = this.settings['suggestions.caching']
      const cacheKey = exts.join(',')
      let cache = this.cache[cacheKey]
      if (!cache) {
        cache = {list: [], cachedAt: 0}
        this.cache[cacheKey] = cache
      }
      const start = this.searchedAt
      if (start - cache.cachedAt < ttl * 1000) {
        for (const file of cache.list) {
          this.resolveFile({file, value, mapper}, {start})
        }
        return []
      }
      cache.cachedAt = start
      if (!this.workers['file-searcher']) {
        this.workers['file-searcher'] = new Worker('workers/file-searcher.js')
      }
      const searcher = this.workers['file-searcher']
      this.handleFileSearcher(searcher, {value, mapper})
      for (const originalPath of paths) {
        const path = originalPath.replace(/%([^%]+)%/g, (full, name) => {
          return process.env[name] || full
        })
        searcher.postMessage(['search', {path, exts}, {start, cacheKey}])
      }
      return []
    },
    handleFileSearcher(searcher, args) {
      searcher.onmessage = ({data}) => {
        const {info, context} = data
        if (info.shortcut) {
          try {
            const details = remote.shell.readShortcutLink(info.path)
            searcher.postMessage(['shortcut', {info, details}, context])
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
        args.file = info
        this.resolveFile(args, {start})
      }
    },
    resolveFile({file, value, mapper}, newContext) {
      const entry = mapper(file)
      if (!entry) return
      entry.originalName = file.name
      if (!this.workers['fuzzy-rater']) {
        this.workers['fuzzy-rater'] = new Worker('workers/fuzzy-rater.js')
        this.handleFuzzyRater(this.workers['fuzzy-rater'])
      }
      const rater = this.workers['fuzzy-rater']
      rater.postMessage([{entry, value}, newContext])
    },
    handleFuzzyRater(rater) {
      rater.onmessage = ({data}) => {
        requestIdleCallback(() => {
          const {entry, context} = data
          if (context.start !== this.searchedAt) return
          const threshold = this.settings['suggestions.fuzzyThreshold']
          if (entry.score === false || entry.score < threshold) return
          this.resolve(entry)
        })
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
  overflow-y: auto;
}
</style>
