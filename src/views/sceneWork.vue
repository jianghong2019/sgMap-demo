<script setup>
/* 模拟数据 */
const adCode = ['361000', '360500', '360100', '360300', '360800']
import { ref, reactive, onMounted } from 'vue'
import { sgMapInstance, useVectorLayer } from '@/composables/useMap'
const { getDistrict, addPolygonLayer } = useVectorLayer(sgMapInstance)
const district = ref([])
const { removeLayer } = addPolygonLayer(district)
const handlerLayer = async () => {
  const randomItem = adCode[Math.floor(Math.random() * adCode.length)]
  console.log('切换图层', randomItem)
  district.value = await getDistrict(randomItem)
  console.log(district)
}
</script>

<template>
  <main absolute w-full z-5>
    <button @click="handlerLayer">切换矢量图层</button>
    <button @click="removeLayer">隐藏矢量图层</button>
  </main>
</template>
