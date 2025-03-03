export const useVectorLayer = (map) => {
    const sgMapInstance = toValue(map)
    console.log(map, sgMapInstance);

    /** 
     * @description 业务层-添加行政区域边界、面、点图层
     * @param {object} source -行政区域图层初始化
     * @param {array} source.sub_districts -Array行政区域下辖县市镇的坐标数据
     * @param {Boolean} isDark -是否开启黑色背景，可选值：true|false 默认不开启
     * @returns {object} tileLayers -返回创建的点线面图层对象
     */
    const addtileLayers = (source, isDark = false) => {
        const bgLayer = isDark && addbackgroundLayer() || null
        console.log(source, "<======source");
        source.lineWidth = 4;
        source.lineColor = '#fff'
        source.sub_districts.map(r => {
            r.color = '#68AFB0'
            r.opacity = 1
            r.textColor = '#111'
            r.lineColor = '#8ccdc4'
            r.lineWidth = 2
        })
        if (source.level === 'county') {
            map.setLayoutProperty(bgLayer.id, "visibility", "none")
            source.lineWidth = 3;
            source.lineColor = '#0055ff'
            source.sub_districts.map(r => {
                r.color = '#e1edf6'
                r.opacity = 0.4
                // r.bgColor = '#57a3a5'
                // r.textColor = '#fff'
                r.lineColor = '#56cbc6'
                r.lineWidth = 2
            })
        }
        if (!map.getSource("symbol")) {
            map.addSource("symbol", {
                type: "geojson",
                data: source,
                cluster: true,
                clusterMaxZoom: 12, // 最大聚类层级
                clusterRadius: 100 // 聚合点半径，默认50
            })
        }
        if (!map.getSource("boundary1")) {
            map.addSource("boundary1", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
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
        });
        boundary.push(
            ...source.sub_districts.map((item) => {
                return {
                    type: "Feature",
                    geometry: item.shape,
                    properties: {
                        adcode: item.adcode,
                        bbox: item.bbox,
                        center: item.center,
                        level: item.level,
                        name: item.name,
                    },
                };
            }),
        )
        map.getSource("boundary1").setData({
            type: "FeatureCollection",
            features: boundary
        })
        console.log(map.getSource("symbol"), "symbol");
        const polygonLayer = addPolygonLayer(source)
        const numbersLayer = addPointLayer(source, {
            name: 'value',
            iconName: 'none-pic',
            id: 'symbolVal',
            color: '#fff',
            iconStyle: {},
            textStyle: {
                "text-anchor": "bottom",
                "text-offset": ["get", "offsetNum"],
            }
        },)
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
            numbersLayer
        }
        if (source.level === 'town') {
            for (let [key, {
                remove
            }] of Object.entries(tileLayers)) {
                remove()
            }
        }
        return tileLayers
    }
    const addPolygonLayer = (district, id = 'polygonLayer') => {
        const polygonSource = ref(null)
        watch(district, (newValue, oldValue) => {
            if (!newValue) return
            if (!map.value?.getLayer(id)) {
                map.value?.addLayer({
                    id,
                    type: "fill",
                    source: {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [],
                        },
                    },
                    paint: {
                        "fill-color": ["get", "color"],
                        "fill-opacity": 1
                    },
                    // paint: {
                    // 	"fill-color": ["get", "color"],
                    // 	"fill-opacity": ["get", "opacity"]
                    // },
                });
            }
            polygonSource.value = setPolygonSource(newValue, id)
        })
        console.log(map);

        return {
            polygonSource,
            id,
            layer: map.value?.getLayer(id),
            removeLayer: () => removeLayer(id)
        }
    }
    /**
         * @description 创建背景图层，背景图层需要多次控制显隐，背景图层remove为将其设置为不可见
         * @param {String} id 背景图层id
         * @returns {object}
         * @property {String} id -背景图层id，与入参id一致
         * @property {object} layer -创建后的图层对象
         * @property {Function} remove -移除背景图层（将图层设置为不可见）
         */
    const addbackgroundLayer = (id = 'bgLayer') => {
        if (!sgMapInstance.getLayer(id)) {
            sgMapInstance.addLayer({
                id,
                type: "background",
                paint: {
                    "background-color": "#000",
                    "background-opacity": 0.4,
                },
            });
        }
        return {
            id,
            layer: sgMapInstance.getLayer(id),
            remove: () => sgMapInstance.setLayoutProperty(id, "visibility", "none")
        }
    }
    const removeLayer = (id) => {
        map?.value.removeLayer(id)
        removeLayerSource(id)
    }
    const removeLayerSource = (id) => {
        map.value?.getSource(id).setData({
            type: "FeatureCollection",
            features: [],
        });
        map?.value.removeSource(id)
    }
    const setPolygonSource = (properties, layerId, level) => {
        const list = properties.sub_districts || []
        let features = []
        list.map((r) => {
            const {
                shape: geometry
            } = r
            features.push({
                type: "Feature",
                geometry,
                properties: {
                    color: '#68AFB0',
                    ...r
                },
            })
        })
        console.log(features, "面数据", layerId);
        map.value?.getSource(layerId).setData({
            type: "FeatureCollection",
            features
        });
        return list
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
                        subdistrict: [
                            1
                        ], //查询结果展示的子级。设置显示下级行政区级数（行政区级别包括：省/直辖市、市、区/县、乡镇、村5个级别）;可选值：0、1、2、3、4. 0：不返回下级行政区；1：返回下一级行政区；2：返回下两级行政区；3：返回下三级行政区；4：返回下四级行政区；
                        extension: true, // fasle:不返回行政区边界坐标点；true会返回所有级别的行政区划边界，当级别较多时数据量非常大，慎重使用
                        levels: "county,province,city,town" //"county,province,city,county,town,village" subdistrict: 2,                //需要
                    })
                    district.value = res.status === '1' && res?.data?.districts?.length && res.data.districts[
                        0] || null
                    console.log(district);
                }

            } catch (error) {

            } finally {
                console.log('无论成功与否都返回true');
                isPending.value = false
            }

        })
        return { district, isPending }
    }
    return {
        getDistrict,
        addPolygonLayer,
    }
}