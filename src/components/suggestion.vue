<template>
  <ul class="suggestion">
    <suggestion-item v-for="item, index in suggestions" :key="index"
      :data="item"></suggestion-item>
  </ul>
</template>

<script>
import debounce from 'lodash.debounce'
import SuggestionItem from './suggestion-item'

export default {
  components: {
    'suggestion-item': SuggestionItem,
  },
  data() {
    return {
      suggestions: []
    }
  },
  created() {
    this.$flux.on('input/changed', debounce(value => {
      this.search(value)
    }, 200))
  },
  methods: {
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
      return [
        {
          type: 'hyperlink',
          url: 'https://www.baidu.com/s?word=%W'.replace('%W', encodeURIComponent(value)),
          text: '在 %N 中搜索: %W'.replace('%N', '百度').replace('%W', value)
        }
      ]
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
