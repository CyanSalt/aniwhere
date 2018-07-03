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
    this.$flux.set('global/defaultSettings', settings)
    this.$storage.require('custom.js', init => init(this))
    this.$storage.load('settings.json', (err, data) => {
      const copied = JSON.parse(JSON.stringify(settings))
      data = err ? copied : Object.assign({}, copied, data)
      this.$flux.set('global/settings', data)
      this.$flux.emit('settings/loaded', data)
      this.$flux.on('settings/save', () => {
        this.$storage.save('settings.json', Object.entries(settings)
          .reduce((diff, [key, value]) => {
            if (JSON.stringify(value) !== JSON.stringify(data[key])) {
              diff[key] = data[key]
            }
            return diff
          }, {}))
      })
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
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 1px 1px 6px 0 rgba(0, 0, 0, 0.2)
}
.divider {
  display: flex;
  margin: 0 16px;
  height: 1px;
  justify-content: space-between;
  background: #fac863;
}
.divider::before, .divider::after {
  content: '';
  display: block;
  width: 33.333%;
  height: 1px;
}
.divider::before {
  background: #f99157;
}
.divider::after {
  background: #6699cc;
}
</style>
