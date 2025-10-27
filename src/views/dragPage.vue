<template>
  <div class="bg-sky-6/50" w-400px h-full z-5>
    <ul h-full overflow-auto>
      <!-- <li
        v-for="item in list"
        :key="item.id"
        cursor-pointer
        p-20px
        m-20px
        border
        border-solid
        border-amber
      >
        <h2>{{ item.title }}</h2>
        <p>{{ item.content }}</p>
      </li> -->
      <drag-node
        v-for="item in list"
        :key="item.id"
        :info="item"
        @mousedown="startDrag(item, $event)"
        :style="dragItem && dragItem.id === item.id ? dragStyle : {}"
      ></drag-node>
    </ul>
    <!-- 拖拽时显示的半透明项 -->
    <div
      v-if="dragItem"
      :style="{
        position: 'fixed',
        left: dragPos.x + 'px',
        top: dragPos.y + 'px',
        pointerEvents: 'none',
        opacity: 0.5,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid #f90',
        padding: '20px',
        width: '360px',
      }"
    >
      <h2>{{ dragItem.title }}</h2>
      <p>{{ dragItem.content }}</p>
    </div>
  </div>
</template>

<script>
import { sgMapInstance } from '@/composables/useMap'
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
      dragOffset: { x: 0, y: 0 },
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
  },
  mounted() {
    console.log('dargPage中获取地图实例：===>', sgMapInstance)
    // sgMapInstance.value.on('mouseover', (e) => {
    //   console.log('mouseover===>', e)
    // })
    // sgMapInstance.value.on('mouseout', (e) => {
    //   console.log('mouseout===>', e)
    // })
    // sgMapInstance.value.on('mousemove', (e) => {
    //   console.log('鼠标移动mousemove===>', e)
    // })
    sgMapInstance.value.on('mouseup', (e) => {
      console.log('鼠标松开mouseup===>', e, e.lngLat)
      const { popup, update, remove } = useRenderPopup(
        dragNode,
        // { lng: 120, lat: 30 },
        e.lngLat,
        { info: this.dragCurrentItem }
      )
      // update({ msg: 'new msg' })
      // remove()
    })
  },
}
</script>

<style lang="scss" scoped>
</style>