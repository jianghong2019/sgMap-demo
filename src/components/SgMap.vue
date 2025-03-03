<template>
  <div id="sgMap" fixed top-0 left-0 w-100vw h-100vh z-3></div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { sgMapInstance, useMapInit, useVectorLayer } from '@/composables/useMap'
console.log(useVectorLayer, sgMapInstance)

const emit = defineEmits(['loaded'])
const mapconfig = {
  srcSdk: 'https://map.sgcc.com.cn/maps?v=3.0.0',
  appkey: '4b9985a37eef391f9ff32c696819f605',
  appsecret: 'ee7b92c92455300896b732377a662077',
  style: 'aegis://styles/aegis/Streets-v2',
  zoom: 6,
  center: [116.06958776337888, 27.451715986601002],
}
useMapInit('sgMap', mapconfig, (map) => {
  console.log(map, 'sgmapvue')
  emit('loaded', map)
})
</script>

<style lang="scss" scoped></style>
