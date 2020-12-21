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
        width: this.element.getBoundingClientRect().width,
        lineHeight: 30
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
      this.contextHeight = 0;
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
    }
    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    ;

    _proto.normalizeOptions = function normalizeOptions() {
      var _this2 = this;

      this.options = this.options || {};
      this.objectKeys(this.defaultOptions).forEach(function (optionKey) {
        if (_this2.options[optionKey] === undefined) {
          // @ts-ignore
          _this2.options[optionKey] = _this2.defaultOptions[optionKey];
        }
      });
      this.renderData.forEach(function (textItem, i) {
        if (typeof textItem === 'string') {
          _this2.renderData[i] = _extends({
            text: textItem
          }, _this2.defaultOptions);
        } else if (typeof textItem === 'object') {
          _this2.objectKeys(_this2.options).forEach(function (option) {
            if (textItem[option] === undefined) // @ts-ignore
              textItem[option] = _this2.options[option];
          });
        }
      });
      Object.keys(this.defaultCharacters).forEach(function (character) {
        if (_this2.fontCharacters[character] === undefined) {
          _this2.fontCharacters[character] = _this2.defaultCharacters[character];
        }
      });
    };

    _proto.preRender = function preRender() {
      var _this3 = this;

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
        _this3.fontCharacters[_char].paths.forEach(function (path, i) {
          svgPathData.setAttributeNS(null, 'd', path.d);
          _this3.fontCharacters[_char].paths[i].dx = svgPathData.getBoundingClientRect().x;
          _this3.fontCharacters[_char].paths[i].pl = svgPathData.getTotalLength();
        });
      });
      this.renderData.forEach(function (item) {
        item.currentlyDrawing = 0;
        item.startTime = false;
      });
      this.generateRenderData(this.renderData[0]);
    };

    _proto.render = function render(rafTime) {
      var _this4 = this;

      if (rafTime === void 0) {
        rafTime = 0;
      }

      var canvasHeight = this.calculateCanvasHeight();

      if (canvasHeight !== this.canvas.height) {
        this.canvas.height = canvasHeight;
      }

      this.ctx.clearRect(0, 0, 800, canvasHeight);
      this.draw(this.renderData[0], rafTime);
      window.requestAnimationFrame(function (time) {
        return _this4.render(time);
      });
    };

    _proto.draw = function draw(_textItem, rafTime) {
      var _this5 = this;

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

        _this5.ctx.save();

        _this5.ctx.scale(scale, scale);

        _this5.ctx.lineDashOffset = 1;

        _this5.ctx.setLineDash([item.dashOffset, item.pathLength + 1]);

        if (textItem.currentlyDrawing === itemIndex) {
          if (item.dashOffset >= item.pathLength) {
            textItem.currentlyDrawing += 1;
          }

          item.dashOffset += speed * delta;
        }

        _this5.ctx.stroke(new Path2D(_this5.processPath(item.path, item.x, item.y)));

        _this5.ctx.restore();
      });
      textItem.startTime = rafTime;
    }
    /**
     * Calculates the position of each item on the canvas and returns the data required to render it.
     * @param {RenderData} _textItem A single text block that needs to be rendered.
     */
    ;

    _proto.generateRenderData = function generateRenderData(_textItem) {
      var _this6 = this;

      var textItem = _textItem;
      var scale = textItem.fontSize / this.SCALEBASE;
      textItem.height = 0; // TODO: Create non breaking text

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
            posY = this.getTopPosition(0) / scale + textItem.y / scale,
            top = textItem.lineHeight;

        if (!textItem.render) {
          textItem.render = [];
        }

        lines.forEach(function (line) {
          var left = 0;
          var x = posX,
              y = posY;

          if (textItem.textAlign === 'center') {
            x = (textItem.width - line.width) / 2 / scale;
          }

          line.text.split('').forEach(function (letter) {
            if (letter === ' ') {
              left += _this6.WHITESPACE;
            } else {
              var currentLetter = _this6.fontCharacters[letter.charCodeAt(0)] || _this6.fontCharacters['63'];

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
          top += textItem.lineHeight;

          if (!textItem.absolutePosition) {
            console.log(textItem.height, textItem.lineHeight);
            textItem.height += textItem.lineHeight * scale;
          }
        });
      }
    };

    _proto.calculateCanvasHeight = function calculateCanvasHeight() {
      var height = 0;
      this.renderData.forEach(function (item) {
        if (item.height && item.y) {
          height += item.height + item.y;
        }
      });
      return height + 50;
    };

    _proto.getTopPosition = function getTopPosition(i) {
      if (i === 0) return 0;else return 1;
    };

    _proto.alterText = function alterText(id, text, letterAnimate) {
      var _this$renderData$id$r;

      this.renderData[id].currentlyDrawing = 0;
      this.renderData[id].render = [];
      this.renderData[id].text = text;
      var shouldAnimate = letterAnimate(text);
      this.generateRenderData(this.renderData[id]);
      (_this$renderData$id$r = this.renderData[id].render) === null || _this$renderData$id$r === void 0 ? void 0 : _this$renderData$id$r.forEach(function (item, i) {
        if (!shouldAnimate.includes(i)) {
          item.dashOffset = item.pathLength;
        }
      });
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
