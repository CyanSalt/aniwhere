<template>
  <div id="main" @keydown.up="prev" @keydown.down="next">
    <typewriter ref="typewriter"></typewriter>
    <div class="divider" v-show="input"></div>
    <suggestion ref="suggestion"></suggestion>
  </div>
</template>

<script>
import Typewriter from './typewriter'
import Suggestion from './suggestion'
import {state} from '../plugins/flux'
import settings from '../resources/default/settings.json'

export default {
  el: '#main',
  components: {
    'typewriter': Typewriter,
    'suggestion': Suggestion,
  },
  computed: {
    input: state('input/text')
  },
  beforeCreate() {
    // custom stylesheet
    const stylesheet = this.$storage.rawdataSync('custom.css')
    if (stylesheet) {
      const element = document.createElement('style')
      element.appendChild(document.createTextNode(stylesheet))
      document.head.appendChild(element)
    }
  },
  created() {
    // custom script
    this.$storage.require('custom.js', init => init(this))
    this.$storage.load('settings.json', (err, data) => {
      data = err ? settings : Object.assign(data, settings)
      this.$flux.set('global/settings', data)
    })
  },
  methods: {
    prev(e) {
      if (e.target === this.$refs.typewriter.$el) {
        const {selectionEnd} = e.target
        if (selectionEnd !== 0) return
      }
      e.preventDefault()
      this.$flux.emit('suggestions/toggle', -1)
    },
    next(e) {
      if (e.target === this.$refs.typewriter.$el) {
        const {selectionStart, value} = e.target
        if (selectionStart !== value.length) return
      }
      e.preventDefault()
      this.$flux.emit('suggestions/toggle', 1)
    }
  }
}
</script>

<style>
#main {
  background: rgba(255, 255, 255, 0.875);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
}
.divider {
  margin: 0 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
