<template>
  <div id="main">
    <typewriter></typewriter>
    <div class="divider" v-show="input"></div>
    <suggestion></suggestion>
  </div>
</template>

<script>
import Typewriter from './typewriter'
import Suggestion from './suggestion'
import {state} from '../plugins/flux'

export default {
  el: '#main',
  components: {
    'typewriter': Typewriter,
    'suggestion': Suggestion,
  },
  computed: {
    input: state('input/text')
  },
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
