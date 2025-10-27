<template>
  <li cursor-pointer p-20px m-20px border border-solid border-amber>
    <h2>{{ info.title }}</h2>
    <p>{{ info.content }}</p>
  </li>
</template>

<script>
export default {
  name: 'dragNode',
  props: {
    info: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style lang="scss" scoped>
</style>