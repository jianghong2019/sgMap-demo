import {
	icons
} from "@/static/icons/scene-work/icons.js"
import utils from "../../tool/utils.js"
import store from '@/store/index.js'
export const mapTools = (map) => {
	// 业务图层
	const mapDataSource = {
		orderList: "pointDataSource_WorkOrder", //作业分布--工单总数
		planList: "pointDataSource_Plan_Homework", // 作业分布--作业计划总数
		ticketList: "pointDataSource_Work_Ticket", //作业分布--工作票总数
		personList: "pointDataSource_MainBusiness", //人员分布
		violationList: "pointDataSource_Illegal", //违章分布
	}
	let pointSourceName //使用时的数据源名称
	// 清空业务图层数据
	const clearLayerData = () => {
		let data = Object.values(mapDataSource)
		data.forEach((item) => {
			if (map.getSource(item)) {
				map.getSource(item).setData({
					type: "FeatureCollection",
					features: [],
				});
			}
		});
	}
	// 创建业务所需聚合图层
	const setAggregateLayer = () => {
		if (map.getLayer("pointStartLayer")) return
		// 路径-----------------------创建图层开始
		// 路径-起点图标
		map.addLayer({
			id: "pointStartLayer",
			type: "symbol",
			source: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": []
						}
					}, ]
				}
			},
			layout: {
				"icon-image": "people-start",
				"icon-size": 0.4,
				// 设置图片图标剧中显示
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-optional": true,
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 14,
				// "icon-offset": [0, 50],
				"text-offset": [0, 0],
			}
		});
		// 路径-终点图标
		map.addLayer({
			id: "pointEndLayer",
			type: "symbol",
			source: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": []
						}
					}, ]
				}
			},
			layout: {
				"icon-image": "",
				"icon-size": 0.4,
				// 设置图片图标剧中显示
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-optional": true,
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 14,
				// "icon-offset": [0, 150],
				"text-offset": [0, 0]
			}
		});
		//路径
		map.addLayer({
			id: "navigation-line",
			type: "line",
			source: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [{
						type: "Feature",
						geometry: {
							type: "LineString",
							coordinates: [
								[]
							] //两层数组[[0,0],[0,0]]
						}
					}]
				}
			},
			layout: {
				"line-cap": "round",
				"line-join": "round"
			},
			paint: {
				"line-color": "#1e98ff",
				"line-width": 5,
				"line-opacity": 0.8
			}
		});
		// 路劲-------------创建图层结束
		// 作业分布-----------------------------开始创建图层
		// 工单总数-数据源
		map.addSource("pointDataSource_WorkOrder", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: []
			},
			cluster: true,
			clusterMaxZoom: 22, // 最大聚类层级  
			clusterRadius: 25, // 聚合点半径，默认50
			maxzoom: 23, // 默认值 18
			generateId: true,
		})
		// 工单总数-聚合图层
		map.addLayer({
			id: "clusters_WorkOrder",
			type: "symbol",
			source: "pointDataSource_WorkOrder",
			generateId: true,
			filter: ["has", "point_count"],
			layout: {
				"icon-image": [
					"case",
					["!=", ["typeof", ["get", "en"]], "number"],
					"order-jh",
					["case", [">", ["get", "en"], 0], "order-jh", [">", ["get", "wn"],
							0
						],
						"order-jh",
						"order-jh"
					],
				],
				"icon-anchor": "bottom",
				"icon-size": [
					"case",
					["all", [">=", ["get", "point_count"], 0],
						["<", ["get", "point_count"], 100]
					],
					0.45,
					["all", [">=", ["get", "point_count"], 100],
						["<", ["get", "point_count"], 1000]
					],
					0.6,
					["all", [">=", ["get", "point_count"], 1000],
						["<", ["get", "point_count"], 10000]
					],
					.7,
					.9,
				],
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "point_count"], 10000],
					["get", "point_count"],
					[
						"concat",
						[
							"number-format",
							["/", ["get", "point_count"], 10000],
							{
								"max-fraction-digits": 1,
							},
						],
						"万",
					],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 15,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				"text-offset": [0, -1.5],
			},
			paint: {
				"text-color": "#fff",
			},
		});
		// 工单总数-单点图层
		map.addLayer({
			id: "clusters_has_WorkOrder",
			type: "symbol",
			source: "pointDataSource_WorkOrder",
			filter: ["!has", "point_count"],
			generateId: true,
			// maxzoom: 9,order_1
			layout: {
				"icon-image": [
					"case",
					["==", ["get", "icon"], "order_1"],
					"order_1",
					["==", ["get", "icon"], "order_2"],
					"order_2",
					"order",
				],
				"icon-anchor": "bottom",
				"icon-size": [
					"case",
					["has", "_iconSize"],
					["get", "_iconSize"],
					0.4
				],
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "dataNum"], 10000],
					["get", "dataNum"],
					["concat", ["number-format", ["/", ["get", "dataNum"], 10000], {
						"max-fraction-digits": 1
					}], "万"],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 8,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				// "text-offset": [1, 20],
				"icon-offset": [0, 20]
			},
			paint: {
				"text-color": "#fff",
				"icon-opacity": [
					"case",
					["has", "_icon_opacity"],
					["get", "_icon_opacity"],
					1
				],
			},
		});
		// 计划作业-数据源 Plan_Homework
		map.addSource("pointDataSource_Plan_Homework", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: []
			},
			cluster: true,
			clusterMaxZoom: 22, // 最大聚类层级  
			clusterRadius: 25, // 聚合点半径，默认50
			maxzoom: 23, // 默认值 18
			generateId: true,
		})
		//计划作业-聚合图层
		map.addLayer({
			id: "clusters_Plan_Homework",
			type: "symbol",
			source: "pointDataSource_Plan_Homework",
			filter: ["has", "point_count"],
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["!=", ["typeof", ["get", "en"]], "number"],
					"plan-jh",
					["case", [">", ["get", "en"], 0], "plan-jh", [">", ["get", "wn"], 0],
						"plan-jh",
						"plan-jh"
					],
				],
				"icon-size": [
					"case",
					["all", [">=", ["get", "point_count"], 0],
						["<", ["get", "point_count"], 100]
					],
					0.45,
					["all", [">=", ["get", "point_count"], 100],
						["<", ["get", "point_count"], 1000]
					],
					0.6,
					["all", [">=", ["get", "point_count"], 1000],
						["<", ["get", "point_count"], 10000]
					],
					.7,
					.9,
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "point_count"], 10000],
					["get", "point_count"],
					[
						"concat",
						[
							"number-format",
							["/", ["get", "point_count"], 10000],
							{
								"max-fraction-digits": 1,
							},
						],
						"万",
					],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 15,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				"text-offset": [0, -1.5],
			},
			paint: {
				"text-color": "#fff",

			},
		});
		//计划作业-单点图层
		map.addLayer({
			id: "clusters_has_Plan_Homework",
			type: "symbol",
			source: "pointDataSource_Plan_Homework",
			filter: ["!has", "point_count"],
			// maxzoom: 9,
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["any",
						["==", ["get", "planStatus"], "01"],
						["==", ["get", "planStatus"], "02"],
						["==", ["get", "planStatus"], "03"]
					],
					"plan_work",
					["any",
						["==", ["get", "wtStatus"], "01"],
						["==", ["get", "wtStatus"], "02"],
						["==", ["get", "wtStatus"], "03"]
					],
					"plan",
					"plan"
				],
				"icon-size": [
					"case",
					["has", "_iconSize"],
					["get", "_iconSize"],
					0.4
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "dataNum"], 10000],
					["get", "dataNum"],
					["concat", ["number-format", ["/", ["get", "dataNum"], 10000], {
						"max-fraction-digits": 1
					}], "万"],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 8,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				// "text-offset": [1, -1],
			},
			paint: {
				"text-color": "#fff",
				"icon-opacity": [
					"case",
					["has", "_icon_opacity"],
					["get", "_icon_opacity"],
					1
				],
			},
		});
		//工作票-数据源 Work_Ticket
		map.addSource("pointDataSource_Work_Ticket", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: []
			},
			cluster: true,
			clusterMaxZoom: 22, // 最大聚类层级  
			clusterRadius: 25, // 聚合点半径，默认50
			maxzoom: 23, // 默认值 18
			generateId: true,
		})
		// 工作票-聚合图层
		map.addLayer({
			id: "clusters_Work_Ticket",
			type: "symbol",
			source: "pointDataSource_Work_Ticket",
			filter: ["has", "point_count"],
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["!=", ["typeof", ["get", "en"]], "number"],
					"work-jh",
					["case", [">", ["get", "en"], 0], "work-jh", [">", ["get", "wn"], 0],
						"work-jh",
						"work-jh"
					],
				],
				"icon-size": [
					"case",
					["all", [">=", ["get", "point_count"], 0],
						["<", ["get", "point_count"], 100]
					],
					0.45,
					["all", [">=", ["get", "point_count"], 100],
						["<", ["get", "point_count"], 1000]
					],
					0.6,
					["all", [">=", ["get", "point_count"], 1000],
						["<", ["get", "point_count"], 10000]
					],
					.7,
					.9,
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "point_count"], 10000],
					["get", "point_count"],
					[
						"concat",
						[
							"number-format",
							["/", ["get", "point_count"], 10000],
							{
								"max-fraction-digits": 1,
							},
						],
						"万",
					],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 15,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				"text-offset": [0, -1.5],
			},
			paint: {
				"text-color": "#fff",

			},
		});
		// 工作票-单点图层
		map.addLayer({
			id: "clusters_has_Work_Ticket",
			type: "symbol",
			source: "pointDataSource_Work_Ticket",
			filter: ["!has", "point_count"],
			generateId: true,
			// maxzoom: 9,
			layout: {
				"icon-image": [
					"case",
					["==", ["get", "wtStatus"], "04"],
					"work",
					["==", ["get", "wtStatus"], "05"],
					"work-end",
					"work",
				],
				"icon-size": [
					"case",
					["has", "_iconSize"],
					["get", "_iconSize"],
					0.4
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "dataNum"], 10000],
					["get", "dataNum"],
					["concat", ["number-format", ["/", ["get", "dataNum"], 10000], {
						"max-fraction-digits": 1
					}], "万"],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 8,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				// "text-offset": [1, -1],
			},
			paint: {
				"text-color": "#fff",
				"icon-opacity": [
					"case",
					["has", "_icon_opacity"],
					["get", "_icon_opacity"],
					1
				],
			},
		});
		// 作业分布-----------------------------创建图层结束

		// 人员分布-----------------------------创建图层开始
		// 主业人员-数据源---MainBusiness
		map.addSource("pointDataSource_MainBusiness", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: []
			},
			cluster: true,
			clusterMaxZoom: 22, // 最大聚类层级  
			clusterRadius: 25, // 聚合点半径，默认50
			maxzoom: 23, // 默认值 18
			generateId: true,
		})
		// 主业人员-聚合图层
		map.addLayer({
			id: "clusters_MainBusiness",
			type: "symbol",
			source: "pointDataSource_MainBusiness",
			filter: ["has", "point_count"],
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["!=", ["typeof", ["get", "en"]], "number"],
					"people-jh",
					["case", [">", ["get", "en"], 0], "people-jh", [">", ["get", "wn"],
							0
						],
						"people-jh",
						"people-jh"
					],
				],
				"icon-size": [
					"case",
					["all", [">=", ["get", "point_count"], 0],
						["<", ["get", "point_count"], 100]
					],
					0.45,
					["all", [">=", ["get", "point_count"], 100],
						["<", ["get", "point_count"], 1000]
					],
					0.6,
					["all", [">=", ["get", "point_count"], 1000],
						["<", ["get", "point_count"], 10000]
					],
					.7,
					.9,
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "point_count"], 10000],
					["get", "point_count"],
					[
						"concat",
						[
							"number-format",
							["/", ["get", "point_count"], 10000],
							{
								"max-fraction-digits": 1,
							},
						],
						"万",
					],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 15,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				"text-offset": [0, -1.5],
			},
			paint: {
				"text-color": "#fff",

			},
		});
		// 主业人员-单点图层
		map.addLayer({
			id: "clusters_has_MainBusiness",
			type: "symbol",
			source: "pointDataSource_MainBusiness",
			filter: ["!has", "point_count"],
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["==", ["get", "status"], 0],
					"people-wb-offline",
					["==", ["get", "status"], 1],
					"people-wb-online",
					["==", ["get", "status"], 2],
					"people-zy-offline",
					["==", ["get", "status"], 3],
					"people-zy-online",
					"people-wb-offline",
				],
				"icon-size": [
					"case",
					["has", "_iconSize"],
					["get", "_iconSize"],
					0.4
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "dataNum"], 10000],
					["get", "dataNum"],
					["concat", ["number-format", ["/", ["get", "dataNum"], 10000], {
						"max-fraction-digits": 1
					}], "万"],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 8,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				// "text-offset": [1, -1],
			},
			paint: {
				"text-color": "#fff",
				"icon-opacity": [
					"case",
					["has", "_icon_opacity"],
					["get", "_icon_opacity"],
					1
				],
			},
		});
		// 人员分布-----------------------------创建图层结束


		// 违章分布-----------------------------创建图层开始
		// 违章分布--数据源--Illegal
		map.addSource("pointDataSource_Illegal", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: []
			},
			cluster: true,
			clusterMaxZoom: 22, // 最大聚类层级  
			clusterRadius: 25, // 聚合点半径，默认50
			maxzoom: 23, // 默认值 18
			generateId: true,
		})
		// 违章分布-聚合图层
		map.addLayer({
			id: "clusters_Illegal",
			type: "symbol",
			source: "pointDataSource_Illegal",
			filter: ["has", "point_count"],
			generateId: true,
			layout: {
				"icon-image": [
					"case",
					["!=", ["typeof", ["get", "en"]], "number"],
					"wz-jh",
					["case", [">", ["get", "en"], 0], "wz-jh", [">", ["get", "wn"],
							0
						],
						"wz-jh",
						"wz-jh"
					],
				],
				"icon-size": [
					"case",
					["all", [">=", ["get", "point_count"], 0],
						["<", ["get", "point_count"], 100]
					],
					0.45,
					["all", [">=", ["get", "point_count"], 100],
						["<", ["get", "point_count"], 1000]
					],
					0.6,
					["all", [">=", ["get", "point_count"], 1000],
						["<", ["get", "point_count"], 10000]
					],
					.7,
					.9,
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "point_count"], 10000],
					["get", "point_count"],
					[
						"concat",
						[
							"number-format",
							["/", ["get", "point_count"], 10000],
							{
								"max-fraction-digits": 1,
							},
						],
						"万",
					],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 15,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				"text-offset": [0, -1.5],
			},
			paint: {
				"text-color": "#fff",

			},
		});
		// 违章分布-单点图层
		map.addLayer({
			id: "clusters_has_Illegal",
			type: "symbol",
			source: "pointDataSource_Illegal",
			filter: ["!has", "point_count"],
			generateId: true,
			// maxzoom: 9,
			layout: {
				"icon-image": [
					"case",
					["==", ["get", "status"], 0],
					"wz-gl-yb",
					["==", ["get", "status"], 1],
					"wz-gl-1",
					["==", ["get", "status"], 2],
					"wz-gl-2",
					["==", ["get", "status"], 3],
					"wz-gl",
					["==", ["get", "status"], 4],
					"wz-xw-yb",
					["==", ["get", "status"], 5],
					"wz-xw-1",
					["==", ["get", "status"], 6],
					"wz-xw-2",
					["==", ["get", "status"], 7],
					"wz-xw",
					["==", ["get", "status"], 8],
					"wz-sb-yb",
					["==", ["get", "status"], 9],
					"wz-sb-1",
					["==", ["get", "status"], 10],
					"wz-sb-2",
					["==", ["get", "status"], 11],
					"wz-sb",
					"wz-gl-yb",
				],
				"icon-size": [
					"case",
					["has", "_iconSize"],
					["get", "_iconSize"],
					0.4
				],
				"icon-anchor": "bottom",
				// "icon-offset": ["get", "offsetFocus"],
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-field": [
					"case",
					["<", ["get", "dataNum"], 10000],
					["get", "dataNum"],
					["concat", ["number-format", ["/", ["get", "dataNum"], 10000], {
						"max-fraction-digits": 1
					}], "万"],
				],
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 8,
				"text-anchor": "center",
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				//控制位置
				//"fill-translate":[1,-1],
				// "text-offset": [1, -1],
			},
			paint: {
				"text-color": "#fff",
				"icon-opacity": [
					"case",
					["has", "_icon_opacity"],
					["get", "_icon_opacity"],
					1
				],
			},
		});
		// 违章分布-----------------------------创建图层结束


		// 监听地图图元样式加载
		map.loadImage(
			"https://map.sgcc.com.cn/products/js-sdk/v3/assets/images/roadFragment.jpg",
			function(error, image) {
				//添加图片到map，可以设置图片id
				if(map.hasImage("route-img")) return
				map.addImage("route-img", image);
			}
		);

		// -----------------》业务点击放大图层
		map.addLayer({
			id: "whiteBackground",
			type: "symbol",
			source: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": []
						}
					}, ]
				}
			},
			layout: {
				"icon-image": "click_bg",
				"icon-size": 0.5,
				// 设置图片图标剧中显示
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-allow-overlap": true,
				"text-optional": true,
				"text-font": ["Microsoft YaHei Regular"],
				"text-size": 14,
				// "icon-offset": [0, 150],
				"text-offset": [0, 0],
				"icon-offset": [0, 5]
			}
		});
		mapStyleimagemissing()
	}
	// 数据传入后聚合点位的渲染
	/**
	 * @description 数据传入后聚合点位的渲染
	 * @data  传入的数据为的对象，键为数据的类型，值是数据数组
	 * @status 默认为false ，传true时默认放大第一个类型的第一条数据的图元
	 */
	const addPoint = (data = {}, status = false) => {
		// 先清空业务图层数据
		clearLayerData()
		if (map.getSource("whiteBackground")) {
			map.getSource("whiteBackground").setData({
				type: "FeatureCollection",
				features: []
			})
		}
		// 判断传入的数据不为空
		if (data != null && Object.keys(data).length > 0) {
			// 获取业务图层的类型
			let keyData = Object.keys(data)
			// 获取业务图层的数据源
			let valueData = Object.values(data);
			// 整理传入的数据--整理数据格式
			let pointData = valueData.map((item, index) => {
				return setPointData(item, keyData[index], index, status)
			})
			let sourceData = []
			// 根据传入的数据类型，将用到的数据源id存储到数组中
			for (let key in data) {
				sourceData.push(mapDataSource[key]);
			}
			let key1 = keyData[0]
			let zoom = map.getZoom()
			// 默认第一个类型图元放大-----并以其经纬度设为地图中心点
			if (data[key1].length > 0) {
				let jd = data[key1][0].lng || data[key1][0].longitude
				let wd = data[key1][0].lat || data[key1][0].latitude
				map.easeTo({
					center: [jd, wd],
					zoom: 15,
				})
			}
			// 循环便利要用到的数据源，并将数据更新至图层
			sourceData.forEach((item, index) => {
				if (map.getSource(item)) {
					map.getSource(item).setData({
						type: "FeatureCollection",
						features: pointData[index]
					})
					// 一个类型一条数据  默认点位居中显示 -- 地图层级>15则调整到15，<15不做处理
					if (keyData.length == 1 && valueData[0].length == 1) {
						if (zoom > 15) {
							zoom = 15
						}
						map.easeTo({
							center: pointData[index][0].geometry.coordinates,
							zoom: zoom,
						})
					}
				} else {
					console.log("获取图层数据源失败");
				}
			})
		} else {
			console.log("没有数据或者数据为null");
		}

	}
	// 监听地图图元样式加载
	const mapStyleimagemissing = () => {
		map.on("styleimagemissing", (e) => {
			let imageid = e.id;
			if (!map.hasImage(imageid)) {
				const imageObj = icons.filter((item) => item.name == imageid)[0];
				if (!imageObj) return; // 资源库里没有资源 不加载
				let resourceBaseurl = process.env.NODE_ENV == 'development' ?
					"/static/icons/scene-work/" :
					"./static/icons/scene-work/"
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
	let iconStatus = false
	// 所有单点图元用到的图层
	let layerData = ["clusters_has_WorkOrder", "clusters_has_Plan_Homework",
		"clusters_has_Work_Ticket", "clusters_has_MainBusiness", "clusters_has_Illegal"
	]
	// 监听地图的点击事件---处理点击单点图与集合图
	const MonitorClicksFn = (callback) => {
		async function MonitorClicks(e) {
			const { topicType } = store.state.curTheme
			if(topicType !== "04") return
			let features = map.queryRenderedFeatures([e.point.x, e.point.y])[0]
			let zoom = map.getZoom()
			let pointArr
			// 判断是单点图元
			console.log(features, features?.layer.id, "features?.layer.id");
			console.log(features, "features?.layer.id");
			console.log(topicType , "topicType_______1231")
			if(!features){
				console.log(topicType , "点击空白处")
				return
			}
			features.properties = utils.parseObject(features.properties)
			if (!features?.properties.cluster && !features?.properties.cluster_id && features?.layer.id !=
				"polygonLayer") {
				// map.setLayoutProperty(features.layer.id, 'icon-size', 1);
				// 业务数据聚合点
				if (layerData.includes(features?.layer.id)) {
					let lng = features.properties.longitude || features.properties.lng
					let lat = features.properties.latitude || features.properties.lat
					if (zoom < 15) {
						map.easeTo({
							center: [lng, lat],
							zoom: 15,
						})
					} else {
						map.easeTo({
							center: [lng, lat],
							zoom
						})
					}
					//                features.properties && Object.keys(features.properties).map(r=>{
					// 	if(features.properties[r]==='null'){
					// 		features.properties[r]=null
					// 	}
					// })
					pointArr = [features.properties]
					callback({
						pointArr,
						clickType: "dd"
					})
					// .serialize()
					// normalGraphicElements()
					// enlargeGraphicElements(features)
					setWhiteBackground(features.properties)

				} else {
					// console.log("点击的单点不是作业、人员、违章业务点");
					map.getSource("whiteBackground").setData({
						type: "FeatureCollection",
						features: []
					})
				}
			} else if (features?.properties.cluster && features?.properties.cluster_id) {
				// 判断是聚合图层的点击事件
				// 获取数据源名称
				pointSourceName = features.layer.source
				// 15 zoom
				// 聚合点这里需要做判断 zoom层级大于15的时候返回点位数据，小于15的时候放大层级
				pointArr = await findSubsetsAsync(map, [features], []);
				let lng = pointArr[0].longitude || pointArr[0].lng
				let lat = pointArr[0].latitude || pointArr[0].lat
				if (zoom >= 15) {
					// 获取聚合点下的所有数据
					callback({
						pointArr,
						clickType: "jh"
					})
					// setWhiteBackground(pointArr[0])
				} else {
					map.getSource(pointSourceName)
						.getClusterExpansionZoom(features.properties?.cluster_id, function(err,
							zooms) {
							if (err) return;
							map.easeTo({
								center: [lng, lat],
								zoom: 15,
							});
						});
					// // 聚合点 添加高亮图元
					// let obj = {
					// 	lng : e.features[0].geometry.coordinates[0],
					// 	lat : e.features[0].geometry.coordinates[1]
					// }
					// setWhiteBackground(obj)
				}

			}
		}
		map.on("click", MonitorClicks)
	}
	// 创建新的点击高亮图层，传入数据高亮 ------- 新方法
	function setWhiteBackground(data) {
		let pointData = [{
			type: "Feature",
			geometry: {
				type: "Point",
				// 经纬度精简  geo   lng   geometryLng
				coordinates: data.lng ? [data.lng * 1, data.lat * 1] : data.plng ? [data
					.plng * 1, data.plat * 1
				] : [data.longitude * 1, data.latitude * 1],
			},
			properties: setProperties(data),
		}]
		map.getSource("whiteBackground").setData({
			type: "FeatureCollection",
			features: pointData
		})
	}

	// 将所有图元都缩放至原来的大小 ---------舍弃
	function normalGraphicElements() {
		let data = Object.values(mapDataSource)
		data.forEach(child => {
			let featuresData = map.getSource(child)._data.features;
			featuresData.forEach(item => {
				if (item.geometry.type === "Point") {
					item.properties._iconSize = 0.4
				}
			})
			map.getSource(child).setData(turf.featureCollection(featuresData));
			iconStatus = false
		})
	}

	// 传入单条数据 放大图元 --------舍弃
	function firstDataHighlight(type, data = {}) {
		let source = mapDataSource[type]
		let featuresData = map.getSource(source)._data.features;
		featuresData.forEach(item => {
			if (item.geometry.type === "Point") {
				item.properties._iconSize = 0.4
				if (item.properties._idsID == data._idsID) {
					iconStatus = true
					item.properties._iconSize = 0.6
				}
			}
		})
		map.getSource(source).setData(turf.featureCollection(featuresData));
	}

	// 点击单点图元放大 图元 --------舍弃
	function enlargeGraphicElements(features) {
		let featuresData = map.getSource(features?.layer.source)._data.features;
		featuresData.forEach(item => {
			if (item.geometry.type === "Point") {
				item.properties._iconSize = 0.4
				item.properties._icon_opacity = 1
				if (item.properties._idsID == features.properties._idsID) {
					iconStatus = true
					item.properties._iconSize = 0.6
					item.properties._icon_opacity = 0.5
				}
			}
		})
		map.getSource(features?.layer.source).setData(turf.featureCollection(featuresData));
	}
	// 小车marker实例对象
	let carMarker;
	// 更新已走路径的定时器
	let timer
	// 轨迹回放
	function TrackReplay(data = []) {
		if (!map.getSource("trackReplay-played") && !map.getSource("trackReplay")) {
			// 添加轨迹回放的路线图层，已走过和未走过的
			addRouterLayer();
		} else if (data.length == 0) {
			console.log("data.length == 0 ");
			clearRouterLayer()
			return
		} else {
			clearRouterLayer()
		}
		let zoom = map.getZoom()
		console.log("轨迹回放", zoom);
		if (zoom < 14) {
			zoom = 14
		}
		map.easeTo({
			center: data[0],
			zoom: zoom,
		})
		// 轨迹回放的线路数据
		let lineFeature = {
			geometry: {
				type: "LineString",
				coordinates: data
			},
			properties: {},
			type: "Feature",
		};
		// 经过插值后的线路数据
		let chunkData;

		map.getSource("trackReplay").setData({
			type: "FeatureCollection",
			features: [lineFeature],
		});


		// 对线路进行插值处理，返回插值后的路径数据
		chunkData = joinLinePoint();
		let timeOut = setInterval(() => {
			if (map.isStyleLoaded()) {
				// 创建小车
				createCar();
				// 开始路径回放操作
				startReplaying(chunkData);
				clearInterval(timeOut)
			}
		}, 200)


		/**
		 * @description 清除轨迹线路数据、轨迹走过数据、清除marker点
		 */

		function clearRouterLayer() {
			clearInterval(timer);
			if (carMarker) {
				carMarker.remove();
				carMarker = undefined
			}
			map.getSource("trackReplay-played").setData({
				type: "FeatureCollection",
				features: [],
			});
			map.getSource("trackReplay").setData({
				type: "FeatureCollection",
				features: [],
			});
		}

		/**
		 * @description 在地图添加轨迹回放的路线图层
		 */
		function addRouterLayer() {
			// 轨迹图层
			map.addLayer({
				id: "trackReplay",
				type: "line",
				source: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [],
					},
				},
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "#28F",
					"line-width": 4,
					"line-pattern": "route-img",
				},
			});

			// 已经走过的路线图层
			map.addLayer({
				id: "trackReplay-played",
				type: "line",
				source: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [],
					},
				},
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "#4dc86f",
					"line-width": 5,
				},
			});
		}
		/**
		 * @description 创建marker点，轨迹回放时的人
		 */

		function createCar() {
			// 画marker点
			let el = document.createElement("div");
			// el.className = "marker car-marker";
			// el.style.backgroundImage = `url("@/static/icons/assets/mapIcon/people-start.png")`
			el.setAttribute(
				"style",
				"width:5px; height:5px; background:#FFEA00; border-radius:50%; box-shadow: 0 0 1px #FFEA00, 0 0 2px #FFEA00, 0 0 3px #FFEA00, 0 0 4px #FFEA00, 0 0 5px #FFEA00, 0 0 6px #FFEA00, 0 0 7px #FFEA00, 0 0 8px #FFEA00, 0 0 9px #FFEA00, 0 0 10px #FFEA00;",
			);

			carMarker = new SGMap.Marker(el)
				.setLngLat(lineFeature.geometry.coordinates[0])
				.addTo(map);
		}

		/**
		 * @description 在路径上每两个点之间插入新的点，使路线变得平滑
		 * 以每小时60公里的速度做插值处理
		 */
		function joinLinePoint() {
			// 回放时车辆速度，单位公里/每小时
			const speed = 60;
			// 播放速度，这里选择20倍播放速度
			const replaySpeed = 20;
			// 按照实际车辆跑的速度，每秒跑 60 / 3600 km
			// 车辆位置按每秒刷新20帧算，1/20秒移动的距离为 60 / 3600 / 20 km
			const step = 60 / 3600 / 20;
			// 倍数播放时，每帧移动的步长为 step * replaySpeed
			const scaleSpeed = step * replaySpeed;
			// 线路根据步长scaleSpeed间隔进行插值，插值线总长/步长(distance/scaleSpeed)个点，得到chunkData
			// 注意：线路长度一定，scaleSpeed越小，插值数量越多。线路长度很长的情况下，请调整replaySpeed，避免插值点数过多产生卡顿
			console.log(lineFeature, "lineFeaturelineFeature");
			chunkData = turf.lineChunk(
				lineFeature,
				scaleSpeed, {
					units: "kilometers",
				}
			);
			return chunkData;
		}

		/**
		 * @description 开始轨迹回放
		 */

		function startReplaying() {
			const features = chunkData.features;
			let max = features.length;
			let order = 0;
			timer = setInterval(() => {
				order++;
				if (order >= max) {
					clearInterval(timer);
					// carMarker.remove();
				} else {
					const beforePoint = features[order - 1].geometry.coordinates[1];
					const nowPoint = features[order].geometry.coordinates[1];
					// 设置小车的位置
					carMarker.setLngLat(nowPoint);
					// 设置小车的方向
					let bearing = turf.bearing(
						turf.point(beforePoint),
						turf.point(nowPoint)
					);
					bearing && carMarker.setRotation(bearing - 90);
					// 更新已走过的线路图层数据
					readerReplayedRouterLayer(order);
				}
			}, 1000 / 20); // 间隔1000 / 20执行一次，每秒执行20次，可以和上面计算线路的时间间隔配合
		}

		/**
		 * @description 绘制已经走过的路线
		 * @param {number} order 当前轨迹播放到第几个点
		 */
		function readerReplayedRouterLayer(order) {
			map.getSource("trackReplay-played").setData({
				type: "FeatureCollection",
				features: chunkData.features.slice(0, order + 1),
			});
		}
	}
	// 轨迹回放 --- 线路高亮
	function LineHighlight(data = []) {
		clearLineHighlight()
		if (data.length == 0) return
		if (!map.getLayer("LineHighlight-line")) {
			// 画线（通过map实例身上的 addLayer 方法）
			map.addLayer({
				id: "LineHighlight-line",
				type: "line",
				source: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [{
							type: "Feature",
							geometry: {
								type: "LineString",
								coordinates: [],
							},
						}, ],
					},
				},
				layout: {
					"line-cap": "round",
					"line-join": "round",
				},
				paint: {
					"line-color": "#ed6498",
					"line-width": 4,
				},
			});
		}
		let lineData = {
			geometry: {
				type: "LineString",
				coordinates: data
			},
			properties: {},
			type: "Feature",
		};
		map.getSource("LineHighlight-line").setData({
			type: "FeatureCollection",
			features: [lineData],
		})
		// 清除高亮线路的数据
		function clearLineHighlight() {
			if (map.getLayer("LineHighlight-line")) {
				// // 先移除图层，再移除数据源
				// map.removeLayer("LineHighlight-line");
				// map.removeSource("LineHighlight-line");
				map.getSource("LineHighlight-line").setData({
					type: "FeatureCollection",
					features: [],
				})
			}
		}
	}
	// uni获取定位
	function uniGetLocation() {
		console.log("2313");
		return new Promise((resolve, reject) => {
			uni.getLocation({
				type: 'wgs84',
				success: function(res) {
					console.log("res", res);
					console.log('当前位置的经度：' + res.longitude);
					console.log('当前位置的纬度：' + res.latitude);
					resolve(res); // 将获取到的位置信息传递给Promise的resolve函数
				},
				fail: function(error) {
					reject(error); // 如果获取位置信息失败，传递错误信息给Promise的reject函数
				}
			});
		});
	}
	// 路径规划
	async function initLayer(endData) {
		cleanRoute()
		let jwd
		await uniGetLocation().then((res) => {
			jwd = res; // 在Promise的then方法中获取位置信息并赋值给jwd变量
		}).catch((error) => {
			console.error('获取位置信息失败：', error);
		});
		console.log(jwd, "jwdjwdjwd");
		if (endData?.length > 0) {
			// direction.start = [116.468821, 28.368295]
			direction.start = [jwd.longitude * 1, jwd.latitude * 1]
			direction.end = endData
			console.log(direction.start, "自身定位的经纬度");
			// navigation-line pointEndLayer pointStartLayer
			map.getSource("navigation-line").setData({
				type: "FeatureCollection",
				features: [{
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": [],
						// direction.start,direction.end
					}
				}, ]
			});
			console.log(map.getLayer("pointStartLayer"), "map.getSource()");
			map.getSource("pointStartLayer").setData({
				type: "FeatureCollection",
				features: [{
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": direction.start
					}
				}]
			});
			console.log(map.getLayer("pointEndLayer"), "map.getSource()");
			map.getSource("pointEndLayer").setData({
				type: "FeatureCollection",
				features: [{
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": direction.end
					}
				}]
			});
			drawRoute()
		} else {
			console.log("路径规划数据为空");
		}

	}
	let direction = {
		start: [],
		end: []
	}
	// 清空路径
	function cleanRoute() {
		// 清空路径信息
		map.getSource("navigation-line").setData({
			type: "FeatureCollection",
			features: []
		});
		// 清空开始点
		direction.start = [];
		map.getSource("pointStartLayer").setData({
			type: "FeatureCollection",
			features: []
		});
		// 清空终点
		direction.end = [];
		map.getSource("pointEndLayer").setData({
			type: "FeatureCollection",
			features: []
		});
	}
	// 获取起始点的经纬度
	function startingPoint() {
		//console.log(window.igwWx, "igwWxigwWxigwWx");
		return window.igwWx.getLocation({
			type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
			success: function(res) {
				//console.log("打开地图初始化的wgs84的gps坐标", res)
				window.igwWx.invoke('ext_SGMap_Search', {
					'data': {
						'function': 'wgs84ToSGLocation',
						'data': {
							'lng': res.longitude,
							'lat': res.latitude
						}
					}
				}, function(res1) {
					//console.log("初始化转化为思极地图坐标", res1)
					uni.hideLoading()
					isTimer = false
					let data = {
						lat: res1.lat,
						lng: res1.lng
					}
					//console.log(data, "datadatadatadata");
				})
			},
			fail: function(err) {
				//console.log("getLocation error", err)
			}
		})

	}
	// 画路径
	function drawRoute() {
		// searchByWalking r
		// searchByDriving c
		directionsTask
			.searchByWalking({
				startPoint: direction.start,
				endPoint: direction.end
			})
			.then(function(result) {
				console.log(result,"result");
				// 路径
				map.getSource("navigation-line").setData(result.routes[0].feature);
				// 改变显示层级
				map.moveLayer("navigation-line", "pointStartLayer");
			}).catch(err=>{
				uni.showToast({
					title: '路径规划失败！',
					icon: 'none',
					duration: 2000
				})
				console.log(err,"err");
			})
	}
	// 向下查找聚合前的原始数据
	async function findSubsetsAsync(map, arr, pointArr) {
		for (const item of arr) {
			const clusterId = item.properties.cluster_id;
			if (clusterId) {
				try {
					const features = await getClusterChildrenAsync(map, clusterId);
					await findSubsetsAsync(map, features, pointArr);
				} catch (error) {
					//console.error("Error while getting cluster children:", error);
				}
			} else {
				pointArr.push(item.properties);
			}
		}
		return pointArr;
	}
	// getClusterChildren是异步方法  做异步处理，
	async function getClusterChildrenAsync(map, clusterId) {
		return new Promise((resolve, reject) => {
			map.getSource(pointSourceName).getClusterChildren(clusterId, (error,
				features) => {
				if (!error) {
					resolve(features);
				} else {
					reject(error);
				}
			});
		});
	}
	// 设置数据格式
	const setPointData = (data, type, index, status = false) => {
		return data.map((item, i) => {
			return {
				type: "Feature",
				geometry: {
					type: "Point",
					// 经纬度精简  geo   lng   geometryLng
					coordinates: item.lng ? [item.lng * 1, item.lat * 1] : item.gpsLongtude ? [item
						.gpsLongtude * 1, item.gpsLatitude * 1
					] : [item.longitude * 1, item.latitude * 1],
				},
				properties: setProperties(item, i, type, index, status),
			};
		});
	}
	// 设置地图中心点位 与  地图层级
	function setCenterPointAndZoom(point = [], zoom = 0) {
		if (zoom == 0) {
			zoom = map.getZoom()
		}
		map.easeTo({
			center: point,
			zoom: zoom,
		})
	}
	// 给数据添加图元配置
	const setProperties = (item, i, type, index, status = false) => {
		let symbolConfig = {}
		item._idsID = `${type}${i}`
		item._iconSize = 0.4
		if (item._icon_opacity) {
			item._icon_opacity = item._icon_opacity
		} else {
			item._icon_opacity = 1
		}
		// 人员分布
		if (type == "personList") {
			// symbolConfig = getSymbolConfig("zyfb", item)
			// 01 外部人员, 02 主业人员
			if (item.peopleNature == "01") {
				// 在线状态 不传/空时全部, 离线:0, 在线:1
				if (item.isOnline == 0) {
					item.icon = "people-wb-offline"
					item.status = 0
				} else if (item.isOnline == 1) {
					item.icon = "people-wb-online"
					item.status = 1
				}
			} else if (item.peopleNature == "02") {
				if (item.isOnline == 0) {
					item.icon = "people-zy-offline"
					item.status = 2
				} else if (item.isOnline == 1) {
					item.icon = "people-zy-online"
					item.status = 3
				}
			} else {
				item.icon = "jlx_err"
			}
			// item.icon = symbolConfig.image
			// console.log(item.icon, "item.icon");
		} else if (type == "orderList") { //作业分布---工单总数
			if (item.operatorName && item.operatorName != "") {
				item.icon = "order_1"
			} else if (item.operatorName == "") {
				item.icon = "order_2"
			} else {
				item.icon = "order"
			}
		} else if (type == "planList") { //作业分布 --- 作业计划总数
			if (item.wtStatus == "01" || item.wtStatus == "02" || item.wtStatus == "03") {
				// 计划---待执行 --工作票
			} else if (item.planStatus == "01" || item.planStatus == "04" || item.planStatus == "08") {
				item.icon = "plan_work" // 计划---待执行 --计划
			} else {
				item.icon = "zhi_err"
			}
		} else if (type == "ticketTotal") { //作业分布 -- 工作票
			if (item.wtStatus == "04") {
				item.icon = "work" // 工作票 -- 作业中
			} else if (item.wtStatus == "05") {
				item.icon = "work-end" // 工作票 --- 已终结
			} else {
				item.icon = "tai_err"
			}
		} else if (type == "violationList") { //违章分布
			if (item.voilationTypes == "01") { //管理问题
				if (item.voilationLevels == "01") { //一般
					item.icon = "wz-gl-yb"
					item.status = 0
				} else if (item.voilationLevels == "02") { //I类
					item.icon = "wz-gl-1"
					item.status = 1
				} else if (item.voilationLevels == "03") { //II类
					item.icon = "wz-gl-2"
					item.status = 2
				} else if (item.voilationLevels == "04") { //III类
					item.icon = "wz-gl"
					item.status = 3
				}
			} else if (item.voilationTypes == "02") { //行为问题
				if (item.voilationLevels == "01") { //一般
					item.icon = "wz-xw-yb"
					item.status = 4
				} else if (item.voilationLevels == "02") { //I类
					item.icon = "wz-xw-1"
					item.status = 5
				} else if (item.voilationLevels == "03") { //II类
					item.icon = "wz-xw-2"
					item.status = 6
				} else if (item.voilationLevels == "04") { //III类
					item.icon = "wz-xw"
					item.status = 7
				}
			} else if (item.voilationTypes == "03") { //设备问题
				if (item.voilationLevels == "01") { //一般
					item.icon = "wz-sb-yb"
					item.status = 8
				} else if (item.voilationLevels == "02") { //I类
					item.icon = "wz-sb-1"
					item.status = 9
				} else if (item.voilationLevels == "03") { //II类
					item.icon = "wz-sb-2"
					item.status = 10
				} else if (item.voilationLevels == "04") { //III类
					item.icon = "wz-sb"
					item.status = 11
				}
			}
		} else {
			item.icon = "xz_err" //全没走
		}
		if (index == 0 && status && i == 0) {
			item._iconSize = 0.6
		}
		// 适配三期代办工单的图元
		if (item.icon == "order_1" || item.icon == "order_2") {
			item._iconSize = 0.6
		}
		return item
	}
	// 清空所有图层数据
	function clearAllLayers() {
		let Layers = ["pointDataSource_WorkOrder", "pointDataSource_Plan_Homework", "pointDataSource_Work_Ticket",
			"pointDataSource_MainBusiness", "pointDataSource_Illegal", "navigation-line",
			"pointStartLayer", "pointEndLayer", "trackReplay", "trackReplay-played", "LineHighlight-line",
			"whiteBackground"
		]
		Layers.forEach(item => {
			if (map.getSource(item)) {
				map.getSource(item).setData({
					type: "FeatureCollection",
					features: [],
				});
			}
			if (carMarker) {
				carMarker.remove();
				carMarker = undefined
			}
		})
	}
	// 清空所有图层
	function removeLayer() {
		let Layers = ["pointStartLayer", "pointEndLayer", "navigation-line", "clusters_WorkOrder",
			"clusters_has_WorkOrder", "clusters_Plan_Homework", "clusters_has_Plan_Homework",
			"clusters_Work_Ticket", "clusters_has_Work_Ticket", "clusters_MainBusiness",
			"clusters_has_MainBusiness", "clusters_Illegal", "clusters_has_Illegal", "whiteBackground",
			"trackReplay", "trackReplay-played", "LineHighlight-line",
		]
		Layers.forEach(item => {
			if(map.getLayer(item)){
				map.removeLayer(item)
			}
		})
	}
	return {
		addPoint,
		MonitorClicksFn,
		initLayer,
		setAggregateLayer,
		TrackReplay,
		LineHighlight,
		clearAllLayers,
		setCenterPointAndZoom,
		firstDataHighlight,
		setWhiteBackground,
		mapStyleimagemissing,
		removeLayer
	}
}