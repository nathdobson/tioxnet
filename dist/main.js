/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (() => {

eval("function component() {\n    const element = document.createElement('div');\n\n    // Lodash, currently included via a script, is required for this line to work\n    element.innerHTML = _.join(['Hello', 'webpack'], ' ');\n\n    return element;\n}\n\ndocument.body.appendChild(component());\n\n// class Animation {\n//     constructor(canvas) {\n//         this.canvas = canvas\n//         this.devicePixelRatio = window.devicePixelRatio || 1;\n//         this.stageWidth = 300\n//         this.stageHeight = 200\n//     }\n//\n//     revalidate() {\n//         let rect = this.canvas.getBoundingClientRect();\n//         this.canvas.width = rect.width * devicePixelRatio;\n//         this.canvas.height = rect.height * devicePixelRatio;\n//         this.ctx = this.canvas.getContext(\"2d\");\n//         let hRatio = this.canvas.width / this.stageWidth;\n//         let vRatio = this.canvas.height / this.stageHeight;\n//         let ratio = Math.min(hRatio, vRatio);\n//         this.ctx.scale(ratio, ratio);\n//     }\n//\n//     repaint() {\n//         this.ctx.moveTo(0, 0);\n//         this.ctx.lineTo(195, 195);\n//         this.ctx.lineTo(300, 195);\n//         this.ctx.stroke();\n//     }\n// }\n//\n// class Simulation {\n//\n// }\n//\n// anim = new Animation(document.getElementById(\"rootCanvas\"))\n// anim.revalidate();\n// anim.repaint();\n//\n// window.addEventListener(\n//     'resize',\n//     function () {\n//         anim.revalidate();\n//         anim.repaint();\n//     },\n//     false);\n//\n\n\n//# sourceURL=webpack://tioxnet/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.js"]();
/******/ 	
/******/ })()
;