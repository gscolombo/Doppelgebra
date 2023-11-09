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

/***/ "./src/components/cartersianPlane/components/arrow.ts":
/*!************************************************************!*\
  !*** ./src/components/cartersianPlane/components/arrow.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar Axis = /** @class */ (function () {\n    function Axis(context, origin, x) {\n        if (x === void 0) { x = true; }\n        this.ctx = context;\n        this.markers = [];\n        this.origin = origin;\n        this.shape = this.drawShape(x);\n    }\n    Axis.prototype.drawShape = function (x) {\n        var path = new Path2D();\n        var width = this.ctx.canvas.width;\n        var height = this.ctx.canvas.height;\n        this.ctx.fillText('0', -7.5, -2.5, 16);\n        if (x) {\n            path.rect(-this.origin.x, 0, width, 1);\n            path.addPath(this.drawTip(width - this.origin.x, 0));\n            path.addPath(this.drawMarkers(width, 0));\n        }\n        else {\n            path.rect(0, this.origin.y - height, 1, height);\n            path.addPath(this.drawTip(0, this.origin.y));\n            path.addPath(this.drawMarkers(width, height, false));\n        }\n        this.ctx.fill(path);\n        return path;\n    };\n    Axis.prototype.drawTip = function (x, y) {\n        var tip = new Path2D();\n        tip.moveTo(x - 5, y - 5);\n        tip.lineTo(x, y);\n        x ? tip.lineTo(x - 5, y + 5) : tip.lineTo(x + 5, y - 5);\n        tip.lineTo(x, y);\n        tip.lineTo(x - 5, y - 5);\n        this.ctx.stroke(tip);\n        return tip;\n    };\n    Axis.prototype.drawMarkers = function (w, h, x) {\n        if (x === void 0) { x = true; }\n        var markers = new Path2D();\n        this.ctx.scale(1, -1);\n        if (x) {\n            var n = -1;\n            for (var i = -w / 11; i >= -(w + this.origin.x); i -= w / 11) {\n                markers.rect(i, -5, 1, 10);\n                this.ctx.fillText(\"\".concat(n--), i - 2.5, 15);\n            }\n            var m = 1;\n            for (var i = w / 11; i <= w - this.origin.x; i += w / 11) {\n                markers.rect(i, -5, 1, 10);\n                this.ctx.fillText(\"\".concat(m++), i - 2.5, 15);\n            }\n        }\n        else {\n            this.ctx.textAlign = 'right';\n            var p = 1;\n            for (var i = w / 11; i <= this.origin.y; i += w / 11) {\n                markers.rect(-5, i, 10, 1);\n                this.ctx.fillText(\"\".concat(p++), -10, -i + 2.5, 16);\n            }\n            var q = -1;\n            for (var i = -w / 11; i >= -h; i -= w / 11) {\n                markers.rect(-5, i, 10, 1);\n                this.ctx.fillText(\"\".concat(q--), -10, -i + 2.5, 16);\n            }\n        }\n        this.ctx.scale(1, -1);\n        return markers;\n    };\n    return Axis;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Axis);\n\n\n//# sourceURL=webpack://convolution_viz/./src/components/cartersianPlane/components/arrow.ts?");

/***/ }),

/***/ "./src/components/cartersianPlane/plane.ts":
/*!*************************************************!*\
  !*** ./src/components/cartersianPlane/plane.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _components_arrow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/arrow */ \"./src/components/cartersianPlane/components/arrow.ts\");\n\nvar CartesianPlane = /** @class */ (function () {\n    function CartesianPlane(canvas, context) {\n        this.zoomScale = 1;\n        this.canvas = canvas;\n        this.ctx = context;\n        this.origin = { x: context.getTransform().e, y: context.getTransform().f };\n        this.xaxis = new _components_arrow__WEBPACK_IMPORTED_MODULE_0__[\"default\"](context, this.origin);\n        this.yaxis = new _components_arrow__WEBPACK_IMPORTED_MODULE_0__[\"default\"](context, this.origin, false);\n        this.canvas.addEventListener('mousedown', this.canvasTranslation.bind(this));\n    }\n    CartesianPlane.prototype.canvasTranslation = function (e) {\n        var _this = this;\n        var refOrigin = { x: e.offsetX - this.origin.x - 0.5, y: e.offsetY - this.origin.y - 0.5 };\n        var abortControl = new AbortController();\n        this.canvas.addEventListener('mousemove', function (e) {\n            _this.translateCanvas(e, refOrigin, abortControl);\n            // Translate canvas context uniformly\n            var x = e.offsetX - (refOrigin.x - _this.origin.x) - 0.5;\n            var y = -(e.offsetY - (_this.origin.y - refOrigin.y) - 0.5);\n            var norm = Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);\n        }, { signal: abortControl.signal });\n    };\n    CartesianPlane.prototype.translateCanvas = function (e, origin, abortControl) {\n        var _this = this;\n        // Define translation vector\n        var x = (e.offsetX - origin.x - this.origin.x);\n        var y = -(e.offsetY - this.origin.y - origin.y);\n        var norm = Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);\n        // Translate canvas context with the mouse as reference point\n        this.ctx.translate(x, y);\n        this.ctx.save();\n        this.ctx.resetTransform();\n        this.ctx.clearRect(0, 0, this.canvas.width * 5, this.canvas.height * 5);\n        this.ctx.restore();\n        this.origin = { x: this.ctx.getTransform().e, y: this.ctx.getTransform().f };\n        // Redraw axes\n        this.xaxis = new _components_arrow__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.ctx, this.origin);\n        this.yaxis = new _components_arrow__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.ctx, this.origin, false);\n        ['mouseup', 'mouseout'].forEach(function (type) {\n            _this.canvas.addEventListener(type, function (e) {\n                abortControl.abort();\n            }, { once: true });\n        });\n    };\n    return CartesianPlane;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CartesianPlane);\n\n\n//# sourceURL=webpack://convolution_viz/./src/components/cartersianPlane/plane.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_cartersianPlane_plane__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/cartersianPlane/plane */ \"./src/components/cartersianPlane/plane.ts\");\n\nvar canvas = document.getElementById('canvas');\nvar ctx = canvas.getContext('2d');\ncanvas.width = innerWidth - 75;\ncanvas.height = innerHeight - 75;\nctx.translate(canvas.width / 2, canvas.height / 2);\nctx.scale(1, -1);\nvar plane = new _components_cartersianPlane_plane__WEBPACK_IMPORTED_MODULE_0__[\"default\"](canvas, ctx);\n\n\n//# sourceURL=webpack://convolution_viz/./src/main.ts?");

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