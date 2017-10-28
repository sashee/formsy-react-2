'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = global.React || require('react');


var convertValidationsToObject = function convertValidationsToObject(validations) {
  if (typeof validations === 'string') {

    return validations.split(/\,(?![^{\[]*[}\]])/g).reduce(function (validations, validation) {
      var args = validation.split(':');
      var validateMethod = args.shift();

      args = args.map(function (arg) {
        try {
          return JSON.parse(arg);
        } catch (e) {
          return arg; // It is a string if it can not parse it
        }
      });

      if (args.length > 1) {
        throw new Error('Formsy does not support multiple args on string validations. Use object format of validations instead.');
      }

      validations[validateMethod] = args.length ? args[0] : true;
      return validations;
    }, {});
  }

  return validations || {};
};

var Mixin = function (_React$PureComponent) {
  _inherits(Mixin, _React$PureComponent);

  function Mixin() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Mixin);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Mixin.__proto__ || Object.getPrototypeOf(Mixin)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      _value: _this.props.value,
      _isRequired: false,
      _isValid: true,
      _isPristine: true,
      _pristineValue: _this.props.value,
      _validationError: [],
      _externalError: null,
      _formSubmitted: false
    }, _this.removeFormsyProps = function (props) {
      var requiredError = props.requiredError,
          validations = props.validations,
          validationError = props.validationError,
          validationErrors = props.validationErrors,
          rest = _objectWithoutProperties(props, ['requiredError', 'validations', 'validationError', 'validationErrors']);

      return rest;
    }, _this.setValidations = function (validations, required) {
      // Add validations to the store itself as the props object can not be modified
      _this._validations = convertValidationsToObject(validations) || {};
      _this._requiredValidations = required === true ? { isDefaultRequiredValue: true } : convertValidationsToObject(required);
    }, _this.setValue = function (value) {
      _this.setState({
        _value: value,
        _isPristine: false
      }, function () {
        _this.context.formsy.validate(_this);
      });
    }, _this.resetValue = function () {
      _this.setState({
        _value: _this.state._pristineValue,
        _isPristine: true
      }, function () {
        _this.context.formsy.validate(_this);
      });
    }, _this.getValue = function () {
      return _this.state._value;
    }, _this.hasValue = function () {
      return _this.state._value !== '';
    }, _this.getErrorMessage = function () {
      var messages = _this.getErrorMessages();
      return messages.length ? messages[0] : null;
    }, _this.getErrorMessages = function () {
      var isRequiredError = _this.isRequired() && !_this.isPristine() && !_this.isValid() && _this.isFormSubmitted() && _this.props.requiredError;

      return !_this.isValid() || _this.showRequired() ? _this.state._externalError || _this.state._validationError || isRequiredError && [isRequiredError] || [] : [];
    }, _this.isFormDisabled = function () {
      return _this.context.formsy.isFormDisabled();
    }, _this.isValid = function () {
      return _this.state._isValid;
    }, _this.isPristine = function () {
      return _this.state._isPristine;
    }, _this.isFormSubmitted = function () {
      return _this.state._formSubmitted;
    }, _this.isRequired = function () {
      return !!_this.props.required;
    }, _this.showRequired = function () {
      return _this.state._isRequired;
    }, _this.showError = function () {
      return !_this.showRequired() && !_this.isValid();
    }, _this.isValidValue = function (value) {
      return _this.context.formsy.isValidValue.call(null, _this, value);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Mixin, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      var configure = function configure() {
        _this2.setValidations(_this2.props.validations, _this2.props.required);
        _this2.context.formsy.attachToForm(_this2);
      };

      if (!this.props.name) {
        throw new Error('Form Input requires a name property when used');
      }

      configure();
    }

    // We have to make the validate method is kept when new props are added

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setValidations(nextProps.validations, nextProps.required);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      // If the value passed has changed, set it. If value is not passed it will
      // internally update, and this will never run
      if (!_utils2.default.isSame(this.props.value, prevProps.value)) {
        this.setValue(this.props.value);
      }

      // If validations or required is changed, run a new validation
      if (!_utils2.default.isSame(this.props.validations, prevProps.validations) || !_utils2.default.isSame(this.props.required, prevProps.required)) {
        this.context.formsy.validate(this);
      }
    }

    // Detach it when component unmounts

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.context.formsy.detachFromForm(this);
    }

    // We validate after the value has been set

  }], [{
    key: 'defaultProps',
    get: function get() {
      return {
        validationError: '',
        validationErrors: {}
      };
    },
    set: function set(props) {
      Object.assign(Mixin.defaultProps, props);
    }
  }]);

  return Mixin;
}(React.PureComponent);

Mixin.propTypes = {
  requiredError: _propTypes2.default.string,
  validationError: _propTypes2.default.string,
  validationErrors: _propTypes2.default.object,
  validations: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object])
};
Mixin.contextTypes = {
  formsy: _propTypes2.default.object // What about required?
};
exports.default = Mixin;
;