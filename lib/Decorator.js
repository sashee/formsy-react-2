'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _HOC = require('./HOC');

var _HOC2 = _interopRequireDefault(_HOC);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = global.React || require('react');

exports.default = function () {
  return function (Component) {
    return (0, _HOC2.default)(function (props) {
      return React.createElement(Component, props);
    });
  };
};