// app/external/ground-motion/js/charts/densityPlot.js
window.App = window.App || {};
var App = window.App;
var d3 = window.d3;
App.DensityPlot = {
	svg: null,
	xLog: null,
	xLinearLog: null,
	y: null,
	yAxisGroup: null,
	areaPath: null,
	linePath: null,
	init: function(containerSelector, validData) {
		var cfg = App.Config.sideChart;
		var container = d3.select(containerSelector);
		container.selectAll("svg").remove();
		this.svg = container.append("svg").attr("viewBox", "0 0 " + cfg.totalWidth + " " + cfg.totalHeight).attr("preserveAspectRatio", "xMidYMid meet").append("g").attr("transform", "translate(" + cfg.margin.left + "," + cfg.margin.top + ")");
		this.xLog = d3.scaleLog().domain([1e-5, 5]).range([0, cfg.width]).clamp(true);
		this.xLinearLog = d3.scaleLinear().domain([-5, Math.log10(5)]).range([0, cfg.width]);
		this.y = d3.scaleLinear().range([cfg.height, 0]);
		this.areaPath = this.svg.append("path").attr("fill", "#4682b4").attr("fill-opacity", .4);
		this.linePath = this.svg.append("path").attr("fill", "none").attr("stroke", "#2b5c8f").attr("stroke-width", 2);
		this.svg.append("g").attr("transform", "translate(0," + cfg.height + ")").call(d3.axisBottom(this.xLog).ticks(5, ".0e"));
		this.yAxisGroup = this.svg.append("g");
		this.svg.append("text").attr("x", cfg.width / 2).attr("y", cfg.height + 32).style("text-anchor", "middle").style("font-size", "11px").text("PGA (g)");
		this.svg.append("text").attr("transform", "rotate(-90)").attr("x", -cfg.height / 2).attr("y", -40).style("text-anchor", "middle").style("font-size", "11px").text("Dichte");
		this.update(validData);
	},
	update: function(filteredData) {
		if (!this.svg) return;
		var self = this;
		var cfg = App.Config.sideChart;
		var logPgaValues = filteredData.map(function(d) {
			return App.Utils.parseNum(d["PGA (g)"]);
		}).filter(function(v) {
			return !isNaN(v) && v > 0;
		}).map(function(v) {
			return Math.log10(v);
		});
		if (logPgaValues.length === 0) {
			this.areaPath.attr("opacity", 0);
			this.linePath.attr("opacity", 0);
			return;
		}
		var logExtent = d3.extent(logPgaValues);
		var minLog = Math.floor(logExtent[0]);
		var maxLog = Math.ceil(logExtent[1]);
		this.xLog.domain([Math.pow(10, minLog), Math.pow(10, maxLog)]);
		this.xLinearLog.domain([minLog, maxLog]);
		if (this.xAxisGroup) this.xAxisGroup.call(d3.axisBottom(this.xLog).ticks(5, ".0e"));
		var density = App.Utils.kernelDensityEstimator(App.Utils.kernelEpanechnikov(.25), this.xLinearLog.ticks(40))(logPgaValues);
		if (density.length > 0) {
			density.unshift([density[0][0], 0]);
			density.push([density[density.length - 1][0], 0]);
		}
		var maxDensity = d3.max(density, function(d) {
			return d[1];
		}) || 1;
		this.y.domain([0, maxDensity * 1.1]);
		this.yAxisGroup.transition().duration(200).call(d3.axisLeft(this.y).ticks(5));
		var area = d3.area().curve(d3.curveBasis).x(function(d) {
			return self.xLinearLog(d[0]);
		}).y0(cfg.height).y1(function(d) {
			return self.y(d[1]);
		});
		var line = d3.line().curve(d3.curveBasis).x(function(d) {
			return self.xLinearLog(d[0]);
		}).y(function(d) {
			return self.y(d[1]);
		});
		this.areaPath.datum(density).attr("opacity", 1).attr("d", area);
		this.linePath.datum(density).attr("opacity", 1).attr("d", line);
	}
};
export {};
