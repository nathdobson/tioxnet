/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunktioxnet"] = self["webpackChunktioxnet"] || []).push([["index"],{

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (() => {

eval("class Animation {\n    constructor(canvas) {\n        this.canvas = canvas\n        this.devicePixelRatio = window.devicePixelRatio || 1;\n        this.stageWidth = 300\n        this.stageHeight = 200\n    }\n\n    revalidate() {\n        let rect = this.canvas.getBoundingClientRect();\n        this.canvas.width = rect.width * devicePixelRatio;\n        this.canvas.height = rect.height * devicePixelRatio;\n        this.ctx = this.canvas.getContext(\"2d\");\n        let hRatio = this.canvas.width / this.stageWidth;\n        let vRatio = this.canvas.height / this.stageHeight;\n        let ratio = Math.min(hRatio, vRatio);\n        this.ctx.scale(ratio, ratio);\n    }\n\n    repaint() {\n        this.ctx.moveTo(0, 0);\n        this.ctx.lineTo(195, 195);\n        this.ctx.lineTo(300, 195);\n        this.ctx.stroke();\n    }\n}\n\nclass Simulation {\n\n}\n\nanim = new Animation(document.getElementById(\"rootCanvas\"))\nanim.revalidate();\nanim.repaint();\n\nwindow.addEventListener(\n    'resize',\n    function () {\n        anim.revalidate();\n        anim.repaint();\n    },\n    false);\n\n\n\n//# sourceURL=webpack://tioxnet/./src/index.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.js"));
/******/ }
]);