(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var Vara = /*#__PURE__*/function () {
    function Vara(elem, fontSource, text, options) {
      this.elementName = elem;
      this.element = document.querySelector(elem);
      this.fontSource = fontSource;
      this.options = options;
      this.textItems = text;
      this.renderData = text;
      this.rendered = false;
      this.fontCharacters = {};
      this.canvasWidth = 0;
      this.defaultOptions = {
        fontSize: 21,
        strokeWidth: 0.5,
        color: '#000',
        duration: 1000,
        textAlign: 'left',
        autoAnimation: true,
        queued: true,
        delay: 0,
        breakWord: false,
        letterSpacing: {
          global: 0
        },
        width: this.element.getBoundingClientRect().width
      };
      this.defaultCharacters = {
        '63': {
          paths: [{
            w: 8.643798828125,
            h: 14.231731414794922,
            my: 22.666500004827977,
            mx: 0,
            dx: 0,
            d: 'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85'
          }, {
            w: 1.103759765625,
            h: 1.549820899963379,
            my: 8.881500004827977,
            dx: 0,
            mx: 1,
            d: 'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z'
          }],
          w: 8.643798828125
        }
      };
      this.canvas = document.createElement('canvas');
      this.canvas.width = 800;
      this.canvas.height = 800;
      this.ctx = this.canvas.getContext('2d');
      this.element.appendChild(this.canvas);
      this.WHITESPACE = 10;
      this.SCALEBASE = 16;
      this.init();
    }

    var _proto = Vara.prototype;

    _proto.init = function init() {
      var _this = this;

      this.normalizeOptions();
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open('GET', this.fontSource, true);

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            var contents = JSON.parse(xmlhttp.responseText);
            _this.fontCharacters = contents.c;
            _this.fontProperties = contents.p;

            _this.preRender();

            _this.render();
          }
        }
      };

      xmlhttp.send(null);
    };

    _proto.preRender = function preRender() {
      var _this2 = this;

      var svg = this.createSVGNode('svg', {
        width: '100',
        height: '100'
      });
      svg.style.position = 'absolute';
      svg.style.zIndex = '-100';
      svg.style.opacity = '0';
      svg.style.top = '0';
      document.body.appendChild(svg);
      var svgPathData = this.createSVGNode('path', {
        d: ''
      });
      svg.appendChild(svgPathData);
      this.objectKeys(this.fontCharacters).forEach(function (_char) {
        _this2.fontCharacters[_char].paths.forEach(function (path, i) {
          svgPathData.setAttributeNS(null, 'd', path.d);
          _this2.fontCharacters[_char].paths[i].dx = svgPathData.getBoundingClientRect().x;
        });
      });
    };

    _proto.render = function render() {
      this.calculatePositions(this.renderData[1]);
      this.draw(this.renderData[1]);
    };

    _proto.draw = function draw(_textItem) {
      var _this3 = this;

      // path - "d": "m 0,0 c 1.677946,-5.44834,5.875964,-14.09066,3.788545,-14.26551,-1.909719,-0.15996,-2.796112,9.62055,-3.788545,14.26551 z"
      var textItem = _textItem;
      this.ctx.strokeStyle = textItem.color;
      this.ctx.lineWidth = textItem.strokeWidth;
      this.ctx.fillStyle = 'transparent';
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      var top = 0;
      var scale = textItem.fontSize / this.SCALEBASE;
      textItem.render.forEach(function (textLine) {
        var left = textLine.x / 2;
        textLine.text.split('').forEach(function (letter) {
          var charCode = letter.charCodeAt(0);

          if (letter === ' ') {
            left += _this3.WHITESPACE;
          } else if (_this3.fontCharacters[charCode]) {
            _this3.ctx.save();

            _this3.ctx.scale(scale, scale);

            _this3.fontCharacters[charCode].paths.forEach(function (path) {
              var processedPath = _this3.processPath(path.d, left + path.mx - path.dx, textLine.y + top + 20 - path.my + 1);

              _this3.ctx.stroke(new Path2D(processedPath));
            });

            left += _this3.fontCharacters[charCode].w;

            _this3.ctx.restore();
          }
        });
        top += 30;
      });
    };

    _proto.normalizeOptions = function normalizeOptions() {
      var _this4 = this;

      this.options = this.options || {};
      this.objectKeys(this.defaultOptions).forEach(function (optionKey) {
        if (_this4.options[optionKey] === undefined) {
          // @ts-ignore
          _this4.options[optionKey] = _this4.defaultOptions[optionKey];
        }
      });
      this.renderData.forEach(function (textItem, i) {
        if (typeof textItem === 'string') {
          _this4.renderData[i] = _extends({
            text: textItem
          }, _this4.defaultOptions);
        } else if (typeof textItem === 'object') {
          _this4.objectKeys(_this4.options).forEach(function (option) {
            if (textItem[option] === undefined) // @ts-ignore
              textItem[option] = _this4.options[option];
          });
        }
      });
      Object.keys(this.defaultCharacters).forEach(function (character) {
        if (_this4.fontCharacters[character] === undefined) {
          _this4.fontCharacters[character] = _this4.defaultCharacters[character];
        }
      });
    };

    _proto.calculatePositions = function calculatePositions(_textItem) {
      var _this5 = this;

      var textItem = _textItem;
      var scale = textItem.fontSize / this.SCALEBASE; // TODO: Create non breaking text

      if (!textItem.breakWord) {
        var textBlock = typeof textItem.text === 'string' ? [textItem.text] : textItem.text;
        var breakedTextBlock = textBlock.map(function (line) {
          return line.split(' ');
        });
        var lines = [{
          text: "",
          width: 0
        }];
        breakedTextBlock.forEach(function (line) {
          var spaceWidth = 0;
          line.forEach(function (word) {
            var wordWidth = 0;
            word.split('').forEach(function (letter) {
              var charCode = letter.charCodeAt(0);
              var currentLetter = _this5.fontCharacters[charCode] || _this5.fontCharacters['63'];
              var pathPositionCorrection = currentLetter.paths.reduce(function (a, c) {
                return a + c.mx - c.dx;
              }, 0);
              wordWidth += (currentLetter.w + pathPositionCorrection) * scale;
            });

            if (lines[lines.length - 1].width + wordWidth + spaceWidth + textItem.x * scale > textItem.width) {
              lines.push({
                text: word,
                width: wordWidth
              });
              spaceWidth = 0;
            } else {
              lines[lines.length - 1] = {
                text: lines[lines.length - 1].text + word,
                width: lines[lines.length - 1].width + wordWidth
              };
              spaceWidth += _this5.WHITESPACE * scale;
              lines[lines.length - 1].text += ' ';
            }
          });
        });
        lines.forEach(function (line) {
          console.log(line.text, line.width);
          var x = textItem.x;

          if (textItem.textAlign === "center") {
            console.log(line.width, (textItem.width - line.width) / 2);
            x = (textItem.width - line.width) / 2;
          }

          if (textItem.render) {
            textItem.render.push({
              text: line.text,
              x: x,
              y: textItem.y
            });
          } else {
            textItem.render = [{
              text: line.text,
              x: x,
              y: textItem.y
            }];
          }
        });
      }
    };

    _proto.createSVGNode = function createSVGNode(n, v) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', n);

      for (var p in v) {
        e.setAttributeNS(null, p.replace(/[A-Z]/g, function (m) {
          return '-' + m.toLowerCase();
        }), v[p]);
      }

      return e;
    };

    _proto.processPath = function processPath(path, x, y) {
      if (x === void 0) {
        x = 0;
      }

      if (y === void 0) {
        y = 0;
      }

      var svgPath = path.split('');
      svgPath[2] = x + 1 + '';
      svgPath[4] = y + '';
      return svgPath.join('');
    };

    _proto.objectKeys = function objectKeys(x) {
      var keys = Object.keys(x);
      return keys;
    };

    return Vara;
  }();

  if (window) {
    window.Vara = Vara;
  }

})));
//# sourceMappingURL=vara.umd.development.js.map
