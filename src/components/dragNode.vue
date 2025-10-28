<template>
  <li relative w-260px bg-sky-3 cursor-pointer p-20px m-20px border border-solid border-amber>
    <h2>{{ info.title }}</h2>
    <p>{{ info.content }}</p>
    <button absolute right-8px top-4px @click="handlerMore">更多</button>
    <div v-show="showMore" absolute left-260px top-0 w-400px h-400px bg-sky-8>详情。。。。。</div>
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
  data() {
    return {
      showMore: false,
    }
  },
  methods: {
    handlerMore() {
      this.showMore = true
    },
  },
}
</script>

<style lang="scss" scoped>
</style>