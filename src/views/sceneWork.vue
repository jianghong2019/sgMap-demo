<script setup>
/* 模拟数据 */
import features from '/public/geojson/features.json'
const adCode = ['361000', '360500', '360100', '360300', '360800']
import { sgMapInstance, useVectorLayer, useMapEvents, isLoaded } from '@/composables/useMap'
console.log(sgMapInstance, sgMapInstance.value)

const {
  getDistrict,
  addbackgroundLayer,
  addPolygonLayer,
  addLineLayer,
  addPolygonSource,
  addLineSource,
  addGeoJsonLayers,
} = useVectorLayer(sgMapInstance)
const { onMapClick } = useMapEvents(sgMapInstance)
const randomItem = ref('')
const handlerLayer = async () => {
  randomItem.value = adCode[Math.floor(Math.random() * adCode.length)]
}
const { district, isPending } = getDistrict(randomItem)
/* 添加多边形图层 */
const polygonId = 'polygon_1'
const lineId = 'line_1'
const { destoryLayer } = addPolygonLayer(district, { id: polygonId, isAddSource: false })
const { destoryLayer: distoryLineLayer } = addLineLayer(district, {
  id: lineId,
  isAddSource: false,
})
/* 添加多边形数据源 */
const { destorySource: destoryPolygonSource } = addPolygonSource(district, polygonId)
/* 添加多边形数据源 */
const { destorySource: destoryLineSource } = addLineSource(district, lineId)
/* 添加背景图层 */
const { destoryLayer: destoryBg, trigger: triggerBg } = addbackgroundLayer(isLoaded)
const geoJsonData = ref([])
console.log(geoJsonData, sgMapInstance)
const {destory:destoryGeoLayer} = addGeoJsonLayers(geoJsonData)
console.log(onMapClick)
const addGeoJson = () =>{
  geoJsonData.value = features?.successful ? features?.data : []
}
const { destory: destoryMapClick } = onMapClick(
  (e) => {
    const { clickType } = e
    if (clickType === 1) {
      console.log('单击事件', e)
    } else if (clickType === 2) {
      console.log('双击事件', e)
    }
  },
  (e) => {
    console.log(e)
  },
)
</script>

<template>
  <main absolute w-full z-5>
    <button :disabled="isPending" @click="triggerBg">切换背景图层</button>
    <button :disabled="isPending" @click="handlerLayer">切换矢量图层</button>
    <button :disabled="isPending" @click="destoryLayer(false)">销毁面矢量图层</button>
    <button :disabled="isPending" @click="destoryPolygonSource">销毁面矢量数据</button>
    <button :disabled="isPending" @click="destoryLineSource">销毁线矢量数据</button>
    <button :disabled="isPending" @click="addGeoJson">添加geoJson数据</button>
    <button :disabled="isPending" @click="destoryGeoLayer">销毁geoJson图层</button>
  </main>
</template>
