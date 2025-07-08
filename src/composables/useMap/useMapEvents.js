import icons from '/public/icons/index';
export const useMapEvents = (map) => {
    return {
        /** 
         * @description 地图点击事件
         * @param {Function} callback - 点击事件回调函数，接收点击事件对象，用于处理点击到要素的情况
         * @param {Function} fn - 可选的回调函数，用于处理没有点击到任何要素的情况
         * @returns {Object} - 返回一个对象，包含一个 `destory` 方法,在需要时可以调用该方法来移除地图点击事件监听
         * @example
         * const { onMapClick } = useMapEvents(map);
         * onMapClick((e) => {
         * const {clickType } = e;
         *     // clickType 1表示单击，2表示双击
         *     console.log('地图点击事件', e);
         *    // 处理点击事件
         * }, (e) => {
         *     console.log('没有点击到任何要素', e  
         *   // 处理没有点击到要素的情况    
         * });
         *
          */
        onMapClick: (callback, fn) => {
            console.log('地图点击事件');
            let clickCount = 0; // 用于记录点击次数
            const clickHandler = function (e) {
                e.features = map?.value?.queryRenderedFeatures([e.point.x, e.point.y])
                clickCount++
                if (clickCount === 1) {
                    /* 此处设置500毫秒延迟，为了区分双击，因为思极api中没有双击事件 */
                    setTimeout(function () {
                        if (e.features.length) {
                            if (clickCount === 1) {
                                /**
                                 * @description 单击事件回调
                                 * @param {Object} e - 点击事件对象，包含点击位置、点击类型等信息
                                 * @param {number} e.clickType - 点击类型，1表示单击，2表示双击
                                  */
                                callback({
                                    ...e,
                                    clickType: 1
                                })
                            } else if (clickCount === 2) {
                                callback({
                                    ...e,
                                    clickType: 2
                                })
                            }
                        } else {
                            /**
                             * @description 没有点击到任何要素的回调
                             * @param {Object} e - 点击事件对象，包含点击位置、点击类型等信息
                             */
                            fn && fn({
                                ...e
                            })
                        }
                        clickCount = 0; // 重置点击次数
                    }, 500);
                }
            };
            map?.value?.on("click", clickHandler);
            onUnmounted(() => {
                map?.value?.off('click', clickHandler)
            })
            return {
                destory: () => map?.value?.off('click', clickHandler)
            }
        },
        styleimagemissing: (e) => {
            console.log('图片缺失回调', e);
            map?.value?.on("styleimagemissing", (e) => {
                let imageid = e.id;
                if (!map.value.hasImage(imageid)) {
                    const imageObj = icons.filter((item) => item.name == imageid)[0];
                    if (!imageObj) return; // 资源库里没有资源 不加载
                    console.log(process.env.NODE_ENV, imageObj);

                    let resourceBaseurl = process.env.NODE_ENV == 'development' ?
                        "/public/icons/" :
                        "./icons/"
                    let url = resourceBaseurl + imageObj.url
                    map?.value.loadImage(url, (e, img) => {
                        if (!map.value.hasImage(imageid)) {
                            map.value.addImage(imageObj.name, img);
                            setTimeout(() => {
                                for (let key in map.value.style._sourceCaches) {
                                    let cache = map.value.style._sourceCaches[key];
                                    if (cache._source.type == "raster") continue;
                                    cache.reload();
                                }
                            }, 500);
                        }
                    });
                }
            });
        },
        mousemove: (e) => {
            console.log('地图鼠标移动事件', e);
        },
        zoom: (e) => {
            console.log('地图缩放事件', e);
        }
    };
}