'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _formDataToObject = require('form-data-to-object');

var _formDataToObject2 = _interopRequireDefault(_formDataToObject);

var _validationRules = require('./validationRules.js');

var _validationRules2 = _interopRequireDefault(_validationRules);

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _Mixin = require('./Mixin.js');

var _Mixin2 = _interopRequireDefault(_Mixin);

var _HOC = require('./HOC.js');

var _HOC2 = _interopRequireDefault(_HOC);

var _Decorator = require('./Decorator.js');

var _Decorator2 = _interopRequireDefault(_Decorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = global.React || require('react');

var options = {};
var emptyArray = [];
var Formsy = {};

Formsy.HOC = _HOC2.default;
Formsy.Decorator = _Decorator2.default;
Formsy.Mixin = _Mixin2.default;

Formsy.defaults = function (passedOptions) {
  options = passedOptions;
};

Formsy.addValidationRule = function (name, func) {
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (!force && Object.keys(_validationRules2.default).indexOf(name) !== -1) {
    console.error('A Validation Rule with that name already exists: ' + name);
    return;
  }
  _validationRules2.default[name] = func;
};

var Form = function (_React$Component) {
  _inherits(Form, _React$Component);

  function Form() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Form);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _this.displayName = 'Formsy', _this.state = {
      isValid: true,
      isSubmitting: false,
      canChange: false
    }, _this.reset = function (data) {
      _this.setFormPristine(true);
      _this.resetModel(data);
    }, _this.submit = function (event) {
      event && event.preventDefault();

      // Trigger form as not pristine.
      // If any inputs have not been touched yet this will make them dirty
      // so validation becomes visible (if based on isPristine)
      _this.setFormPristine(false);
      var model = _this.getModel();
      _this.props.onSubmit(model, _this.resetModel.bind(_this), _this.updateInputsWithError.bind(_this));
      _this.state.isValid ? _this.props.onValidSubmit(model, _this.resetModel.bind(_this), _this.updateInputsWithError.bind(_this)) : _this.props.onInvalidSubmit(model, _this.resetModel.bind(_this), _this.updateInputsWithError.bind(_this));
    }, _this.isFormDisabled = function () {
      return _this.props.disabled || false;
    }, _this.validate = function (component) {
      // Trigger onChange
      if (_this.state.canChange) {
        _this.props.onChange(_this.getCurrentValues(), _this.isChanged());
      }

      var validation = _this.runValidation(component);
      // Run through the validations, split them up and call
      // the validator IF there is a value or it is required
      component.setState({
        _isValid: validation.isValid,
        _isRequired: validation.isRequired,
        _validationError: validation.error,
        _externalError: null
      }, _this.validateForm);
    }, _this.validateForm = function () {
      // We need a callback as we are validating all inputs again. This will
      // run when the last component has set its state
      var onValidationComplete = function () {
        var allIsValid = this.inputs.every(function (component) {
          return component.state._isValid;
        });

        this.setState({
          isValid: allIsValid
        });

        if (allIsValid) {
          this.props.onValid();
        } else {
          this.props.onInvalid();
        }

        // Tell the form that it can start to trigger change events
        this.setState({
          canChange: true
        });
      }.bind(_this);

      // Run validation again in case affected by other inputs. The
      // last component validated will run the onValidationComplete callback
      _this.inputs.forEach(function (component, index) {
        var validation = _this.runValidation(component);
        if (validation.isValid && component.state._externalError) {
          validation.isValid = false;
        }
        component.setState({
          _isValid: validation.isValid,
          _isRequired: validation.isRequired,
          _validationError: validation.error,
          _externalError: !validation.isValid && component.state._externalError ? component.state._externalError : null
        });
      });

      onValidationComplete();

      // If there are no inputs, set state where form is ready to trigger
      // change event. New inputs might be added later
      if (!_this.inputs.length) {
        _this.setState({
          canChange: true
        });
      }
    }, _this.attachToForm = function (component) {
      if (_this.inputs.indexOf(component) === -1) {
        _this.inputs.push(component);
      }

      _this.validate(component);
    }, _this.detachFromForm = function (component) {
      var componentPos = _this.inputs.indexOf(component);

      if (componentPos !== -1) {
        _this.inputs = _this.inputs.slice(0, componentPos).concat(_this.inputs.slice(componentPos + 1));
      }

      _this.validateForm();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Form, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      return {
        formsy: {
          attachToForm: this.attachToForm,
          detachFromForm: this.detachFromForm,
          validate: this.validate,
          isFormDisabled: this.isFormDisabled,
          isValidValue: function isValidValue(component, value) {
            return _this2.runValidation(component, value).isValid;
          }
        }
      };
    }

    // Add a map to store the inputs of the form, a model to store
    // the values of the form and register child inputs

  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.inputs = [];
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.validateForm();
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      // Keep a reference to input names before form updates,
      // to check if inputs has changed after render
      this.prevInputNames = this.inputs.map(function (component) {
        return component.props.name;
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.props.validationErrors && _typeof(this.props.validationErrors) === 'object' && Object.keys(this.props.validationErrors).length > 0) {
        this.setInputValidationErrors(this.props.validationErrors);
      }

      var newInputNames = this.inputs.map(function (component) {
        return component.props.name;
      });
      if (_utils2.default.arraysDiffer(this.prevInputNames, newInputNames)) {
        this.validateForm();
      }
    }

    // Allow resetting to specified data


    // Update model, submit to url prop and send the model

  }, {
    key: 'mapModel',
    value: function mapModel(model) {
      if (this.props.mapping) {
        return this.props.mapping(model);
      } else {
        return _formDataToObject2.default.toObj(Object.keys(model).reduce(function (mappedModel, key) {

          var keyArray = key.split('.');
          var base = mappedModel;
          while (keyArray.length) {
            var currentKey = keyArray.shift();
            base = base[currentKey] = keyArray.length ? base[currentKey] || {} : model[key];
          }

          return mappedModel;
        }, {}));
      }
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      var currentValues = this.getCurrentValues();
      return this.mapModel(currentValues);
    }

    // Reset each key in the model to the original / initial / specified value

  }, {
    key: 'resetModel',
    value: function resetModel(data) {
      this.inputs.forEach(function (component) {
        var name = component.props.name;
        if (data && data.hasOwnProperty(name)) {
          component.setValue(data[name]);
        } else {
          component.resetValue();
        }
      });
      this.validateForm();
    }
  }, {
    key: 'setInputValidationErrors',
    value: function setInputValidationErrors(errors) {
      this.inputs.forEach(function (component) {
        var name = component.props.name;
        var args = [{
          _isValid: !(name in errors),
          _validationError: typeof errors[name] === 'string' ? [errors[name]] : errors[name]
        }];
        component.setState.apply(component, args);
      });
    }

    // Checks if the values have changed from their initial value

  }, {
    key: 'isChanged',
    value: function isChanged() {
      return !_utils2.default.isSame(this.getPristineValues(), this.getCurrentValues());
    }
  }, {
    key: 'getPristineValues',
    value: function getPristineValues() {
      return this.inputs.reduce(function (data, component) {
        var name = component.props.name;
        data[name] = component.props.value;
        return data;
      }, {});
    }

    // Go through errors from server and grab the components
    // stored in the inputs map. Change their state to invalid
    // and set the serverError message

  }, {
    key: 'updateInputsWithError',
    value: function updateInputsWithError(errors) {
      var _this3 = this;

      Object.keys(errors).forEach(function (name, index) {
        var component = _utils2.default.find(_this3.inputs, function (component) {
          return component.props.name === name;
        });
        if (!component) {
          throw new Error('You are trying to update an input that does not exist. ' + 'Verify errors object with input names. ' + JSON.stringify(errors));
        }
        var args = [{
          _isValid: _this3.props.preventExternalInvalidation || false,
          _externalError: typeof errors[name] === 'string' ? [errors[name]] : errors[name]
        }];
        component.setState.apply(component, args);
      }, this);
    }
  }, {
    key: 'getCurrentValues',
    value: function getCurrentValues() {
      return this.inputs.reduce(function (data, component) {
        var name = component.props.name;
        data[name] = component.state._value;
        return data;
      }, {});
    }
  }, {
    key: 'setFormPristine',
    value: function setFormPristine(isPristine) {
      this.setState({
        _formSubmitted: !isPristine
      });

      // Iterate through each component and set it as pristine
      // or "dirty".
      this.inputs.forEach(function (component, index) {
        component.setState({
          _formSubmitted: !isPristine,
          _isPristine: isPristine
        });
      });
    }

    // Use the binded values and the actual input value to
    // validate the input and set its state. Then check the
    // state of the form itself

  }, {
    key: 'runValidation',


    // Checks validation on current value or a passed value
    value: function runValidation(component, value) {
      var currentValues = this.getCurrentValues();
      var validationErrors = component.props.validationErrors;
      var validationError = component.props.validationError;
      value = arguments.length === 2 ? value : component.state._value;

      var validationResults = this.runRules(value, currentValues, component._validations);
      var requiredResults = this.runRules(value, currentValues, component._requiredValidations);

      // the component defines an explicit validate function
      if (typeof component.validate === "function") {
        validationResults.failed = component.validate() ? [] : [{ method: 'failed' }];
      }

      var isRequired = Object.keys(component._requiredValidations).length ? !!requiredResults.success.length : false;
      var isValid = !validationResults.failed.length && !(this.props.validationErrors && this.props.validationErrors[component.props.name]);

      return {
        isRequired: isRequired,
        isValid: isRequired ? false : isValid,
        error: function () {

          if (isValid && !isRequired) {
            return emptyArray;
          }

          if (validationResults.errors.length) {
            return validationResults.errors;
          }

          if (this.props.validationErrors && this.props.validationErrors[component.props.name]) {
            return typeof this.props.validationErrors[component.props.name] === 'string' ? [this.props.validationErrors[component.props.name]] : this.props.validationErrors[component.props.name];
          }

          if (isRequired) {
            var error = validationErrors[requiredResults.success[0]];
            return error ? [error] : null;
          }

          return validationResults.failed.map(function (failed) {
            var errorMessage = validationErrors && validationErrors[failed.method] ? validationErrors[failed.method] : validationError;

            failed.args && [].concat(failed.args).forEach(function (arg, i) {
              errorMessage = errorMessage.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
            });

            return errorMessage;
          }).filter(function (x, pos, arr) {
            // Remove duplicates
            return arr.indexOf(x) === pos;
          });
        }.call(this)
      };
    }
  }, {
    key: 'runRules',
    value: function runRules(value, currentValues, validations) {
      var results = {
        errors: [],
        failed: [],
        success: []
      };
      if (Object.keys(validations).length) {
        Object.keys(validations).forEach(function (validationMethod) {

          if (_validationRules2.default[validationMethod] && typeof validations[validationMethod] === 'function') {
            throw new Error('Formsy does not allow you to override default validations: ' + validationMethod);
          }

          if (!_validationRules2.default[validationMethod] && typeof validations[validationMethod] !== 'function') {
            throw new Error('Formsy does not have the validation rule: ' + validationMethod);
          }

          if (typeof validations[validationMethod] === 'function') {
            var validation = validations[validationMethod](currentValues, value);
            if (typeof validation === 'string') {
              results.errors.push(validation);
              results.failed.push({ method: validationMethod });
            } else if (!validation) {
              results.failed.push({ method: validationMethod });
            }
            return;
          } else if (typeof validations[validationMethod] !== 'function') {
            var validation = _validationRules2.default[validationMethod](currentValues, value, validations[validationMethod]);
            if (typeof validation === 'string') {
              results.errors.push(validation);
              results.failed.push({ method: validationMethod, args: validations[validationMethod] });
            } else if (!validation) {
              results.failed.push({ method: validationMethod, args: validations[validationMethod] });
            } else {
              results.success.push(validationMethod);
            }
            return;
          }

          return results.success.push(validationMethod);
        });
      }

      return results;
    }

    // Validate the form by going through all child input components
    // and check their state


    // Method put on each input component to register
    // itself to the form


    // Method put on each input component to unregister
    // itself from the form

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          mapping = _props.mapping,
          validationErrors = _props.validationErrors,
          onSubmit = _props.onSubmit,
          onValid = _props.onValid,
          onValidSubmit = _props.onValidSubmit,
          onInvalid = _props.onInvalid,
          onInvalidSubmit = _props.onInvalidSubmit,
          onChange = _props.onChange,
          reset = _props.reset,
          preventExternalInvalidation = _props.preventExternalInvalidation,
          onSuccess = _props.onSuccess,
          onError = _props.onError,
          nonFormsyProps = _objectWithoutProperties(_props, ['mapping', 'validationErrors', 'onSubmit', 'onValid', 'onValidSubmit', 'onInvalid', 'onInvalidSubmit', 'onChange', 'reset', 'preventExternalInvalidation', 'onSuccess', 'onError']);

      return React.createElement(
        'form',
        _extends({}, nonFormsyProps, { onSubmit: this.submit }),
        this.props.children
      );
    }
  }]);

  return Form;
}(React.Component);

Form.childContextTypes = {
  formsy: _propTypes2.default.object
};
Form.defaultProps = {
  onSuccess: function onSuccess() {},
  onError: function onError() {},
  onSubmit: function onSubmit() {},
  onValidSubmit: function onValidSubmit() {},
  onInvalidSubmit: function onInvalidSubmit() {},
  onValid: function onValid() {},
  onInvalid: function onInvalid() {},
  onChange: function onChange() {},
  validationErrors: null,
  preventExternalInvalidation: false
};
;

Formsy.Form = Form;

if (!global.exports && !global.module && (!global.define || !global.define.amd)) {
  global.Formsy = Formsy;
}

module.exports = Formsy;