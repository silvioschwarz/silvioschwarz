// app/external/ground-motion/js/charts/scatterPlot.js
window.App = window.App || {};
var App = window.App;
var d3 = window.d3;
App.ScatterPlot = {
	svg: null,
	canvas: null,
	ctx: null,
	x: null,
	y: null,
	xAxisGroup: null,
	yAxisGroup: null,
	xGridGroup: null,
	yGridGroup: null,
	xLabel: null,
	trendlinePath: null,
	colorScale: null,
	tooltip: null,
	quadtree: null,
	hoveredPoint: null,
	currentPlotData: [],
	currentMetric: "HypD (km)",
	init: function(containerSelector, validData) {
		var cfg = App.Config.mainChart;
		var magCfg = App.Config.magnitude;
		var container = d3.select(containerSelector);
		container.selectAll("*").remove();
		var middleCol = document.querySelector(".middle-column");
		var rightCol = document.querySelector(".right-column");
		var targetWidth = middleCol ? middleCol.getBoundingClientRect().width : container.node().getBoundingClientRect().width;
		var targetHeight = rightCol ? rightCol.getBoundingClientRect().height : container.node().getBoundingClientRect().height;
		var heading = middleCol ? middleCol.querySelector("h3") : null;
		if (heading) targetHeight -= heading.offsetHeight + 8;
		cfg.totalWidth = Math.max(300, Math.floor(targetWidth));
		cfg.totalHeight = Math.max(300, Math.floor(targetHeight));
		var dpr = window.devicePixelRatio || 1;
		this.canvas = container.append("canvas").attr("width", cfg.totalWidth * dpr).attr("height", cfg.totalHeight * dpr);
		this.ctx = this.canvas.node().getContext("2d");
		this.ctx.scale(dpr, dpr);
		this.svg = container.append("svg").attr("viewBox", "0 0 " + cfg.totalWidth + " " + cfg.totalHeight).append("g").attr("transform", "translate(" + cfg.margin.left + "," + cfg.margin.top + ")");
		var defs = this.svg.append("defs");
		defs.append("clipPath").attr("id", "plot-clip").append("rect").attr("width", cfg.width).attr("height", cfg.height);
		this.xGridGroup = this.svg.append("g").attr("class", "grid").attr("transform", "translate(0," + cfg.height + ")");
		this.yGridGroup = this.svg.append("g").attr("class", "grid");
		this.xAxisGroup = this.svg.append("g").attr("transform", "translate(0," + cfg.height + ")");
		this.yAxisGroup = this.svg.append("g");
		this.xLabel = this.svg.append("text").attr("x", cfg.width / 2).attr("y", cfg.height + 38).style("text-anchor", "middle").style("font-size", "13px").text("HypD (km)");
		this.svg.append("text").attr("transform", "rotate(-90)").attr("x", -cfg.height / 2).attr("y", -50).style("text-anchor", "middle").style("font-size", "13px").text("PGA (g)");
		var plotArea = this.svg.append("g").attr("clip-path", "url(#plot-clip)");
		this.trendlinePath = plotArea.append("path").attr("class", "trendline").attr("fill", "none").attr("stroke", "#111").attr("stroke-width", 2).attr("stroke-dasharray", "6,4");
		this.colorScale = d3.scaleLinear().domain([
			magCfg.min,
			(magCfg.min + magCfg.max) / 2,
			magCfg.max
		]).range(magCfg.colors).clamp(true);
		this.drawColorBar(defs, cfg.width);
		this.bindCanvasHover();
		this.update(validData, {
			metric: "HypD (km)",
			isLogX: true,
			isLogY: true,
			showTrendline: true
		});
	},
	update: function(filteredData, options) {
		if (!this.svg || !this.ctx) return;
		if (!this.tooltip || this.tooltip.empty()) {
			d3.selectAll(".d3-scatter-tooltip").remove();
			this.tooltip = d3.select("body").append("div").attr("class", "d3-scatter-tooltip").style("position", "absolute").style("pointer-events", "none").style("background", "rgba(25, 25, 25, 0.9)").style("color", "#fff").style("padding", "8px 12px").style("border-radius", "4px").style("font-size", "12px").style("line-height", "1.4").style("box-shadow", "0 2px 6px rgba(0,0,0,0.3)").style("opacity", 0);
		}
		var self = this;
		var cfg = App.Config.mainChart;
		this.currentMetric = options.metric;
		var isLogX = options.isLogX;
		var isLogY = options.isLogY;
		var showTrendline = options.showTrendline;
		var plotData = filteredData.map(function(d) {
			return {
				xVal: App.Utils.parseNum(d[self.currentMetric]),
				yVal: App.Utils.parseNum(d["PGA (g)"]),
				mag: App.Utils.parseNum(d["Earthquake Magnitude"]),
				source: d._sourceFile || "",
				raw: d
			};
		}).filter(function(d) {
			var validX = !isNaN(d.xVal) && (isLogX ? d.xVal > 0 : d.xVal >= 0);
			var validY = !isNaN(d.yVal) && (isLogY ? d.yVal > 0 : d.yVal >= 0);
			return validX && validY;
		});
		var maxX = d3.max(plotData, function(d) {
			return d.xVal;
		}) || 2e3;
		if (isLogX) {
			var upperLogX = Math.max(2e3, Math.pow(10, Math.ceil(Math.log10(maxX))));
			this.x = d3.scaleLog().domain([.1, upperLogX]).range([0, cfg.width]);
		} else this.x = d3.scaleLinear().domain([0, maxX * 1.05]).nice().range([0, cfg.width]);
		var yExtent = d3.extent(plotData, function(d) {
			return d.yVal;
		});
		var minY = yExtent[0];
		var maxY = yExtent[1];
		if (isLogY) {
			var safeMinY = minY && minY > 0 ? minY : 1e-7;
			var safeMaxY = maxY && maxY > 0 ? maxY : 5;
			var lowerBound = Math.pow(10, Math.floor(Math.log10(safeMinY)));
			var upperBound = Math.pow(10, Math.ceil(Math.log10(safeMaxY)));
			this.y = d3.scaleLog().domain([lowerBound, upperBound]).range([cfg.height, 0]);
		} else {
			var safeMaxLinY = maxY || 1;
			this.y = d3.scaleLinear().domain([0, safeMaxLinY * 1.05]).nice().range([cfg.height, 0]);
		}
		plotData.forEach(function(d) {
			d.px = self.x(d.xVal);
			d.py = self.y(d.yVal);
			d.color = !isNaN(d.mag) ? self.colorScale(d.mag) : "#999";
		});
		this.currentPlotData = plotData;
		this.hoveredPoint = null;
		this.quadtree = d3.quadtree().x(function(d) {
			return d.px;
		}).y(function(d) {
			return d.py;
		}).addAll(plotData);
		var xAxis = isLogX ? d3.axisBottom(this.x).ticks(6, ".0f") : d3.axisBottom(this.x).ticks(8);
		var yAxis = isLogY ? d3.axisLeft(this.y).ticks(6, ".0e") : d3.axisLeft(this.y).ticks(8);
		this.xAxisGroup.call(xAxis);
		this.yAxisGroup.call(yAxis);
		this.xLabel.text(this.currentMetric);
		this.xGridGroup.call(xAxis.tickSize(-cfg.height).tickFormat(""));
		this.yGridGroup.call(yAxis.tickSize(-cfg.width).tickFormat(""));
		this.drawCanvas();
		this.updateTrendline(plotData, isLogX, isLogY, showTrendline);
		return plotData.map(function(d) {
			return d.raw;
		});
	},
	drawCanvas: function() {
		var cfg = App.Config.mainChart;
		var ctx = this.ctx;
		ctx.clearRect(0, 0, cfg.totalWidth, cfg.totalHeight);
		ctx.save();
		ctx.translate(cfg.margin.left, cfg.margin.top);
		ctx.beginPath();
		ctx.rect(0, 0, cfg.width, cfg.height);
		ctx.clip();
		ctx.globalAlpha = .75;
		var data = this.currentPlotData;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			ctx.beginPath();
			ctx.arc(d.px, d.py, 3, 0, 2 * Math.PI);
			ctx.fillStyle = d.color;
			ctx.fill();
		}
		if (this.hoveredPoint) {
			ctx.globalAlpha = 1;
			ctx.beginPath();
			ctx.arc(this.hoveredPoint.px, this.hoveredPoint.py, 6.5, 0, 2 * Math.PI);
			ctx.fillStyle = this.hoveredPoint.color;
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#000";
			ctx.stroke();
		}
		ctx.restore();
	},
	bindCanvasHover: function() {
		var self = this;
		var cfg = App.Config.mainChart;
		this.canvas.on("mousemove", function(event) {
			if (!self.quadtree) return;
			var coords = d3.pointer(event, this);
			var mouseX = coords[0] - cfg.margin.left;
			var mouseY = coords[1] - cfg.margin.top;
			var closest = self.quadtree.find(mouseX, mouseY, 12);
			if (closest) {
				if (self.hoveredPoint !== closest) {
					self.hoveredPoint = closest;
					self.drawCanvas();
				}
				self.canvas.style("cursor", "pointer");
				self.tooltip.style("opacity", 1).style("left", event.pageX + 14 + "px").style("top", event.pageY - 28 + "px").html("<strong>Magnitude:</strong> " + (!isNaN(closest.mag) ? closest.mag.toFixed(1) : "k. A.") + "<br><strong>" + self.currentMetric + ":</strong> " + closest.xVal.toFixed(2) + "<br><strong>PGA (g):</strong> " + closest.yVal.toExponential(3) + "<br>" + (closest.source ? "<span style='color:#bbb;font-size:11px;'>Datei: " + closest.source + "</span>" : ""));
			} else {
				if (self.hoveredPoint !== null) {
					self.hoveredPoint = null;
					self.drawCanvas();
				}
				self.canvas.style("cursor", "default");
				self.tooltip.style("opacity", 0);
			}
		}).on("mouseout", function() {
			self.hoveredPoint = null;
			self.drawCanvas();
			self.tooltip.style("opacity", 0);
		});
	},
	updateTrendline: function(plotData, isLogX, isLogY, showTrendline) {
		if (!showTrendline || plotData.length < 2) {
			this.trendlinePath.attr("opacity", 0);
			return;
		}
		var pts = plotData.map(function(d) {
			return {
				x: isLogX ? Math.log10(d.xVal) : d.xVal,
				y: isLogY ? Math.log10(d.yVal) : d.yVal
			};
		});
		var n = pts.length;
		var sumX = d3.sum(pts, function(p) {
			return p.x;
		});
		var sumY = d3.sum(pts, function(p) {
			return p.y;
		});
		var sumXY = d3.sum(pts, function(p) {
			return p.x * p.y;
		});
		var sumXX = d3.sum(pts, function(p) {
			return p.x * p.x;
		});
		var slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
		var intercept = (sumY - slope * sumX) / n;
		if (isNaN(slope) || isNaN(intercept)) {
			this.trendlinePath.attr("opacity", 0);
			return;
		}
		var domain = this.x.domain();
		var x1 = domain[0];
		var x2 = domain[1];
		var calcY = function(xRaw) {
			var yTrans = slope * (isLogX ? Math.log10(xRaw) : xRaw) + intercept;
			return isLogY ? Math.pow(10, yTrans) : yTrans;
		};
		var lineCoords = [[this.x(x1), this.y(calcY(x1))], [this.x(x2), this.y(calcY(x2))]];
		this.trendlinePath.attr("opacity", 1).attr("d", d3.line()(lineCoords));
	},
	drawColorBar: function(defs, chartWidth) {
		var legendWidth = 20;
		var legendHeight = 200;
		var legendX = chartWidth + 20;
		var legendY = 20;
		var linearGradient = defs.append("linearGradient").attr("id", "magnitude-gradient").attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");
		var domain = this.colorScale.domain();
		var range = this.colorScale.range();
		var minVal = domain[0];
		var maxVal = domain[domain.length - 1];
		linearGradient.selectAll("stop").data(domain.map(function(d, i) {
			return {
				offset: (d - minVal) / (maxVal - minVal) * 100 + "%",
				color: range[i]
			};
		})).enter().append("stop").attr("offset", function(d) {
			return d.offset;
		}).attr("stop-color", function(d) {
			return d.color;
		});
		var legendGroup = this.svg.append("g").attr("class", "legend").attr("transform", "translate(" + legendX + "," + legendY + ")");
		legendGroup.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#magnitude-gradient)").style("stroke", "#ccc");
		var legendScale = d3.scaleLinear().domain([minVal, maxVal]).range([legendHeight, 0]);
		legendGroup.append("g").attr("transform", "translate(" + legendWidth + ", 0)").call(d3.axisRight(legendScale).ticks(5));
		legendGroup.append("text").attr("x", 0).attr("y", -8).style("font-size", "12px").style("font-weight", "bold").text("Magnitude");
	}
};
export {};
