<template>
  <div class="typewriter">
    <input class="input" type="text" v-model.trim="input" @focus="focus"
      :placeholder="i18n('Search Anything#!1')" autofocus>
    <span class="icon-delete" @click="empty"></span>
    <div class="drag-handler"></div>
  </div>
</template>

<script>
export default {
  name: 'query-input',
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
    },
    empty() {
      this.input = ''
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
  line-height: 54px;
  -webkit-app-region: drag;
  user-select: none;
}
.typewriter .drag-handler::before {
  content: '';
  display: inline-block;
  margin-left: 4px;
  border-right: 6px solid rgba(0, 0, 0, 0.1);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}
.typewriter .icon-delete {
  margin: 0 8px;
  font-size: 18px;
  line-height: 54px;
  color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.typewriter .input:placeholder-shown + .icon-delete {
  display: none;
}
</style>
