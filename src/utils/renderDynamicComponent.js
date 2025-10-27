/**
 * usePopupRender - 兼容 Vue 2.7 和 Vue 3 的弹窗渲染工具
 */
let vueVersion = 3
let Vue2 = null
try {
  // Vue 2.7 支持 createApp，但 window.Vue 依然存在
  if (typeof window !== 'undefined' && window.Vue) {
    Vue2 = window.Vue
    vueVersion = 2
  } else {
    // 尝试 require vue2
    // eslint-disable-next-line
    Vue2 = require('vue')
    if (Vue2 && Vue2.version && Vue2.version.startsWith('2')) {
      vueVersion = 2
    }
  }
} catch (e) {
  // ignore
}

export function renderDynamicComponent(Component, initialProps = {}, mountNode = document.body) {
  if (vueVersion === 2) {
    // Vue 2.x 方式
    const Constructor = Vue2.extend(Component)
    const vm = new Constructor({
      propsData: { ...initialProps },
    })
    const container = document.createElement('div')
    container.className = 'dynamic-render-root'
    mountNode.appendChild(container)
    vm.$mount(container)
    return {
      vm,
      container,
      update(newProps = {}) {
        Object.keys(newProps).forEach((key) => {
          vm.$props[key] = newProps[key]
        })
      },
      unmount() {
        vm.$destroy()
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      },
    }
  } else {
    // Vue 3.x 方式
    // 动态引入，避免打包冲突
    const { createApp, h, reactive } = require('vue')
    const container = document.createElement('div')
    container.className = 'popup-render-root'
    mountNode.appendChild(container)
    const propsState = reactive({ ...initialProps })
    const Root = {
      render() {
        return h(Component, { ...propsState })
      },
    }
    const app = createApp(Root)
    app.mount(container)
    return {
      container,
      update(newProps = {}) {
        Object.keys(newProps).forEach((key) => {
          propsState[key] = newProps[key]
        })
      },
      unmount() {
        try {
          app.unmount()
        } catch (e) {}
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      },
    }
  }
}
