"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
require("./add.css");
var Add = /** @class */ (function (_super) {
    __extends(Add, _super);
    function Add(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { value: '' };
        _this.handleChange = _this.handleChange.bind(_this);
        _this.handleSubmit = _this.handleSubmit.bind(_this);
        return _this;
    }
    Add.prototype.handleChange = function (event) {
        this.setState({ value: event.target.value });
    };
    Add.prototype.handleSubmit = function (event) {
        alert('A event was submitted: ' + this.state.value);
        event.preventDefault();
    };
    Add.prototype.render = function () {
        return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", __assign({ className: "title" }, { children: "Add Event" }), void 0), (0, jsx_runtime_1.jsxs)("form", __assign({ onSubmit: this.handleSubmit }, { children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Event Name", (0, jsx_runtime_1.jsx)("input", { type: "text", value: this.state.value, onChange: this.handleChange }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("input", { type: "submit", value: "submit", className: "button-primary" }, void 0)] }), void 0)] }, void 0));
    };
    return Add;
}(react_1["default"].Component));
exports["default"] = Add;
