<template>
  <ul class="suggestion">
    <suggestion-item v-for="item, index in suggestions"
      :key="itemID(item)" :index="index" :data="item"
      :active="index === selected"
      ></suggestion-item>
  </ul>
</template>

<script>
import {ipcRenderer, remote} from 'electron'
import debounce from 'lodash.debounce'
import SuggestionItem from './suggestion-item'
import {state} from '../plugins/flux'

import querySettings from '../providers/setting'
import queryCalculation from '../providers/calculator'
import queryDates from '../providers/calendar'
import queryPrograms from '../providers/program'
import queryDocuments from '../providers/document'
import querySearchEngines from '../providers/search-engine'
import querySnippets from '../providers/snippet'

export default {
  components: {
    'suggestion-item': SuggestionItem,
  },
  data() {
    return {
      providers: [
        querySnippets,
        querySettings,
        queryDates,
        queryCalculation,
        queryPrograms,
        queryDocuments,
        querySearchEngines,
      ],
      suggestions: [],
      searchedValue: null,
      searchedAt: 0,
      selected: -1,
      cache: {},
      searcherArguments: {},
      workers: {
        'file-searcher': new Worker('workers/file-searcher.js'),
        'fuzzy-rater': new Worker('workers/fuzzy-rater.js'),
      },
      recentItemCount: 0,
    }
  },
  computed: {
    settings: state('global/settings'),
  },
  created() {
    this.$flux.on('settings/loaded', settings => {
      const disabled = this.settings['providers.internal.disabled']
      const internal = {
        'snippet': querySnippets,
        'calendar': queryDates,
        'calculator': queryCalculation,
        'program': queryPrograms,
        'document': queryDocuments,
        'search-engine': querySearchEngines,
      }
      const purged = disabled.map(category => internal[category])
      this.providers = this.providers
        .filter(provider => purged.indexOf(provider) === -1)
    })
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
          this.$el.childNodes[target].focus()
        }
      }
    })
    this.$flux.on('suggestions/focus', target => {
      this.selected = target
    })
    this.$flux.on('suggestions/register', provider => {
      this.providers.unshift(provider)
    })
    this.handleFileSearcher(this.workers['file-searcher'])
    this.handleFuzzyRater(this.workers['fuzzy-rater'])
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
    itemID(item) {
      return `${item.key || item.link || item.title}@${item.category}`
    },
    search(value) {
      const originalValue = this.searchedValue
      if (value === originalValue) return
      this.searchedValue = value
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
    queryFiles(value, {paths, exts, mapper, by}) {
      const ttl = this.settings['presets.highPerformance'] === 'memory' ?
        0 : this.settings['suggestions.files.caching']
      const cacheKey = exts.join(',')
      const start = this.searchedAt
      if (ttl > 0) {
        let cache = this.cache[cacheKey]
        if (!cache) {
          cache = {list: [], cachedAt: 0}
          this.cache[cacheKey] = cache
        }
        if (start - cache.cachedAt < ttl * 1000) {
          for (const file of cache.list) {
            this.resolveFile({file, value, mapper, by}, {start})
          }
          return []
        }
        cache.list = []
        cache.cachedAt = start
      }
      this.searcherArguments[cacheKey] = {value, mapper, by}
      const searcher = this.workers['file-searcher']
      for (const path of paths) {
        searcher.postMessage(['search', {path, exts}, {start, cacheKey}])
      }
      return []
    },
    handleFileSearcher(searcher) {
      searcher.onmessage = ({data}) => {
        const highPerformance = this.settings['presets.highPerformance']
        const followSymbolLinks = highPerformance !== 'speed' &&
          this.settings['suggestions.files.followSymbolLinks']
        const {info, context} = data
        if (info.shortcut && followSymbolLinks) {
          try {
            const details = remote.shell.readShortcutLink(info.path)
            searcher.postMessage(['shortcut', {info, details}, context])
            return
          } catch (error) {}
        }
        const {start, cacheKey} = context
        if (highPerformance !== 'memory') {
          const cache = this.cache[cacheKey]
          if (cache && start === cache.cachedAt) {
            cache.list.push(info)
          }
        }
        if (start !== this.searchedAt) {
          return
        }
        const args = this.searcherArguments[cacheKey]
        args.file = info
        this.resolveFile(args, {start})
      }
    },
    resolveFile({file, value, mapper, by}, newContext) {
      const entry = mapper(file)
      if (!entry) return
      entry.original = file
      const threshold = this.settings['suggestions.files.fuzzyThreshold']
      const rater = this.workers['fuzzy-rater']
      rater.postMessage([{entry, value, threshold, by}, newContext])
    },
    handleFuzzyRater(rater) {
      rater.onmessage = ({data}) => {
        requestIdleCallback(() => {
          const {entry, context} = data
          if (context.start !== this.searchedAt) return
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
    interpretPath(path) {
      const windowsVariables = /%([^%]+)%/g
      const unixVariables = /\$\{([^}]+)\}/g
      const electronPaths = [
        'aniwhere', 'home', 'appData', 'temp',
        'desktop', 'documents', 'downloads',
        'music', 'pictures', 'videos',
      ]
      const electronVariables = new RegExp(`\\[(${
        electronPaths.join('|')
      })\\]`, 'g')
      const systemReplacement = (full, name) => {
        return process.env[name] || full
      }
      const electronReplacement = (full, name) => {
        try {
          if (name === 'aniwhere') {
            return remote.app.getAppPath()
          }
          return remote.app.getPath(name)
        } catch (e) {}
        return full
      }
      return path.replace(windowsVariables, systemReplacement)
        .replace(unixVariables, systemReplacement)
        .replace(electronVariables, electronReplacement)
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
  overflow-y: auto;
}
</style>
