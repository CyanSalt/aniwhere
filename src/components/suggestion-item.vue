<template>
  <li class="suggestion-item">{{ data.text }}</li>
</template>

<script>
export default {
  props: {
    data: Object,
  },
  data() {
    return {
    }
  },
  methods: {
  },
}
</script>

<style>
.suggestion-item {
  padding: 8px 16px;
}
</style>
