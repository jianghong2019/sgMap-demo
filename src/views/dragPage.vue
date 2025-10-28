<template>
  <div class="bg-sky-6/50" w-320px h-full z-5>
    <ul h-full overflow-auto>
      <drag-node
        v-for="item in list"
        :key="item.id"
        :info="item"
        @mousedown="startDrag(item, $event)"
        :style="dragItem && dragItem.id === item.id ? dragStyle : {}"
      ></drag-node>
    </ul>
    <!-- 拖拽时显示的半透明项 -->
    <drag-node
      v-if="dragItem"
      :style="{
        position: 'fixed',
        left: dragPos.x + 'px',
        top: dragPos.y + 'px',
        pointerEvents: 'none',
        opacity: 0.8,
        zIndex: 9999,
      }"
      :info="dragItem"
    ></drag-node>
  </div>
</template>

<script>
import * as turf from '@turf/turf'
import { sgMapInstance, useVectorLayer } from '@/composables/useMap'
import dragNode from '@/components/dragNode.vue'
import { useRenderPopup } from '@/composables/useMap/useRenderPopup'
export default {
  name: 'dragPage',
  components: {
    dragNode,
  },
  data() {
    return {
      list: [
        { id: 1, title: '标题1', content: 'xxxxx111111' },
        { id: 2, title: '标题2', content: 'xxxxx111112' },
        { id: 3, title: '标题3', content: 'xxxxx111113' },
        { id: 4, title: '标题4', content: 'xxxxx111114' },
        { id: 5, title: '标题5', content: 'xxxxx111115' },
        { id: 6, title: '标题6', content: 'xxxxx111116' },
        { id: 7, title: '标题7', content: 'xxxxx111117' },
      ],
      dragItem: null,
      dragCurrentItem: null,
      dragPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }, //距离元素本身左上角的偏移量
      dragCenterOffset: { x: 0, y: 0 }, //鼠标距离元素中心的偏移量
      polygons: [], // 存储面数据
      highlightId: null, // 当前高亮面id
    }
  },
  computed: {
    dragStyle() {
      return {
        opacity: 0.8,
      }
    },
  },
  methods: {
    startDrag(item, e) {
      this.dragItem = item
      this.dragCurrentItem = item
      // 获取 dragNode 元素
      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      // 元素中心点坐标
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // 鼠标点击点到中心点的偏移量
      this.dragCenterOffset = {
        x: e.clientX - centerX,
        y: e.clientY - centerY,
      }
      this.dragOffset = {
        x: e.offsetX,
        y: e.offsetY,
      }
      this.dragPos = {
        x: e.clientX - this.dragOffset.x,
        y: e.clientY - this.dragOffset.y,
      }
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    },
    onMouseMove(e) {
      this.dragPos = {
        x: e.clientX - this.dragOffset.x,
        y: e.clientY - this.dragOffset.y,
      }
      // 屏幕坐标转地图经纬度（假设 sgMapInstance.value 有相关方法）
      const map = sgMapInstance.value
      if (!map) return
      // 获取地图容器的屏幕位置
      console.log(map.getContainer)

      const mapContainer = map.getContainer
        ? map.getContainer()
        : document.getElementById('你的地图容器id')
      console.log(mapContainer)
      const rect = mapContainer.getBoundingClientRect()
      console.log('rect', rect)

      // 计算鼠标在地图容器内的像素坐标（相对于地图容器左上角）
      const pixelX = this.dragPos.x - rect.left + (e.currentTarget?.offsetWidth || 0) / 2
      const pixelY = this.dragPos.y - rect.top + (e.currentTarget?.offsetHeight || 0) / 2
      console.log('map.unproject', pixelX, pixelY, map.unproject)

      // 用地图的 unproject 方法将像素坐标转为经纬度
      let lngLat = null
      if (typeof map.unproject === 'function') {
        lngLat = map.unproject([pixelX, pixelY])
      }
      if (!lngLat) return
      console.log('lngLat', lngLat)

      // 判断是否在某个面内
      let highlightId = null
      for (const poly of this.polygons) {
        if (poly.type === 'fill' && poly.data) {
          const polygon = poly.data.features[0]
          const lx = turf.point([lngLat.lng, lngLat.lat])
          console.log('lx', lx)

          const isInPolygon = turf.booleanPointInPolygon(lx, polygon)
          if (isInPolygon) {
            console.log('点在面中：====>', poly)

            highlightId = poly.sbid
            break
          }
        }
      }
      console.log('highlightId !== this.highlightId', highlightId, this.highlightId)
      this.highlightId = highlightId
      this.updatePolygonColor()
      // 如果高亮面变化，更新地图
      if (highlightId !== this.highlightId) {
        this.highlightId = highlightId
        this.updatePolygonColor()
      }
    },
    onMouseUp(e) {
      // 放到鼠标所在位置（这里只是演示，实际可根据需求处理）
      this.dragPos = {
        x: e.clientX - this.dragOffset.x,
        y: e.clientY - this.dragOffset.y,
      }
      this.dragItem = null
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    },
    updatePolygonColor() {
      console.log('updatePolygonColor，高亮颜色')

      this.polygons.forEach((poly) => {
        if (poly.type === 'fill' && poly.data) {
          const feature = poly.data.features[0]
          // 备份原色
          if (!feature.properties.colorBak) {
            feature.properties.colorBak = feature.properties.color
          }
          feature.properties.color =
            poly.sbid === this.highlightId
              ? feature.properties.highlightColor
              : feature.properties.normalColor
        }
      })
      console.log('this.layerReturns====>', this.layerReturns, this.polygons)
      if (!this.highlightId) {
        this.layerReturns?.forEach((layer) => {
          const source = this.polygons?.find((r) => r.id == layer.id)?.data
          sgMapInstance.value?.getSource(layer.id)?.setData(source)
        })
        return
      }
      const currentLayer = this.layerReturns?.find((r) => r.id == this.highlightId)
      const currentSource = sgMapInstance.value?.getSource(currentLayer?.id)
      const source = this.polygons?.find((r) => r.id == this.highlightId)?.data
      console.log('currentLayer,currentSource', currentLayer, currentSource, source)
      if (!currentSource) {
        sgMapInstance.value?.addSource(currentLayer.id, source)
      } else {
        sgMapInstance.value?.getSource(currentLayer.id)?.setData(source)
      }
      // const vectorLayer = useVectorLayer(sgMapInstance)
      // console.log('vectorLayer', vectorLayer)

      // vectorLayer.addGeoJsonLayers(this.polygons)
    },
  },
  async mounted() {
    const res = await fetch('/features.json')
    const geoJson = await res.json()
    console.log('dargPage中获取地图实例：===>', sgMapInstance, geoJson, geoJson.data)
    if (sgMapInstance?.value && geoJson?.data) {
      const vectorLayer = useVectorLayer(sgMapInstance)
      const returns = vectorLayer.addGeoJsonLayers(geoJson.data)
      this.polygons = geoJson.data // 保存面数据
      this.layerReturns = returns.layerReturns
    }
    // sgMapInstance.value.on('mouseover', (e) => {
    //   console.log('mouseover===>', e)
    // })
    // sgMapInstance.value.on('mouseout', (e) => {
    //   console.log('mouseout===>', e)
    // })
    // sgMapInstance.value.on('mousemove', (e) => {
    //   console.log('鼠标移动mousemove===>', e)
    // })
    sgMapInstance?.value.on('mouseup', (e) => {
      console.log(
        '鼠标松开mouseup===>',
        e,
        e.lngLat,
        this.dragCenterOffset.x,
        this.dragCenterOffset.y
      )
      const { popup, update, remove } = useRenderPopup(
        dragNode,
        // { lng: 120, lat: 30 },
        e.lngLat,
        [-this.dragCenterOffset.x, -this.dragCenterOffset.y],
        { info: this.dragCurrentItem }
      )
      // update({ msg: 'new msg' })
      // remove()
    })
    // const polygon1 = {
    //   type: 'Feature',
    //   geometry: {
    //     type: 'Polygon',
    //     coordinates: [geoData1.map((point) => [point.lng, point.lat])],
    //   },
    //   properties: {},
    // }

    // const polygon2 = {
    //   type: 'Feature',
    //   geometry: {
    //     type: 'Polygon',
    //     coordinates: [geoData2.map((point) => [point.lng, point.lat])],
    //   },
    //   properties: {},
    // }
    // const geoData1 = [
    //   { lat: 38.62866906887916, lng: 120.63919356881803 },
    //   { lat: 36.6540942343439, lng: 122.24319747506803 },
    //   {
    //     lat: 36.83016888662563,
    //     lng: 119.70535567819388,
    //   },
    // ]
    // const geoData2 = [
    //   {
    //     lat: 36.48644950006813,
    //     lng: 118.92532638131814,
    //   },
    //   {
    //     lat: 34.970371377091524,
    //     lng: 117.94754317819252,
    //   },
    //   {
    //     lat: 33.919428278864345,
    //     lng: 121.30935958444388,
    //   },
    // ]
  },
}
</script>

<style lang="scss" scoped>
</style>