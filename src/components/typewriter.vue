<template>
  <div class="typewriter">
    <input class="input" type="text" v-model.trim="input" @focus="focus"
      :placeholder="i18n('Search Anything#!1')" autofocus>
    <div class="drag-handler"></div>
  </div>
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
  width: 100%;
  display: flex;
}
.typewriter .input {
  -webkit-appearance: none;
  box-sizing: border-box;
  padding: 0 16px;
  height: 54px;
  line-height: 54px;
  font-size: 24px;
  flex-grow: 1;
  border: none;
  outline: none;
  font-family: inherit;
  background: transparent;
}
.typewriter .input::placeholder {
  color: rgba(0, 0, 0, 0.2);
  font-style: italic;
}
.typewriter .drag-handler {
  width: 20px;
  -webkit-app-region: drag;
  user-select: none;
}
</style>
