<script setup>
/* 模拟数据 */
const adCode = ['361000', '360500', '360100', '360300', '360800']
import { sgMapInstance, useVectorLayer } from '@/composables/useMap'
const { getDistrict, addPolygonLayer, addLineLayer, addPolygonSource, addLineSource } = useVectorLayer(sgMapInstance)
const randomItem = ref('')
const handlerLayer = async () => {
  randomItem.value = adCode[Math.floor(Math.random() * adCode.length)]
}
const { district, isPending } = getDistrict(randomItem)
/* 添加多边形图层 */
const polygonId = 'polygon_1'
const lineId = 'line_1'
const { destoryLayer } = addPolygonLayer(district, { id: polygonId, isAddSource: false })
const { destoryLayer: distoryLineLayer } = addLineLayer(district, { id: lineId, isAddSource: false })
/* 添加多边形数据源 */
const { destorySource:destoryPolygonSource } = addPolygonSource(district, polygonId)
/* 添加多边形数据源 */
const {destorySource:destoryLineSource}= addLineSource(district, lineId)
</script>

<template>
  <main absolute w-full z-5>
    <button :disabled="isPending" @click="handlerLayer">切换矢量图层</button>
    <button :disabled="isPending" @click="destoryLayer(false)">销毁矢量图层</button>
    <button :disabled="isPending" @click="destoryPolygonSource">销毁面矢量数据</button>
    <button :disabled="isPending" @click="destoryLineSource">销毁线矢量数据</button>
  </main>
</template>
