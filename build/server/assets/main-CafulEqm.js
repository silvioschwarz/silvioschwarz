// app/external/ground-motion/js/main.js
window.App = window.App || {};
var App = window.App;
var d3 = window.d3;
window.App.Main = {
	init: function() {
		var self = this;
		d3.selectAll("input[type=checkbox].data").on("change", function() {
			self.loadSelectedFiles();
		});
		this.loadSelectedFiles();
	},
	loadSelectedFiles: function() {
		var self = this;
		var checkedNodes = d3.selectAll("input[type=checkbox]:checked.data").nodes();
		if (checkedNodes.length === 0) {
			d3.select("#file-status").style("color", "orange").text("Bitte mindestens einen Datensatz auswählen.");
			d3.select("#my_dataviz").selectAll("*").remove();
			d3.select("#mag_histogram").selectAll("svg").remove();
			d3.select("#pga_density").selectAll("svg").remove();
			return;
		}
		var fileNames = checkedNodes.map(function(node) {
			return node.id.slice(0, -9) + ".csv";
		});
		d3.select("#file-status").style("color", "#555").text("Lade " + fileNames.length + " Datei(en)...");
		Promise.all(fileNames.map(function(fileName) {
			return d3.csv("data/" + fileName).then(function(dataset) {
				return dataset.map(function(row) {
					return self.normalizeRow(row, fileName);
				});
			});
		})).then(function(results) {
			var combinedData = results.flat();
			App.Dashboard.render(combinedData, fileNames.join(", "));
		}).catch(function(error) {
			d3.select("#file-status").style("color", "red").text("Fehler beim Laden der CSV-Dateien.");
			console.error("CSV Ladefehler:", error);
		});
	},
	normalizeRow: function(row, fileName) {
		row._sourceFile = fileName;
		if (row["PGA (g)"] === void 0) {
			var rawPga = row["rotD50_pga"] || row["U_pga"] || row["V_pga"] || row["W_pga"];
			if (rawPga !== void 0 && rawPga !== "") {
				var pgaCmS2 = App.Utils.parseNum(rawPga);
				if (!isNaN(pgaCmS2)) row["PGA (g)"] = pgaCmS2 / 980.665;
			}
		}
		if (row["Earthquake Magnitude"] === void 0) row["Earthquake Magnitude"] = row["Mw"] || row["ML"] || row["Ms"];
		if (row["HypD (km)"] === void 0) {
			var epi = App.Utils.parseNum(row["epi_dist"]);
			var depth = App.Utils.parseNum(row["ev_depth_km"]);
			if (!isNaN(epi) && !isNaN(depth)) row["HypD (km)"] = Math.sqrt(epi * epi + depth * depth);
			else if (!isNaN(epi)) row["HypD (km)"] = epi;
		}
		if (row["EpiD (km)"] === void 0 && row["epi_dist"] !== void 0) row["EpiD (km)"] = row["epi_dist"];
		if (row["JB (km)"] === void 0 && row["JB_dist"] !== void 0) row["JB (km)"] = row["JB_dist"];
		if (row["RupD (km)"] === void 0 && row["rup_dist"] !== void 0) row["RupD (km)"] = row["rup_dist"];
		if (row["Earthquake ID"] === void 0) row["Earthquake ID"] = row["event_id"] || row["vent_id"] || row["USGS_ev_id"] || row["INGV_ev_id"];
		var cleanNum = function(v) {
			var n = App.Utils.parseNum(v);
			return !isNaN(n) && n !== -999 ? n : NaN;
		};
		var hypLat = cleanNum(row["Hypocenter Latitude (deg)"] !== void 0 ? row["Hypocenter Latitude (deg)"] : row["ev_latitude"]);
		var hypLon = cleanNum(row["Hypocenter Longitude (deg)"] !== void 0 ? row["Hypocenter Longitude (deg)"] : row["ev_longitude"]);
		var hypDepth = cleanNum(row["Hypocenter Depth (km)"] !== void 0 ? row["Hypocenter Depth (km)"] : row["ev_depth_km"]);
		var stLat = cleanNum(row["Station Latitude"] !== void 0 ? row["Station Latitude"] : row["st_latitude"]);
		var stLon = cleanNum(row["Station Longitude"] !== void 0 ? row["Station Longitude"] : row["st_longitude"]);
		var mwVal = cleanNum(row["Earthquake Magnitude"]);
		if ([
			hypLat,
			hypLon,
			hypDepth,
			stLat,
			stLon,
			mwVal
		].every(function(x) {
			return !isNaN(x);
		})) {
			var strikeVal = cleanNum(row["Strike (deg)"]);
			var dipVal = cleanNum(row["Dip (deg)"]);
			var calc = App.Utils.calcFaultDistances({
				hypLat,
				hypLon,
				hypDepthKm: Math.max(0, hypDepth),
				stLat,
				stLon,
				strikeDeg: !isNaN(strikeVal) ? strikeVal : 0,
				dipDeg: !isNaN(dipVal) ? dipVal : 90,
				mw: mwVal,
				lengthKm: cleanNum(row["Fault Rupture Length for Calculation of Ry (km)"]),
				widthKm: cleanNum(row["Fault Rupture Width (km)"]),
				zTorKm: cleanNum(row["Depth to Top Of Fault Rupture Model"])
			});
			row["R_rup_calc (km)"] = calc.rRup;
			row["R_JB_calc (km)"] = calc.rJB;
			row["R_w (km)"] = calc.rW;
			row["R_z (km)"] = calc.rZ;
		}
		return row;
	}
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function() {
	App.Main.init();
});
else App.Main.init();
export {};
