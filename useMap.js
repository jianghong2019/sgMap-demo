import {
	icons
} from "@/static/icons/icons.js"
import { point,featureCollection } from '@turf/turf';
import { bbox } from "@turf/bbox";
let convertTask = null;
export function normalizeTo2DArray(data) {
	// 检查是否是单点 [x, y]
	if (Array.isArray(data) && data.length === 2 && typeof data[0] === 'number') {
		return [data];
	}
	// 检查是否已经是二维数组 [[x1, y1], [x2, y2], ...]
	else if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length === 2) {
		return data;
	}
	// 其他情况（如数据格式错误）返回空数组或抛出错误
	else {
		return []; // 或 throw new Error("Invalid coordinate format");
	}
}
/* 地图初始化后的实例 */
export let sgMapInstance = null
export const useMapInit = () => {
	/**
	 * @description 初始化地图，暴露初始化后的回调、地图实例
	 * @param el {String} 地图初始化容器的id，不需要传`#`
	 * @param mapconfig {object} 地图初始化参数如：中心坐标、缩放层级、矢量源
	 * @param callback {Function} 回调初始化地图完成之后的回调
	 * @returns void
	 * @example 
	 const mapconfig = {
			srcSdk: "https://map.sgcc.com.cn/maps?v=3.0.0",
			appkey: "4b9985a37eef391f9ff32c696819f605",
			appsecret: "ee7b92c92455300896b732377a662077",
			style: "aegis://styles/aegis/Streets-v2",
			zoom: 5.6,
			center: [116.06958776337888, 27.451715986601002]
		}
	 initMap('container',this.mapconfig,(map)=>{
					this.$emit("load", map);
					this.$hideLoading()
				})
				
  */
	const initMap = (el, mapconfig, callback) => {
		// 思极地图认证
		SGMap.tokenTask.login(mapconfig.appkey, mapconfig.appsecret).then(() => {
			console.log(SGMap);
			SGMap.plugin([
				"SGMap.DistrictPlusTask",
				"SGMap.GeolocationTask", 
				"SGMap.DirectionsTask",
				"SGMap.ConvertTask"
			]).then(function(res) {
				window.districtPlusTask = new SGMap.DistrictPlusTask(); // 查地图边界接口
				window.directionsTask = new SGMap.DirectionsTask(); //路径规划插件
				convertTask = new SGMap.ConvertTask(); // 坐标转换插件
				// 创建地图实例
				sgMapInstance = new SGMap.Map({
					// 地图绑定的DOM元素ID
					container: el,
					// 地图样式
					style: mapconfig.style,
					// 默认缩放层级
					zoom: mapconfig.zoom,
					// 地图中心点
					center: mapconfig.center,
					// 地图默认字体
					localIdeographFontFamily: "Microsoft YoHei",
					doubleClickZoom: false, // 禁止双击放大
					scrollZoom: true, // 禁止鼠标滚轮缩放
					touchZoomRotate: true, // 禁止触摸缩放
					preserveDrawingBuffer: true, //如果设置成true，地图画布可以通过 map.getCanvas().toDataURL()输出PNG图片，默认false效率更优
				});
				sgMapInstance.on('load', async () => {

					// initTool()
					// showLayer()
					// 加载专题数据与边界数据`
					// await initThematic()
					callback(sgMapInstance)
					window.geolocationTask = new SGMap.GeolocationTask(); // 地图定位
					mapStyleimagemissing(sgMapInstance)
				})
			});

		});
	}

	return {
		initMap
	}
}
// 监听地图图元样式加载
export const mapStyleimagemissing = (map) => {
	map.on("styleimagemissing", (e) => {
		let imageid = e.id;
		if (!map.hasImage(imageid)) {
			const imageObj = icons.filter((item) => item.name == imageid)[0];
			if (!imageObj) return; // 资源库里没有资源 不加载
			let resourceBaseurl = process.env.NODE_ENV == 'development' ?
				"/static/icons/" :
				"./static/icons/"
			let url = resourceBaseurl + imageObj.url
			map.loadImage(url, (e, img) => {
				if (!map.hasImage(imageid)) {
					map.addImage(imageObj.name, img);
					setTimeout(() => {
						for (let key in map.style._sourceCaches) {
							let cache = map.style._sourceCaches[key];
							if (cache._source.type == "raster") continue;
							cache.reload();
						}
					}, 500);
				}
			});
		}
	});
}
export const useMapTools = (map) => {
	const addVectorLayer = () => {

	}
	const addLineLayer = (source, id = 'lineLayer') => {
		if (!map.getLayer(id)) {
			const lineLayer = map.addLayer({
				id,
				type: "line",
				source: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [],
					},
				},
				layout: {
					"line-cap": "round",
					"line-join": "round",
				},
				paint: {
					"line-color": ["get", "lineColor"],
					"line-width": 2,
				},
			});
		}
		setLineSource(source, id)
		return {
			id,
			layer: map.getLayer(id),
			// remove: () => removeLayer(id)
			remove: () => removeLayerSource(id)
		}
	}
	const setLineSource = (source, layerId) => {
		const features = []
		features.push({
			type: "Feature",
			geometry: {
				type: "LineString",
				coordinates: [],
			},
			properties: {
				...source
			},
		})
		map.getSource(layerId).setData({
			type: "FeatureCollection",
			features,
		});
	}
	const addGeoJsonLayer = async (geojson, options = {}) => {
		/* type支持类型：fill, line, symbol, circle, esymbol, eline, heatmap, fill-extrusion, raster, hillshade, background */
		const {
			id = 'geoJsonLayer', type = 'circle', layout, paint
		} = options
		// 处理geojson中的所有坐标，支持二维或三维数组
		const convertedGeojson = await convertGeoJsonCoordinates(geojson)
		console.log("调用方法偏移处理后的geojson===>",convertedGeojson);			
		if (!map?.getLayer(id)) {
			const data = {
				id,
				type,
				source: {
					type: "geojson",
					data: convertedGeojson,
				},
				layout,
				paint
			}
			console.log("addGeoJsonLayer的数据===》",data,"图层的goeJson===>",geojson);
			map?.addLayer(data);
		}
		return {
			id,
			layer: map?.getLayer(id),
			destoryLayer: () => destoryLayer(id, false)
		}
	}
	const fitBounds = async (coordinates) => {
		const arr = coordinates?.map(coordinate => point(coordinate))
		const points = featureCollection(arr);
		// 计算点的外接矩形
		const box = bbox(points);
		console.log(box);
		const convertedBox = await convertTask.convertCoord([
			[box[0], box[1]],
			[box[2], box[3]]
		], { from: 1 });
		console.log("偏移处理后的地图视野适配坐标convertedBox：",convertedBox);
		// 适配地图视野
		map.fitBounds(convertedBox, {
			padding: 50,
			maxZoom: 16,
			duration: 800
		});
		function updateZoomRange() {
		  const center = map.getCenter();
		  const newZoom = map.getZoom();
		  // 更新约束（示例：限制在±0.5级）
		  map.setMinZoom(newZoom - 0.2);
		  map.setMaxZoom(newZoom + 0.1);
		}
		// setTimeout(()=>{
		// 	updateZoomRange();
		// },1000)
	}
	const addPulsingDot = async (id,coordinates) => {
		function loadPulsingDot() {
			var size = 140;
			var pulsingDot = {
				width: size,
				height: size,
				data: new Uint8Array(size * size * 4),

				onAdd: function() {
					var canvas = document.createElement("canvas");
					canvas.width = this.width;
					canvas.height = this.height;
					this.context = canvas.getContext("2d");
				},

				render: function() {
					var duration = 1000;
					var t = (performance.now() % duration) / duration;

					var radius = (size / 2) * 0.3;
					var outerRadius = (size / 2) * 0.7 * t + radius;
					var context = this.context;

					// 画圆
					context.clearRect(0, 0, this.width, this.height);
					context.beginPath();
					context.arc(
						this.width / 2,
						this.height / 2,
						outerRadius,
						0,
						Math.PI * 2
					);
					context.fillStyle = "rgba(0, 155, 131," + (1 - t) + ")";
					context.fill();

					// 画线
					context.beginPath();
					context.arc(
						this.width / 2,
						this.height / 2,
						radius,
						0,
						Math.PI * 2
					);
					context.fillStyle = "rgba(0, 155, 131, .2)";
					context.strokeStyle = "rgba(0, 155, 131, 0.2)";
					context.lineWidth = 2 + 4 * (1 - t);
					context.fill();
					context.stroke();

					this.data = context.getImageData(
						0,
						0,
						this.width,
						this.height
					).data;
					map.triggerRepaint();

					return true;
				}
			};
			map.addImage("pulsing-dot", pulsingDot, {
				pixelRatio: 2
			});
		}
		loadPulsingDot()
		const convertCoordinates = await convertTask.convertCoord([coordinates], {from: 1})
		console.log(convertCoordinates);
		
		map.addLayer({
			id,
			type: "symbol",
			source: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [{
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates:convertCoordinates[0] ?? coordinates
						}
					}]
				}
			},
			layout: {
				"icon-image": "pulsing-dot",
				"icon-allow-overlap":true
			}
		});
	}
	/**  
	 * @description 暴露图上点击事件，地图无法处理双击事件，采用500ms方式处理短时单击为双击
	 * @param {Function} callback - 点击后的回调函数，返回值为当前要素和点击类型组成的对象{event,clickType}
	 * @type {Number} clickType -1单击.2双击
	 * @returns {object} 地图点击事件句柄-返回值
	 * @property {Function} destory 销毁挂载的地图点击事件
	 */
	let clickCount = 0
	const onMapClick = (callback, fn) => {
		const clickHandler = function(e) {
			e.features = map.queryRenderedFeatures([e.point.x, e.point.y])
			clickCount++
			if (clickCount === 1) {
				setTimeout(function() {
					if (e.features.length) {
						if (clickCount === 1) {
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
						fn && fn({
							...e
						})
					}
					clickCount = 0; // 重置点击次数
				}, 500);
			}
		};
		map.on("click", clickHandler);
		return {
			destory: () => map.off('click', clickHandler)
		}
	}

	return {
		addVectorLayer,
		addLineLayer,
		addGeoJsonLayer,
		addPulsingDot,
		fitBounds,
		onMapClick
	}
}
/**
 * 批量转换GeoJSON中的所有坐标（递归支持多层嵌套）
 * @param {Object} geojson - GeoJSON对象
 * @param {Object} [options] - 转换参数，如{from:1}
 * @returns {Promise<Object>} 转换后的GeoJSON对象
 */
export async function convertGeoJsonCoordinates(geojson, options = {from: 1}) {
	// 递归转换坐标
	async function convertCoordinates(coords) {
		if (typeof coords[0] === 'number') {
			const result = await convertTask.convertCoord([coords], options);
			return result[0] || coords;
		} else {
			return Promise.all(coords.map(convertCoordinates));
		}
	}
	if (geojson?.features) {
		await Promise.all(
			geojson.features.map(async (feature) => {
				if (feature.geometry && feature.geometry.coordinates) {
					feature.geometry.coordinates = await convertCoordinates(feature.geometry.coordinates);
				}
			})
		);
	}
	return geojson;
}