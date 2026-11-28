// app/external/ground-motion/js/charts/dashboard.js
window.App = window.App || {};
var App = window.App;
var d3 = window.d3;
App.Dashboard = {
	validData: [],
	resizeObserver: null,
	state: {
		minMagnitude: 3,
		minDistance: 0,
		maxDistance: 500,
		metric: "HypD (km)",
		isLogX: true,
		isLogY: true
	},
	render: function(data, fileName) {
		this.updateAll(false);
		this.validData = data.filter(function(d) {
			return App.Utils.isValidValue(d["PGA (g)"]) && App.Utils.parseNum(d["PGA (g)"]) > 0;
		});
		if (this.validData.length === 0) {
			d3.select("#file-status").style("color", "red").text("Fehler: Keine gültigen Daten in '" + fileName + "' gefunden.");
			return;
		}
		var totalUniqueEq = App.Utils.countUniqueEarthquakes(this.validData);
		d3.select("#file-status").style("color", "green").html("Geladen: <strong>" + fileName + "</strong><br><span id='point-count'>" + this.validData.length.toLocaleString("de-DE") + "</span> Messpunkte | <span id='unique-eq-count'>" + totalUniqueEq.toLocaleString("de-DE") + "</span> Unique Erdbeben");
		var minMag = App.Config.magnitude.min;
		var maxMag = App.Config.magnitude.max;
		this.state = {
			minMagnitude: minMag,
			minDistance: 0,
			maxDistance: 500,
			metric: "HypD (km)",
			isLogX: true,
			isLogY: true
		};
		d3.select("#log-x-checkbox").property("checked", true);
		d3.select("#log-y-checkbox").property("checked", true);
		d3.select("input[name='distance'][value='HypD (km)']").property("checked", true);
		d3.select("#mag-slider").attr("min", minMag).attr("max", maxMag).property("value", minMag);
		d3.select("#mag-value").text(minMag.toFixed(1));
		d3.select("#dist-min-input").property("value", 0);
		d3.select("#dist-max-input").property("value", 500);
		d3.select("#dist-value").text("0 – 500 km");
		App.ScatterPlot.init("#my_dataviz", this.validData);
		App.Histogram.init("#mag_histogram", this.validData);
		App.DensityPlot.init("#pga_density", this.validData);
		this.bindControls();
		this.bindResize();
	},
	bindResize: function() {
		var self = this;
		var mainNode = document.querySelector("main");
		if (!mainNode || !window.ResizeObserver) return;
		if (this.resizeObserver) this.resizeObserver.disconnect();
		var resizeTimer;
		this.resizeObserver = new ResizeObserver(function() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				if (self.validData.length > 0) {
					App.ScatterPlot.init("#my_dataviz", self.validData);
					self.updateAll(false);
				}
			}, 100);
		});
		this.resizeObserver.observe(mainNode);
	},
	bindControls: function() {
		var self = this;
		var sliderTimer;
		d3.select("#mag-slider").on("input.dashboard", function() {
			self.state.minMagnitude = +this.value;
			d3.select("#mag-value").text(self.state.minMagnitude.toFixed(1));
			clearTimeout(sliderTimer);
			sliderTimer = setTimeout(function() {
				self.updateAll(true);
			}, 50);
		});
		var distTimer;
		d3.selectAll("#dist-min-input, #dist-max-input").on("input.dashboard", function() {
			var minVal = +d3.select("#dist-min-input").property("value");
			var maxVal = +d3.select("#dist-max-input").property("value");
			self.state.minDistance = minVal;
			self.state.maxDistance = maxVal;
			d3.select("#dist-value").text(minVal + " – " + maxVal + " km");
			clearTimeout(distTimer);
			distTimer = setTimeout(function() {
				self.updateAll(true);
			}, 50);
		});
		d3.select("#log-x-checkbox").on("change.dashboard", function() {
			self.state.isLogX = this.checked;
			self.updateAll(false);
		});
		d3.select("#log-y-checkbox").on("change.dashboard", function() {
			self.state.isLogY = this.checked;
			self.updateAll(false);
		});
		d3.selectAll("input[name='distance']").on("change.dashboard", function() {
			if (this.checked) {
				self.state.metric = this.value;
				self.updateAll(false);
			}
		});
	},
	updateAll: function(magnitudeChanged) {
		var self = this;
		var filteredData = this.validData.filter(function(d) {
			var mag = App.Utils.parseNum(d["Earthquake Magnitude"]);
			var dist = App.Utils.parseNum(d[self.state.metric]);
			var magOk = !isNaN(mag) && mag >= self.state.minMagnitude;
			var distOk = !isNaN(dist) && dist >= self.state.minDistance && dist <= self.state.maxDistance;
			return magOk && distOk;
		});
		var visibleData = App.ScatterPlot.update(filteredData, {
			metric: this.state.metric,
			isLogX: this.state.isLogX,
			isLogY: this.state.isLogY,
			showTrendline: this.state.showTrendline
		}) || filteredData;
		var currentUniqueEq = App.Utils.countUniqueEarthquakes(visibleData);
		var totalUniqueEq = App.Utils.countUniqueEarthquakes(this.validData);
		d3.select("#point-count").text(visibleData.length.toLocaleString("de-DE") + " / " + this.validData.length.toLocaleString("de-DE"));
		d3.select("#unique-eq-count").text(currentUniqueEq.toLocaleString("de-DE") + " / " + totalUniqueEq.toLocaleString("de-DE"));
		if (magnitudeChanged) {
			App.Histogram.update(this.state.minMagnitude);
			App.DensityPlot.update(filteredData);
		}
	}
};
export {};
