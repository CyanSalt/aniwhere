<template>
  <label :class="['pretty-checkbox', {'checked': checked}]">
    <span class="icon-checked"></span>
  </label>
</template>

<script>
export default {
  name: 'pretty-checkbox',
  props: {
    checked: Boolean,
  },
}
</script>

<style>
.pretty-checkbox {
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  cursor: pointer;
  color: #28a386;
}
.pretty-checkbox .icon-checked {
  display: block;
  width: 0;
  height: 100%;
  overflow: hidden;
  transition: width ease-in 0.2s;
}
.pretty-checkbox .icon-checked:before {
  content: '';
  margin-left: 2px;
  display: block;
  width: 10px;
  height: 5px;
  border-left: 2px solid;
  border-bottom: 2px solid;
  transform: rotate(-45deg);
}
.pretty-checkbox.checked .icon-checked {
  width: 100%;
}
</style>
