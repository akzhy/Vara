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
            d: 'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85',
            pl: 1
          }, {
            w: 1.103759765625,
            h: 1.549820899963379,
            my: 8.881500004827977,
            dx: 0,
            mx: 1,
            d: 'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
            pl: 1
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

            _this.render(); //window.requestAnimationFrame()

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
          _this2.fontCharacters[_char].paths[i].pl = svgPathData.getTotalLength();
        });
      });
      this.renderData.forEach(function (item) {
        item.currentlyDrawing = 0;
        item.startTime = false;
      });
      this.generateRenderData(this.renderData[1]);
    };

    _proto.render = function render(rafTime) {
      var _this3 = this;

      if (rafTime === void 0) {
        rafTime = 0;
      }

      this.ctx.clearRect(0, 0, 800, 800);
      this.draw(this.renderData[1], rafTime);
      window.requestAnimationFrame(function (time) {
        return _this3.render(time);
      });
    };

    _proto.draw = function draw(_textItem, rafTime) {
      var _this4 = this;

      var textItem = _textItem;
      this.ctx.strokeStyle = textItem.color;
      this.ctx.lineWidth = textItem.strokeWidth;
      this.ctx.fillStyle = 'transparent';
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      var scale = textItem.fontSize / this.SCALEBASE;
      var totalPathLength = textItem.render.reduce(function (a, c) {
        return a + c.pathLength;
      }, 0);

      if (!textItem.startTime) {
        textItem.startTime = rafTime;
      }

      textItem.render.forEach(function (item, itemIndex) {
        var pathDuration = item.pathLength / totalPathLength * textItem.duration / 1000;
        var delta = (rafTime - textItem.startTime) / 1000;
        var speed = item.pathLength / pathDuration;

        _this4.ctx.save();

        _this4.ctx.scale(scale, scale);

        _this4.ctx.setLineDash([item.dashOffset, item.pathLength]);

        if (textItem.currentlyDrawing === itemIndex) {
          console.log(textItem.currentlyDrawing, speed, delta);

          if (item.dashOffset >= item.pathLength) {
            textItem.currentlyDrawing += 1;
          }

          item.dashOffset += speed * delta;
        }

        _this4.ctx.stroke(new Path2D(_this4.processPath(item.path, item.x, item.y)));

        _this4.ctx.restore();
      });
      textItem.startTime = rafTime;
    }
    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    ;

    _proto.normalizeOptions = function normalizeOptions() {
      var _this5 = this;

      this.options = this.options || {};
      this.objectKeys(this.defaultOptions).forEach(function (optionKey) {
        if (_this5.options[optionKey] === undefined) {
          // @ts-ignore
          _this5.options[optionKey] = _this5.defaultOptions[optionKey];
        }
      });
      this.renderData.forEach(function (textItem, i) {
        if (typeof textItem === 'string') {
          _this5.renderData[i] = _extends({
            text: textItem
          }, _this5.defaultOptions);
        } else if (typeof textItem === 'object') {
          _this5.objectKeys(_this5.options).forEach(function (option) {
            if (textItem[option] === undefined) // @ts-ignore
              textItem[option] = _this5.options[option];
          });
        }
      });
      Object.keys(this.defaultCharacters).forEach(function (character) {
        if (_this5.fontCharacters[character] === undefined) {
          _this5.fontCharacters[character] = _this5.defaultCharacters[character];
        }
      });
    }
    /**
     * Calculates the position of each item on the canvas and returns the data required to render it.
     * @param {RenderData} _textItem A single text block that needs to be rendered.
     */
    ;

    _proto.generateRenderData = function generateRenderData(_textItem) {
      var _this6 = this;

      var textItem = _textItem;
      var scale = textItem.fontSize / this.SCALEBASE; // TODO: Create non breaking text

      if (!textItem.breakWord) {
        var textBlock = typeof textItem.text === 'string' ? [textItem.text] : textItem.text;
        var breakedTextBlock = textBlock.map(function (line) {
          return line.split(' ');
        });
        var lines = [{
          text: '',
          width: 0
        }];
        breakedTextBlock.forEach(function (line) {
          var spaceWidth = 0;
          line.forEach(function (word) {
            var wordWidth = 0;
            word.split('').forEach(function (letter) {
              var charCode = letter.charCodeAt(0);
              var currentLetter = _this6.fontCharacters[charCode] || _this6.fontCharacters['63'];
              var pathPositionCorrection = currentLetter.paths.reduce(function (a, c) {
                return a + c.mx - c.dx;
              }, 0);
              wordWidth += (currentLetter.w + pathPositionCorrection) * scale;
            });

            if (lines[lines.length - 1].width + wordWidth + 5 * scale + spaceWidth + textItem.x * scale > textItem.width) {
              lines.push({
                text: word + ' ',
                width: wordWidth
              });
              spaceWidth = 0;
            } else {
              lines[lines.length - 1] = {
                text: lines[lines.length - 1].text + word,
                width: lines[lines.length - 1].width + wordWidth
              };
              spaceWidth += _this6.WHITESPACE * scale;
              lines[lines.length - 1].text += ' ';
            }
          });
        });
        var posX = textItem.x / scale,
            posY = textItem.y / scale,
            top = textItem.fontSize * 1.2;
        lines.forEach(function (line) {
          var left = 0;
          var x = posX,
              y = posY;
          console.log(textItem.width, line.width, textItem.width - line.width);

          if (textItem.textAlign === 'center') {
            x = (textItem.width - line.width) / 2 / scale;
          }

          line.text.split('').forEach(function (letter) {
            if (letter === ' ') {
              left += _this6.WHITESPACE;
            } else {
              var currentLetter = _this6.fontCharacters[letter.charCodeAt(0)] || _this6.fontCharacters['63'];

              if (!textItem.render) {
                textItem.render = [];
              }

              currentLetter.paths.forEach(function (path) {
                textItem.render.push({
                  path: path.d,
                  x: x + left + path.mx - path.dx,
                  y: y + top - path.my,
                  pathLength: path.pl,
                  dashOffset: 0
                });
              });
              left += currentLetter.w;
            }
          });
          top += 30;
        });
      }
    }
    /**
     * Creates and returns an SVG element
     * @param n The name of the SVG node to be created
     * @param v The attributes of the node
     */
    ;

    _proto.createSVGNode = function createSVGNode(n, v) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', n);

      for (var p in v) {
        e.setAttributeNS(null, p.replace(/[A-Z]/g, function (m) {
          return '-' + m.toLowerCase();
        }), v[p]);
      }

      return e;
    }
    /**
     * Modifies the move to command of a given path and returns it.
     * @param path The path "d" property
     * @param x The x co-ordinate
     * @param y The y co-ordinate
     */
    ;

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

    _proto.boundRect = function boundRect(x, y, w, h) {
      if (h === void 0) {
        h = 10;
      }

      this.ctx.save();
      this.ctx.fillStyle = 'rgba(209, 56, 61,0.4)';
      this.ctx.fillRect(x, y, w, h);
      this.ctx.fill();
      this.ctx.restore();
    };

    return Vara;
  }();

  if (window) {
    window.Vara = Vara;
  }

})));
//# sourceMappingURL=vara.umd.development.js.map
