<template>
  <input class="typewriter" type="text" v-model.trim="input" @focus="focus"
    :placeholder="i18n('Search Anything#!1')" autofocus>
</template>

<script>
export default {
  computed: {
    input: {
      get() {
        return this.$flux.get('input/text')
      },
      set(value) {
        this.$flux.set('input/text', value)
        this.$flux.emit('input/changed', value)
      }
    }
  },
  created() {
    this.$flux.on('input/focus', () => {
      this.$el.focus()
    })
  },
  methods: {
    focus() {
      this.$flux.emit('suggestions/focus', -1)
    }
  }
}
</script>

<style>
.typewriter {
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
  background: transparent;
}
.typewriter::placeholder {
  color: rgba(0, 0, 0, 0.2);
  font-style: italic;
}
</style>
