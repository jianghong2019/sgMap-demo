export const useVectorLayer = (map) => {
  const sgMapInstance = toValue(map)
  console.log(map, sgMapInstance)

  /**
   * @description 业务层-添加行政区域边界、面、点图层
   * @param {object} source -行政区域图层初始化
   * @param {array} source.sub_districts -Array行政区域下辖县市镇的坐标数据
   * @param {Boolean} isDark -是否开启黑色背景，可选值：true|false 默认不开启
   * @returns {object} tileLayers -返回创建的点线面图层对象
   */
  const addtileLayers = (source, isDark = false) => {
    const bgLayer = (isDark && addbackgroundLayer()) || null
    console.log(source, '<======source')
    source.lineWidth = 4
    source.lineColor = '#fff'
    source.sub_districts.map((r) => {
      r.color = '#68AFB0'
      r.opacity = 1
      r.textColor = '#111'
      r.lineColor = '#8ccdc4'
      r.lineWidth = 2
    })
    if (source.level === 'county') {
      map.setLayoutProperty(bgLayer.id, 'visibility', 'none')
      source.lineWidth = 3
      source.lineColor = '#0055ff'
      source.sub_districts.map((r) => {
        r.color = '#e1edf6'
        r.opacity = 0.4
        // r.bgColor = '#57a3a5'
        // r.textColor = '#fff'
        r.lineColor = '#56cbc6'
        r.lineWidth = 2
      })
    }
    if (!map.getSource('symbol')) {
      map.addSource('symbol', {
        type: 'geojson',
        data: source,
        cluster: true,
        clusterMaxZoom: 12, // 最大聚类层级
        clusterRadius: 100, // 聚合点半径，默认50
      })
    }
    if (!map.getSource('boundary1')) {
      map.addSource('boundary1', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }
    let boundary = []
    boundary.push({
      geometry: source.shape,
      properties: {
        adcode: source.adcode,
        bbox: source.bbox,
        center: source.center,
        level: source.level,
        name: source.name,
      },
    })
    boundary.push(
      ...source.sub_districts.map((item) => {
        return {
          type: 'Feature',
          geometry: item.shape,
          properties: {
            adcode: item.adcode,
            bbox: item.bbox,
            center: item.center,
            level: item.level,
            name: item.name,
          },
        }
      }),
    )
    map.getSource('boundary1').setData({
      type: 'FeatureCollection',
      features: boundary,
    })
    console.log(map.getSource('symbol'), 'symbol')
    const polygonLayer = addPolygonLayer(source)
    const numbersLayer = addPointLayer(source, {
      name: 'value',
      iconName: 'none-pic',
      id: 'symbolVal',
      color: '#fff',
      iconStyle: {},
      textStyle: {
        'text-anchor': 'bottom',
        'text-offset': ['get', 'offsetNum'],
      },
    })
    const lineLayer = addLineLayer(source)
    const polygonLineLayer = addLineLayer(source, false)
    const pointLayer = addPointLayer(source)
    flyTo(initStrToNum(source.center.split(',')), setZoombyLevel(source.level))
    const tileLayers = {
      bgLayer,
      lineLayer,
      polygonLineLayer,
      polygonLayer,
      pointLayer,
      numbersLayer,
    }
    if (source.level === 'town') {
      for (let [key, { remove }] of Object.entries(tileLayers)) {
        remove()
      }
    }
    return tileLayers
  }
  const addPolygonLayer = (district, { id = 'polygonLayer', isAddSource = false }) => {
    const source = ref(null)
    watch(district, (newValue, oldValue) => {
      if (!newValue) return
      if (!map.value?.getLayer(id)) {
        map.value?.addLayer({
          id,
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          },
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 1,
          },
          layout: {
            visibility: 'visible',
          },
        })
      }
      source.value = isAddSource ? addPolygonSource(newValue, id) : null
    })
    console.log(map)

    return {
      source,
      id,
      layer: map.value?.getLayer(id),
      destoryLayer: (isSourceDestory) => destoryLayer(id, isSourceDestory),
    }
  }
  /**
   * @description 业务层-三期-待办工单-计划点连线图层
   * @param {array} source 图层所需数据
   * @param {object} source.properties 图元所需的属性，可配置与`属性驱动`相对应的控制字段
   * @param {String} id - 图层id-可用于调用地图方法的传参-唯一
   * @returns {object} 返回图层信息和图层数据源信息以及图层、数据源销毁方法
   * @property {array} featureSource 图层数据源
   * @property {Function} -destory 销毁当前图层
   * @property {Function} -remove 销毁当前图层所加载的数据源
   */
  const addLineLayer = (district, { id = 'lineLayer', isAddSource = false }) => {
    const source = ref(null)
    watch(district, (newValue, oldValue) => {
      if (!newValue) return
      if (!map.value?.getLayer(id)) {
        map.value?.addLayer({
          id,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': ['get', 'lineColor'],
            'line-width': ['get', 'lineWidth'],
            'line-dasharray': [1, 2],
            'line-offset': -2,
          },
        })
      }
      source.value = isAddSource ? addLineSource(newValue, id) : null
    })
    return {
      id,
      layer: map.value?.getLayer(id),
      destoryLayer: (isSourceDestory) => destoryLayer(id, isSourceDestory),
    }
  }
  /**
   * @description 创建背景图层，背景图层需要多次控制显隐，背景图层remove为将其设置为不可见
   * @param {Boolean} isLoaded 是否初始化一个背景图层
   * @param {Object} options 配置项
   * @param {String} options.id 图层id
   * @returns {object}
   * @property {String} id -背景图层id，与入参id一致
   * @property {object} layer -创建后的图层对象
   * @property {Function} remove -移除背景图层（将图层设置为不可见）
   */
  const addbackgroundLayer = (isLoaded, options = {}) => {
    const { id = 'bgLayer' } = options
    watch(isLoaded, (newValue, oldValue) => {
      if (newValue && !map.value.getLayer(id)) {
        map.value.addLayer({
          id,
          type: 'background',
          paint: {
            'background-color': '#000',
            'background-opacity': 0.4,
          },
        })
      }
    })
    const trigger = () => {
      const name = map?.value?.getLayoutProperty(id, 'visibility')
      console.log(name)
      map?.value?.setLayoutProperty(id, 'visibility', name === 'none' ? 'visible' : 'none')
    }
    return {
      id,
      layer: map?.value?.getLayer(id),
      trigger,
      destoryLayer: () => destoryLayer(id, false),
    }
  }
  const destoryLayer = (id, isSourceDestory = true) => {
    const layer = map?.value?.getLayer(id) ?? null
    if (!layer) return
    map?.value?.removeLayer(id)
    isSourceDestory && destorySource(id)
  }
  const destorySource = (id) => {
    const layer = map?.value?.getLayer(id) ?? null
    const source = map.value?.getSource(id)
    if (!source) return
    map.value?.getSource(id).setData({
      type: 'FeatureCollection',
      features: [],
    })
    !layer && map?.value.removeSource(id)
  }
  const addPolygonSource = (district, id) => {
    console.log(district, id)
    watch(district, (newValue, oldValue) => {
      const features = newValue?.map((r) => {
        return {
          type: 'Feature',
          geometry: r.shape,
          properties: {
            color: '#68AFB0',
            ...r,
          },
        }
      })
      console.log(features, '面数据', id, map.value?.getSource(id))
      const currentSource = map.value?.getSource(id)
      const source = {
        type: 'FeatureCollection',
        features,
      }
      if (!currentSource) {
        map.value?.addSource(id, source)
      } else {
        map.value?.getSource(id)?.setData(source)
      }
    })
    return {
      destorySource: () => destorySource(id),
    }
  }
  const addLineSource = (district, id) => {
    watch(district, (newValue, oldValue) => {
      const features = newValue?.map((r) => {
        console.log(r.shape.coordinates[0][0])

        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: r.shape?.coordinates?.[0]?.[0] ?? [],
          },
          properties: {
            color: '#f00',
            lineColor: '#c0f',
            lineWidth: 2,
            ...r,
          },
        }
      })
      console.log(features, '线数据', id, map.value?.getSource(id))
      const currentSource = map.value?.getSource(id)
      const source = {
        type: 'FeatureCollection',
        features,
      }
      if (!currentSource) {
        map.value?.addSource(id, source)
      } else {
        map.value?.getSource(id)?.setData(source)
      }
    })
    return {
      destorySource: () => destorySource(id),
    }
  }
  /**
   * @param {keyword} 行政区域编码 江西：360000
   * @returns {object} district 调用获取行政区域数据的返回值
   */
  const getDistrict = (keyword) => {
    const isPending = ref(false)
    const district = ref(null)
    watch(keyword, async (newValue, oldValue) => {
      try {
        if (newValue !== oldValue) {
          const districtPlusTask = window.districtPlusTask
          isPending.value = true
          const res = await districtPlusTask.searchDistrict({
            keyword: newValue, // 检索关键字，或者是行政区划编码,必填（第一级为 “中国”）
            pageIndex: 1, //(默认 1)	起始页码, 默认为1
            pageSize: 1, //(默认 10)	返回记录数，默认为10
            subdistrict: [1], //查询结果展示的子级。设置显示下级行政区级数（行政区级别包括：省/直辖市、市、区/县、乡镇、村5个级别）;可选值：0、1、2、3、4. 0：不返回下级行政区；1：返回下一级行政区；2：返回下两级行政区；3：返回下三级行政区；4：返回下四级行政区；
            extension: true, // fasle:不返回行政区边界坐标点；true会返回所有级别的行政区划边界，当级别较多时数据量非常大，慎重使用
            levels: 'county,province,city,town', //"county,province,city,county,town,village" subdistrict: 2,                //需要
          })
          district.value =
            (res.status === '1' && res?.data?.districts?.length && res.data.districts) || null
          console.log(district)
        }
      } catch (error) {
      } finally {
        console.log('无论成功与否都返回true')
        isPending.value = false
      }
    })
    return { district, isPending }
  }
  const addGeoJsonLayer = (geoJson, options = {}) => {
    /* type支持类型：fill, line, symbol, circle, esymbol, eline, heatmap, fill-extrusion, raster, hillshade, background */
    const { id = 'geoJsonLayer', type = 'fill', layout, paint } = options

    if (!map.value?.getLayer(id)) {
      const data = {
        id,
        type,
        source: {
          type: 'geojson',
          data: geoJson,
        },
        layout,
        paint,
      }
      console.log(map.value, data, options, 'map')
      map.value?.addLayer(data)
    }
    return {
      id,
      layer: map.value?.getLayer(id),
      destoryLayer: () => destoryLayer(id, false),
    }
  }
  const addGeoJsonLayers = (geoJsonData) => {
    const layerReturns = []
    // watch(
    //   geoJsonData,
    //   (datas, oldValue) => {
    //     if (!datas || !datas?.length) return
    //     console.log(datas)

    //     datas?.forEach((geoDataItem) => {
    //       console.log('geoDataItem', geoDataItem)

    //       const { type } = geoDataItem
    //       let layout = {}
    //       let paint = {}
    //       if (type === 'circle') {
    //         paint = {
    //           'circle-radius': ['case', ['has', 'radius'], ['get', 'radius'], 10],
    //           'circle-color': ['get', 'color'],
    //         }
    //       } else if (type === 'line') {
    //         layout = {
    //           'line-cap': 'square',
    //           'line-join': 'miter',
    //         }
    //         paint = {
    //           'line-color': ['get', 'color'],
    //           'line-width': ['case', ['has', 'width'], ['get', 'width'], 3],
    //           // "line-dasharray": [1,2],//虚线
    //           'line-dasharray': [
    //             'case',
    //             ['==', ['get', 'lineType'], 'dashed'],
    //             ['literal', [1, 4]],
    //             ['literal', []],
    //           ],
    //         }
    //       } else if (type === 'symbol') {
    //         layout = {
    //           'icon-image': ['get', 'icon'],
    //           'icon-anchor': 'center',
    //           'icon-size': ['case', ['has', 'iconSize'], ['get', 'iconSize'], 0.4],
    //           'icon-rotate': ['get', 'rotation'],
    //           'icon-allow-overlap': true,
    //         }
    //       }
    //       /* 根据数据结构绘制地图元素*/
    //       const layerReturn = addGeoJsonLayer(geoDataItem.data, {
    //         id: geoDataItem.sbid,
    //         type: geoDataItem.type,
    //         layout,
    //         paint,
    //       })
    //       layerReturns.push(layerReturn)
    //     })
    //   },
    //   {
    //     immediate: true,
    //   },
    // )
    if (!geoJsonData || !geoJsonData?.length) return
    console.log(geoJsonData)

    geoJsonData?.forEach((geoDataItem) => {
      console.log('geoDataItem', geoDataItem)

      const { type } = geoDataItem
      let layout = {}
      let paint = {}
      if (type === 'circle') {
        paint = {
          'circle-radius': ['case', ['has', 'radius'], ['get', 'radius'], 10],
          'circle-color': ['get', 'color'],
        }
      } else if (type === 'line') {
        layout = {
          'line-cap': 'square',
          'line-join': 'miter',
        }
        paint = {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['has', 'width'], ['get', 'width'], 3],
          // "line-dasharray": [1,2],//虚线
          'line-dasharray': [
            'case',
            ['==', ['get', 'lineType'], 'dashed'],
            ['literal', [1, 4]],
            ['literal', []],
          ],
        }
      } else if (type === 'symbol') {
        layout = {
          'icon-image': ['get', 'icon'],
          'icon-anchor': 'center',
          'icon-size': ['case', ['has', 'iconSize'], ['get', 'iconSize'], 0.4],
          'icon-rotate': ['get', 'rotation'],
          'icon-allow-overlap': true,
        }
      } else if (type === 'fill') {
        layout = {
          visibility: 'visible',
        }
        paint = {
          // 面填充色，优先使用 feature.properties.color
          'fill-color': ['get', 'color'],
          // 填充透明度，存在 opacity 属性时使用，否则默认 1
          'fill-opacity': ['case', ['has', 'opacity'], ['get', 'opacity'], 1],
          // 面边线颜色，存在 lineColor 时使用，否则回退到黑色
          'fill-outline-color': ['case', ['has', 'lineColor'], ['get', 'lineColor'], '#000'],
        }
      }
      /* 根据数据结构绘制地图元素*/
      const layerReturn = addGeoJsonLayer(geoDataItem.data, {
        id: geoDataItem.sbid,
        type: geoDataItem.type,
        layout,
        paint,
      })
      layerReturns.push(layerReturn)
    })
    return {
      layerReturns,
      destory: () => {
        layerReturns?.forEach((layerReturn) => {
          layerReturn?.destoryLayer()
        })
      },
    }
  }
  return {
    getDistrict,
    addbackgroundLayer,
    addPolygonLayer,
    addLineLayer,
    addPolygonSource,
    addLineSource,
    addGeoJsonLayers,
  }
}
