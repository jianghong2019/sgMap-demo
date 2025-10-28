import { renderDynamicComponent } from '@/utils/renderDynamicComponent'
import { sgMapInstance } from './useMapInit'

/**
 * 在地图上渲染自定义 Vue 组件 popup
 * @param {Object} Component - Vue组件引用
 * @param {Object} lngLat - 经纬度对象，如 {lng: 120, lat: 30}
 * @param {Object} props - 传递给组件的props
 * @returns {Object} popup实例
 */
export function useRenderPopup(Component, lngLat, offset, props = {}) {
  // 创建popup
  const popupDOM = new SGMap.Popup({
    closeButton: false,
    closeOnClick: false,
    anchor: 'center',
    offset: { center: offset },
  })
  console.log('创建popupDOM===》', popupDOM)

  // 创建容器
  const container = document.createElement('div')
  container.className = 'popup-render-root'

  // 设置popup内容
  console.log(sgMapInstance.value)

  popupDOM.setLngLat(lngLat).setDOMContent(container).addTo(sgMapInstance.value)
  // 监听popup开启，，渲染vue组件
  let instance = renderDynamicComponent(Component, props, container)
  // popupDOM.on('open', function (e) {
  //   console.log('popupDOM打开', e)

  //   // 渲染Vue组件
  //   instance = renderDynamicComponent(Component, props, container)
  // })
  // 监听popup关闭，自动卸载组件
  popupDOM.on('close', function () {
    instance && instance.unmount && instance.unmount()
  })

  // 返回popup实例和组件实例
  return {
    popup: popupDOM,
    componentInstance: instance,
    remove() {
      popupDOM.remove()
      instance && instance.unmount && instance.unmount()
    },
    update(newProps = {}) {
      instance && instance.update && instance.update(newProps)
    },
  }
}
