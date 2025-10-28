<template>
  <div id="sgMap" fixed top-0 left-0 w-100vw h-100vh z-3></div>
</template>

<script setup>
import { sgMapInstance, useMapInit, useVectorLayer } from '@/composables/useMap'
const emit = defineEmits(['loaded'])
const router = useRouter()
const mapconfig = {
  srcSdk: 'https://map.sgcc.com.cn/maps?v=3.0.0',
  appkey: '4b9985a37eef391f9ff32c696819f605',
  appsecret: 'ee7b92c92455300896b732377a662077',
  style: 'aegis://styles/aegis/Streets-Raster512',
  zoom: 6,
  center: [120.34256270944385, 36.34056829759095],
  // style: {
  //   "layers": [
  //     // {
  //     //   "id": "mapLayer",
  //     //   "source": "epgis-streets",
  //     //   "source-layer": "mapLayer",
  //     //   "type": "fill",
  //     // },
  //     {
  //       "id": "bgLayer",
  //       "type": "background",
  //       "paint": {
  //         "background-color": "#f00",
  //         "background-opacity":0.3
  //       },
  //       "layout": {
  //         "visibility": "visible"
  //       }
  //     }
  //   ]
  // }
}
useMapInit('sgMap', mapconfig, (map) => {
  console.log(map, 'sgmapvue')
  map.value.addControl(
    new SGMap.ScaleControl({
      maxWidth: 80,
      unit: 'metric',
    }),
    'bottom-left'
  )
  map.value.addControl(new SGMap.PitchControl())
  map.value.addControl(new SGMap.NavigationControl(), 'bottom-right')
  emit('loaded', map)
  router.push({ name: 'drag' })
})
</script>

<style lang="scss" scoped></style>
