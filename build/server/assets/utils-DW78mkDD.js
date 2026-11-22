// app/external/ground-motion/js/utils.js
window.App = window.App || {};
App.Utils = {
	parseNum: function(val) {
		return +String(val).replace(",", ".");
	},
	isValidValue: function(val) {
		var num = this.parseNum(val);
		return !isNaN(num) && num > 0;
	},
	countUniqueEarthquakes: function(dataArray) {
		if (!dataArray || dataArray.length === 0) return 0;
		var uniqueIds = /* @__PURE__ */ new Set();
		dataArray.forEach(function(d) {
			var id = d["Earthquake ID"] || d["EQID"] || d["Event ID"] || d["EventID"] || d["ID"];
			if (id !== void 0 && String(id).trim() !== "") uniqueIds.add(String(id).trim());
			else {
				var fallbackKey = (d["Earthquake Magnitude"] || "") + "_" + (d["Earthquake Name"] || d["Date"] || d["Year"] || "");
				uniqueIds.add(fallbackKey);
			}
		});
		return uniqueIds.size;
	},
	kernelDensityEstimator: function(kernel, X) {
		return function(V) {
			return X.map(function(x) {
				return [x, d3.mean(V, function(v) {
					return kernel(x - v);
				})];
			});
		};
	},
	kernelEpanechnikov: function(k) {
		return function(v) {
			return Math.abs(v /= k) <= 1 ? .75 * (1 - v * v) / k : 0;
		};
	}
};
export {};
