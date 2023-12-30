/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/cartersianPlane/plane.ts":
/*!*************************************************!*\
  !*** ./src/components/cartersianPlane/plane.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar CartesianPlane = /** @class */ (function () {\n    function CartesianPlane(canvasID) {\n        this.scaleRatio = 1;\n        this.canvas = document.getElementById(canvasID);\n        this.ctx = this.canvas.getContext('2d');\n        this.canvas.width = innerWidth;\n        this.canvas.height = innerHeight;\n        this.origin = {\n            x: this.canvas.width / 2,\n            y: this.canvas.height / 2,\n        };\n        this.initialOrigin = {\n            x: this.canvas.width / 2,\n            y: this.canvas.height / 2,\n        };\n        this.initialRange = 5;\n        this.range = {\n            x: { min: -this.initialRange, max: this.initialRange },\n            y: { min: -this.initialRange, max: this.initialRange },\n        };\n        this.scaleFactor = this.initialScaleFactor =\n            this.canvas.width / (this.initialRange * 2);\n        this.canvas.addEventListener('mousedown', this.translatePlane.bind(this));\n        this.canvas.addEventListener('wheel', this.scalePlane.bind(this));\n        // Initial draw\n        this.drawPlane();\n    }\n    CartesianPlane.prototype.drawPlane = function () {\n        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);\n        // Recalculate range based on the origin canvas position\n        if (this.origin.x - this.initialOrigin.x) {\n            var dx = Math.ceil((this.origin.x - this.initialOrigin.x) / this.scaleFactor);\n            this.range.x = {\n                min: -this.initialRange - dx,\n                max: this.initialRange - dx,\n            };\n        }\n        if (this.origin.y - this.initialOrigin.y) {\n            var dy = Math.ceil((this.origin.y - this.initialOrigin.y) / this.scaleFactor);\n            this.range.y = {\n                min: -this.initialRange + dy,\n                max: this.initialRange + dy,\n            };\n        }\n        this.drawAxes();\n        this.drawGrid(null, '#555', 1.0);\n        this.drawGrid(5); // Subgrid\n        this.drawMarkers();\n    };\n    CartesianPlane.prototype.drawAxes = function () {\n        // Origin marker\n        this.ctx.fillStyle = 'black';\n        this.ctx.font = '16px Cambria Math';\n        this.ctx.fillText('0', this.origin.x - 15, this.origin.y + 15);\n        this.ctx.strokeStyle = 'black';\n        this.ctx.beginPath();\n        this.ctx.moveTo(0, this.origin.y);\n        this.ctx.lineTo(this.canvas.width, this.origin.y);\n        this.ctx.moveTo(this.origin.x, 0);\n        this.ctx.lineTo(this.origin.x, this.canvas.height);\n        this.ctx.stroke();\n    };\n    CartesianPlane.prototype.drawGrid = function (divisions, color, width) {\n        var gridSize = 1 / (divisions !== null && divisions !== void 0 ? divisions : 1) / this.scaleRatio;\n        // Styling\n        this.ctx.strokeStyle = color !== null && color !== void 0 ? color : '#bbb';\n        this.ctx.lineWidth = width !== null && width !== void 0 ? width : 0.5;\n        // Vertical grid lines\n        for (var x = this.range.x.min; x <= this.range.x.max; x += gridSize) {\n            var xPos = this.origin.x + x * this.scaleFactor;\n            this.ctx.beginPath();\n            this.ctx.moveTo(xPos, 0);\n            this.ctx.lineTo(xPos, this.canvas.height);\n            this.ctx.stroke();\n        }\n        // Horizontal grid lines\n        for (var y = this.range.y.min; y <= this.range.y.max; y += gridSize) {\n            var yPos = this.origin.y - y * this.scaleFactor;\n            this.ctx.beginPath();\n            this.ctx.moveTo(0, yPos);\n            this.ctx.lineTo(this.canvas.width, yPos);\n            this.ctx.stroke();\n        }\n    };\n    CartesianPlane.prototype.drawMarkers = function () {\n        var spacing = 1 / this.scaleRatio;\n        // Styling\n        this.ctx.fillStyle = 'black';\n        this.ctx.font = '16px Cambria Math';\n        var precision = this.scaleRatio >= 1 ? this.scaleRatio - 1 : 0;\n        // X-axis labels\n        for (var x = this.range.x.min; x <= this.range.x.max; x += spacing) {\n            var xPos = this.origin.x + x * this.scaleFactor;\n            this.ctx.fillRect(xPos, this.origin.y - 5, 1, 10);\n            this.ctx.fillText(x.toFixed(precision), xPos - 5, this.origin.y + 20);\n        }\n        // Y-axis labels\n        for (var y = this.range.y.min; y <= this.range.y.max; y += spacing) {\n            if (y !== 0 || y * this.scaleFactor - this.origin.y === this.origin.y) {\n                var yPos = this.origin.y - y * this.scaleFactor;\n                this.ctx.fillRect(this.origin.x - 5, yPos, 10, 1);\n                this.ctx.fillText(y.toFixed(precision), this.origin.x - 20, yPos + 5);\n            }\n        }\n    };\n    CartesianPlane.prototype.scalePlane = function (e) {\n        e.preventDefault();\n        // Get cursor position\n        var center = {\n            x: e.offsetX - this.origin.x,\n            y: -(e.offsetY - this.origin.y),\n        };\n        // Set ratio factor from  wheel movement direction\n        var delta = e.deltaY > 0 ? 0.95 : 1.05;\n        // Change scale accordingly to difference factor\n        this.scaleFactor *= delta;\n        // Calculate scale ratio from initial scale\n        if (this.scaleFactor >= this.initialScaleFactor)\n            this.scaleRatio = Math.floor(this.scaleFactor / this.initialScaleFactor);\n        else {\n            this.scaleRatio =\n                (1 / Math.ceil(this.initialScaleFactor / this.scaleFactor)) * 2;\n        }\n        console.log(this.scaleRatio);\n        // Set translation components proportionally to ratio factor\n        var dx = center.x * (1 - delta);\n        var dy = center.y * (1 - delta);\n        // Translate the origin with translation vector\n        this.origin.x += dx;\n        this.origin.y -= dy;\n        this.drawPlane();\n    };\n    CartesianPlane.prototype.translatePlane = function (e) {\n        var _this = this;\n        e.preventDefault();\n        // Get cursor initial position vector\n        var center = {\n            x: e.offsetX - this.origin.x,\n            y: e.offsetY - this.origin.y,\n        };\n        var signalController = new AbortController();\n        this.canvas.addEventListener('mousemove', function (e) {\n            // Get cursor position vector after movement\n            var newCenter = {\n                x: e.offsetX - _this.origin.x,\n                y: e.offsetY - _this.origin.y,\n            };\n            // Translate the plane in the direction of the difference vector\n            _this.origin.x += newCenter.x - center.x;\n            _this.origin.y += newCenter.y - center.y;\n            _this.drawPlane();\n            // Stop movement and remove event listener when mouse is out the canvas or up\n            ['mouseup', 'mouseout'].forEach(function (event) {\n                _this.canvas.addEventListener(event, function () {\n                    signalController.abort();\n                }, { once: true });\n            });\n        }, { signal: signalController.signal });\n    };\n    return CartesianPlane;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CartesianPlane);\n\n\n//# sourceURL=webpack://convolution_viz/./src/components/cartersianPlane/plane.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_cartersianPlane_plane__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/cartersianPlane/plane */ \"./src/components/cartersianPlane/plane.ts\");\n\nnew _components_cartersianPlane_plane__WEBPACK_IMPORTED_MODULE_0__[\"default\"]('canvas');\n\n\n//# sourceURL=webpack://convolution_viz/./src/main.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;