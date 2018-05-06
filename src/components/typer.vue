<template>
  <input class="main-input" type="text" v-model="input" :placeholder="i18n('Search Anything#!1')" autofocus>
</template>

<script>
import {state} from '../plugins/flux'

export default {
  computed: {
    input: state('input/text'),
  }
}
</script>

<style>
.main-input {
  -webkit-appearance: none;
  box-sizing: border-box;
  padding: 0 16px;
  height: 54px;
  line-height: 54px;
  font-size: 24px;
  width: 100%;
  border: none;
  outline: none;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.875);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
}
.main-input::placeholder {
  color: rgba(0, 0, 0, 0.2);
  font-style: italic;
}
</style>
