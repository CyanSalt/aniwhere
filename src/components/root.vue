<template>
  <div id="main">
    <typer></typer>
  </div>
</template>

<script>
import Typer from './typer'

export default {
  el: '#main',
  components: {
    'typer': Typer,
  },
}
</script>
