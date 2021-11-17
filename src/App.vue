<template>
  <div class="app">
    <home/>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;

  * {
    box-sizing: border-box;
  }

  .app {
    width: 100vw;
    height: 100vh;

  }
}


</style>
<script>
import Home from "./views/Home";

export default {
  components: {Home}
}
</script>