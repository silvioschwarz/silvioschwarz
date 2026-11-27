// app/external/ground-motion/js/charts/histogram.js
window.App = window.App || {};
var App = window.App;
var d3 = window.d3;
App.Histogram = {
	svg: null,
	x: null,
	y: null,
	yAxisGroup: null,
	colorScale: null,
	allMagnitudes: [],
	init: function(containerSelector, validData) {
		var cfg = App.Config.sideChart;
		var magCfg = App.Config.magnitude;
		var container = d3.select(containerSelector);
		container.selectAll("svg").remove();
		this.svg = container.append("svg").attr("viewBox", "0 0 " + cfg.totalWidth + " " + cfg.totalHeight).attr("preserveAspectRatio", "xMidYMid meet").append("g").attr("transform", "translate(" + cfg.margin.left + "," + cfg.margin.top + ")");
		this.allMagnitudes = validData.map(function(d) {
			return App.Utils.parseNum(d["Earthquake Magnitude"]);
		}).filter(function(m) {
			return !isNaN(m);
		});
		this.x = d3.scaleLinear().domain([magCfg.min, magCfg.max]).range([0, cfg.width]);
		this.y = d3.scaleLinear().range([cfg.height, 0]);
		this.colorScale = d3.scaleLinear().domain([
			magCfg.min,
			(magCfg.min + magCfg.max) / 2,
			magCfg.max
		]).range(magCfg.colors).clamp(true);
		this.svg.append("g").attr("transform", "translate(0," + cfg.height + ")").call(d3.axisBottom(this.x).ticks(6));
		this.yAxisGroup = this.svg.append("g");
		this.svg.append("text").attr("x", cfg.width / 2).attr("y", cfg.height + 32).style("text-anchor", "middle").style("font-size", "11px").text("Earthquake Magnitude");
		this.svg.append("text").attr("transform", "rotate(-90)").attr("x", -cfg.height / 2).attr("y", -40).style("text-anchor", "middle").style("font-size", "11px").text("Anzahl");
		this.update(magCfg.min);
	},
	update: function(minMagnitude) {
		if (!this.svg || this.allMagnitudes.length === 0) return;
		var self = this;
		var cfg = App.Config.sideChart;
		var bins = d3.histogram().value(function(d) {
			return d;
		}).domain(this.x.domain()).thresholds(this.x.ticks(15))(this.allMagnitudes);
		this.y.domain([0, d3.max(bins, function(d) {
			return d.length;
		}) || 1]).nice();
		this.yAxisGroup.transition().duration(200).call(d3.axisLeft(this.y).ticks(5));
		var bars = this.svg.selectAll(".bar").data(bins);
		bars.enter().append("rect").attr("class", "bar").attr("x", function(d) {
			return self.x(d.x0) + 1;
		}).attr("width", function(d) {
			return Math.max(0, self.x(d.x1) - self.x(d.x0) - 1);
		}).style("stroke", "#333").style("stroke-width", "0.5px").merge(bars).transition().duration(200).attr("y", function(d) {
			return self.y(d.length);
		}).attr("height", function(d) {
			return cfg.height - self.y(d.length);
		}).style("fill", function(d) {
			return self.colorScale((d.x0 + d.x1) / 2);
		}).style("opacity", function(d) {
			return d.x1 <= minMagnitude ? .15 : .85;
		});
		bars.exit().remove();
	}
};
export {};
