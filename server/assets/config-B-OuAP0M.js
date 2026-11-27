// app/external/ground-motion/js/config.js
window.App = window.App || {};
App.Config = {
	mainChart: {
		totalWidth: 960,
		totalHeight: 820,
		margin: {
			top: 20,
			right: 90,
			bottom: 55,
			left: 70
		},
		get width() {
			return this.totalWidth - this.margin.left - this.margin.right;
		},
		get height() {
			return this.totalHeight - this.margin.top - this.margin.bottom;
		}
	},
	sideChart: {
		totalWidth: 500,
		totalHeight: 320,
		margin: {
			top: 10,
			right: 25,
			bottom: 40,
			left: 55
		},
		get width() {
			return this.totalWidth - this.margin.left - this.margin.right;
		},
		get height() {
			return this.totalHeight - this.margin.top - this.margin.bottom;
		}
	},
	magnitude: {
		min: 3,
		max: 8,
		colors: [
			"green",
			"yellow",
			"red"
		]
	}
};
export {};
