(function () {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var Vara =
  /*#__PURE__*/
  function () {
    function Vara(elem, fontSource, text, options) {
      _classCallCheck(this, Vara);

      this.elemntName = elem;
      this.element = document.querySelector(elem);
      this.fontSource = fontSource;
      this.options = options;
      this.textItems = text;
      this.rendered = false;
      this.defaultOptions = {
        fontSize: 21,
        strokeWidth: 0.5,
        color: "#000",
        id: false,
        duration: 1000,
        textAlign: "left",
        x: 0,
        y: 0,
        fromCurrentPosition: {
          x: true,
          y: true
        },
        autoAnimation: true,
        queued: true,
        delay: 0,
        breakWord: false,
        letterSpacing: {
          "global": 0
        }
      };
      this.defaultCharacters = {
        "63": {
          "paths": [{
            "w": 8.643798828125,
            "h": 14.231731414794922,
            "my": 22.666500004827977,
            "mx": 0,
            "pw": 28.2464542388916,
            "d": "m 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85"
          }, {
            "w": 1.103759765625,
            "h": 1.549820899963379,
            "my": 8.881500004827977,
            "mx": 1,
            "pw": 4.466640472412109,
            "d": "m 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z"
          }],
          "w": 8.643798828125
        },
        "space": {
          "paths": [{
            get d() {
              if (this.rendered) {
                return "M0,0 l" + this.fontProperties.space + " 0";
              }

              return false;
            },

            mx: 0,
            my: 0,

            get w() {
              if (this.rendered) {
                return this.fontProperties.space;
              }

              return false;
            },

            h: 0
          }],

          get w() {
            if (this.rendered) {
              return this.fontProperties.space;
            }

            return false;
          }

        }
      };
      this.svg = this.createNode("svg", {
        width: "100%"
      });
      this.element.appendChild(this.svg);
      this.init();
    }

    _createClass(Vara, [{
      key: "init",
      value: function init() {
        var _this = this;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', this.fontSource, true);

        xmlhttp.onreadystatechange = function () {
          if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
              var contents = JSON.parse(xmlhttp.responseText);
              _this.fontCharacters = contents.c;
              _this.fontProperties = contents.p;

              _this.render();
            }
          }
        };

        xmlhttp.send(null);
      }
    }, {
      key: "render",
      value: function render() {
        this.normalize();
        this.getLineCharacteristics(this.textItems[1]);
      }
    }, {
      key: "normalize",
      value: function normalize() {
        var _this2 = this;

        this.options = this.options || {};
        Object.keys(this.defaultOptions).forEach(function (option) {
          if (_this2.options[option] === undefined) _this2.options[option] = _this2.defaultOptions[option];
        });
        this.textItems.forEach(function (textItem, i) {
          if (typeof textItem === "string") {
            _this2.textItems[i] = _objectSpread2({
              text: textItem
            }, _this2.defaultOptions);
          } else if (_typeof(textItem) === "object") {
            Object.keys(_this2.options).forEach(function (option) {
              if (textItem[option] === undefined) _this2.textItems[option] = _this2.options[option];
            });
          }
        });
        Object.keys(this.defaultCharacters).forEach(function (character) {
          if (_this2.fontCharacters[character] === undefined) {
            _this2.fontCharacters[character] = _this2.defaultCharacters[character];
          }
        });
      }
    }, {
      key: "getLineCharacteristics",
      value: function getLineCharacteristics(textItem) {
        var _this3 = this;

        this.canvasOriginalWidth = this.svg.getBoundingClientRect().width;

        if (!textItem.breakWord) {
          var textBlock = typeof textItem.text === "string" ? [textItem.text] : textItem;
          var breakedTextBlock = textBlock.map(function (line) {
            return line.split(" ");
          });
          breakedTextBlock.forEach(function (word) {

            _toConsumableArray(word).forEach(function (letter) {
              var charCode = letter.charCodeAt(0);
              var currentLetter = _this3.fontCharacters[charCode] || _this3.fontCharacters["63"];
            });
          });
        }
      }
    }, {
      key: "createNode",
      value: function createNode(n, v) {
        n = document.createElementNS("http://www.w3.org/2000/svg", n);

        for (var p in v) {
          n.setAttributeNS(null, p.replace(/[A-Z]/g, function (m, p, o, s) {
            return "-" + m.toLowerCase();
          }), v[p]);
        }

        return n;
      }
    }]);

    return Vara;
  }();

  if (typeof module !== 'undefined') {
    module.exports = Vara;
  } else {
    window.Vara = Vara;
  }

}());
