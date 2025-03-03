<script setup>
/* 模拟数据 */
const adCode = ['361000', '360500', '360100', '360300', '360800']
import { sgMapInstance, useVectorLayer } from '@/composables/useMap'
const { getDistrict, addPolygonLayer } = useVectorLayer(sgMapInstance)
const randomItem = ref('')
const handlerLayer = async () => {
  randomItem.value = adCode[Math.floor(Math.random() * adCode.length)]
  console.log('通过城市编码查询城市边界数据', randomItem)
}
const { district, isPending } =  getDistrict(randomItem)
/* 添加多边形图层 */
const { removeLayer } = addPolygonLayer(district)
</script>

<template>
  <main absolute w-full z-5>
    <button :disabled="isPending" @click="handlerLayer">切换矢量图层</button>
    <button :disabled="isPending"  @click="removeLayer">销毁矢量图层</button>
  </main>
</template>
