(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.vara = {}));
}(this, (function (exports) { 'use strict';

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var SCALEBASE = 16;
  var WHITESPACE = 10;

  var BLOCK_COMPOSITION = ["block", "line", "letter", "letterPart"];

  var RenderBase = /*#__PURE__*/function () {
    function RenderBase(props) {
      var _props$parent;

      this.ctx = props.ctx;
      this.parent = (_props$parent = props.parent) !== null && _props$parent !== void 0 ? _props$parent : null;
      this.name = 'block';
    }

    var _proto = RenderBase.prototype;

    _proto.getParent = function getParent(parentName, current) {
      var parentIndex = BLOCK_COMPOSITION.indexOf(parentName);
      var currentItemIndex = BLOCK_COMPOSITION.indexOf(this.name);

      if (parentIndex < currentItemIndex) {
        if (current.name === parentName) {
          return current;
        } else {
          if (current.parent) return this.getParent(parentName, current === null || current === void 0 ? void 0 : current.parent);else return false;
        }
      } else {
        return false;
      }
    };

    return RenderBase;
  }();

  var LetterPart = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(LetterPart, _RenderBase);

    function LetterPart(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.x;
      _this.y = props.y;
      _this.path = props.path;
      _this.pathLength = props.pathLength;
      _this.dashOffset = props.dashOffset;
      _this.width = props.width;
      _this.name = 'letterPart';
      _this.rootBlock = _this.getParent('block', _assertThisInitialized(_this));
      return _this;
    }
    /**
     * Paints the path
     */


    var _proto = LetterPart.prototype;

    _proto.paint = function paint() {
      // console.log(this.x,this.y);
      this.ctx.save();
      this.ctx.stroke(new Path2D(this.processPath(this.path, this.x, this.y)));
      this.ctx.restore();
    }
    /**
     * Increments the dashOffset and then paints the path.
     */
    ;

    _proto.draw = function draw(delta) {
      var pathDuration = this.pathLength / this.rootBlock.totalPathLength * this.rootBlock.options.duration / 1000;
      var speed = this.pathLength / pathDuration;
      this.ctx.save();
      this.ctx.lineDashOffset = 1;
      this.ctx.setLineDash([this.dashOffset, this.pathLength + 1]);
      this.dashOffset += speed * delta;
      this.paint();
      this.ctx.restore();
    };

    _proto.processPath = function processPath(path, x, y) {
      if (x === void 0) {
        x = 0;
      }

      if (y === void 0) {
        y = 0;
      }

      var svgPath = path.split('');
      svgPath[2] = x + '';
      svgPath[4] = y + '';
      return svgPath.join('');
    };

    return LetterPart;
  }(RenderBase);

  var Letter = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(Letter, _RenderBase);

    function Letter(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.x;
      _this.y = props.y;
      _this.width = props.width;
      _this.parts = [];
      _this.drawnParts = [];
      _this.name = "letter";
      _this.character = props.character;
      _this.rootBlock = _this.getParent("block", _assertThisInitialized(_this));
      return _this;
    }

    var _proto = Letter.prototype;

    _proto.setPosition = function setPosition(x, y) {
      this.x = x;
      this.y = y;
    }
    /**
     * Add a new part to the queue
     * @param part The part to be added
     */
    ;

    _proto.addPart = function addPart(part) {
      this.parts.push(new LetterPart(_extends({}, part, {
        ctx: this.ctx,
        parent: this
      }))); // Update the total path length stored in the main block.

      if (this.rootBlock) {
        this.rootBlock.modifyPathLength(part.pathLength, "increment");
      }
    };

    _proto.isDone = function isDone() {
      return this.parts.length === 0;
    }
    /**
     * Remove the first item from the queue. Used when a part has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    ;

    _proto.dequeue = function dequeue() {
      var removedItem = this.parts.shift();
      if (removedItem) this.drawnParts.push(removedItem);
    }
    /**
     * Render the current letter
     * @param rafTime The time value received from requestAnimationFrame
     */
    ;

    _proto.render = function render(rafTime, previousRAFTime) {
      this.ctx.save();
      this.ctx.scale(this.rootBlock.scale, this.rootBlock.scale);
      this.ctx.translate(this.x, this.y);
      var delta = (rafTime - previousRAFTime) / 1000;

      if (this.parts.length > 0) {
        var part = this.parts[0];

        if (part.dashOffset > part.pathLength) {
          this.dequeue();
        } else {
          part.draw(delta);
        }
      }

      this.drawnParts.forEach(function (drawnPart) {
        drawnPart.paint();
      });
      this.ctx.restore();
    }
    /**
     * Paints the paths whose animations are complete
     */
    ;

    _proto.paint = function paint() {
      this.ctx.save();
      this.ctx.scale(this.rootBlock.scale, this.rootBlock.scale);
      this.ctx.translate(this.x, this.y);
      this.drawnParts.forEach(function (drawnPart) {
        drawnPart.paint();
      });
      this.ctx.restore();
    };

    return Letter;
  }(RenderBase);

  var Line = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(Line, _RenderBase);

    function Line(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.x;
      _this.y = props.y;
      _this.ctx = props.ctx;
      _this.letters = [];
      _this._letters = [];
      _this.drawnLetters = [];
      _this.name = "line";
      return _this;
    }

    var _proto = Line.prototype;

    _proto.addLetter = function addLetter(letter) {
      var _letter$parent;

      var newLetter = new Letter(_extends({}, letter, {
        parent: (_letter$parent = letter.parent) !== null && _letter$parent !== void 0 ? _letter$parent : this,
        ctx: this.ctx
      }));
      letter.character.getFontItem().paths.forEach(function (path) {
        newLetter.addPart({
          path: path.d,
          x: path.mx - path.dx,
          y: -path.my,
          pathLength: path.pl,
          dashOffset: 0,
          width: path.w
        });
      });
      this.letters.push(newLetter);

      this._letters.push(newLetter);

      return newLetter;
    };

    _proto.setLetters = function setLetters(letters) {
      this._letters = letters;
      this.letters = letters.filter(function (letter) {
        return !letter.isDone();
      });
      this.drawnLetters = letters.filter(function (letter) {
        return letter.isDone();
      });
    };

    _proto.generateLetter = function generateLetter(letter) {
      var newLetter = new Letter(_extends({}, letter, {
        parent: this,
        ctx: this.ctx
      }));
      return newLetter;
    };

    _proto.setPosition = function setPosition(x, y) {
      this.x = x;
      this.y = y;
    };

    _proto.isDone = function isDone() {
      return this.letters.length === 0;
    };

    _proto.getAllLetters = function getAllLetters() {
      return this._letters;
    }
    /**
     * Remove the first item from the queue. Used when a letter has been drawn completely.
     * The removed item is moved to the drawnLetters array
     */
    ;

    _proto.dequeue = function dequeue() {
      var removedItem = this.letters.shift();
      if (removedItem) this.drawnLetters.push(removedItem);
    }
    /**
     * Render the current line
     * @param rafTime The time value received from requestAnimationFrame
     */
    ;

    _proto.render = function render(rafTime, prevRAFTime) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);

      if (this.letters.length > 0) {
        var currentLetter = this.letters[0];
        currentLetter.render(rafTime, prevRAFTime);

        if (currentLetter.parts.length === 0) {
          this.dequeue();
        }
      }

      this.drawnLetters.forEach(function (letter) {
        letter.paint();
      });
      this.ctx.restore();
    };

    return Line;
  }(RenderBase);

  var Block = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(Block, _RenderBase);

    function Block(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.x;
      _this.y = props.y;
      _this.width = props.width;
      _this.lines = [];
      _this._lines = [];
      _this.drawnLines = [];
      _this.ctx = props.ctx;
      _this.previousRAFTime = 0;
      _this.totalPathLength = 0;
      _this.options = props.options;
      _this.name = 'block';
      _this.scale = props.options.fontSize / SCALEBASE;
      return _this;
    }
    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */


    var _proto = Block.prototype;

    _proto.addLine = function addLine(line) {
      var newLine = new Line(_extends({}, line, {
        ctx: this.ctx,
        parent: this
      }));
      this.lines.push(newLine);

      this._lines.push(newLine);

      return newLine;
    };

    _proto.getAllLetters = function getAllLetters() {
      var letters = this._lines.map(function (item) {
        return item._letters;
      });

      return letters.flat();
    };

    _proto.getLetterById = function getLetterById(id) {
      var _this$getAllLetters$f;

      return (_this$getAllLetters$f = this.getAllLetters().find(function (item) {
        return item.character.id === id;
      })) !== null && _this$getAllLetters$f !== void 0 ? _this$getAllLetters$f : false;
    }
    /**
     * Remove the first item from the queue. Used when a text line has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    ;

    _proto.dequeue = function dequeue() {
      var removedItem = this.lines.shift();
      if (removedItem) this.lines.push(removedItem);
    }
    /**
     * Increment or decrement the total path length
     * @param pathLength Path length that is to be incremented or decrement
     * @param action Whether to increment or decrement
     */
    ;

    _proto.modifyPathLength = function modifyPathLength(pathLength, action) {
      if (action === void 0) {
        action = 'increment';
      }

      if (action === 'increment') {
        this.totalPathLength += pathLength;
      } else {
        this.totalPathLength -= pathLength;
      }

      return this.totalPathLength;
    }
    /**
     * Render the block
     * @param rafTime The time value received from requestAnimationFrame
     */
    ;

    _proto.render = function render(rafTime) {
      var _this2 = this;

      if (this.previousRAFTime === 0) {
        this.previousRAFTime = rafTime;
      }

      this.ctx.save();
      this.ctx.strokeStyle = this.options.color;
      this.ctx.lineWidth = this.options.strokeWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.drawnLines.forEach(function (line) {
        line.render(rafTime, _this2.previousRAFTime);
      });

      if (this.lines.length > 0) {
        var line = this.lines[0];
        line.render(rafTime, this.previousRAFTime);

        if (line.letters.length === 0) {
          this.dequeue();
        }
      }

      this.ctx.restore();
      this.previousRAFTime = rafTime;
    };

    return Block;
  }(RenderBase);

  var ___varaCharId___ = 0;

  var VaraChar = /*#__PURE__*/function () {
    function VaraChar(props) {
      var _props$isSpace;

      this["char"] = props["char"];
      this.fontItem = props.fontItem;
      this.isSpace = (_props$isSpace = props.isSpace) !== null && _props$isSpace !== void 0 ? _props$isSpace : false;
      this.id = ___varaCharId___;
      ___varaCharId___++;
    }

    var _proto = VaraChar.prototype;

    _proto.getFontItem = function getFontItem() {
      return this.fontItem;
    };

    _proto.getId = function getId() {
      return this.id;
    };

    return VaraChar;
  }();

  var RenderItem = /*#__PURE__*/function () {
    function RenderItem(props) {
      var _this = this;

      this.textItem = _extends({}, props.options, props.textItem);
      this.height = 0;
      this.fontCharacters = props.fontCharacters;
      this.ctx = props.ctx;
      this.block = null;

      if (typeof this.textItem.text === 'string') {
        this.text = [this.textItem.text.split('').map(function (letter) {
          return new VaraChar({
            "char": letter,
            fontItem: _this.fontCharacters[letter.charCodeAt(0)] || _this.fontCharacters['63'],
            isSpace: letter === ' '
          });
        })];
      } else if (Array.isArray(this.textItem.text)) {
        this.text = this.textItem.text.map(function (line) {
          return line.split('').map(function (letter) {
            return new VaraChar({
              "char": letter,
              fontItem: _this.fontCharacters[letter.charCodeAt(0)] || _this.fontCharacters['63'],
              isSpace: letter === ' '
            });
          });
        });
      } else {
        // TODO: Show warning / error
        this.text = [];
      }
    }

    var _proto = RenderItem.prototype;

    _proto.addLetter = function addLetter(_ref) {
      var _this2 = this;

      var letter = _ref.letter,
          position = _ref.position;

      // let textBlock: string[] = [];
      // if (Array.isArray(position) && Array.isArray(this.textItem.text)) {
      //     textBlock[position[0]] = `${this.textItem.text[position[0]].slice(
      //         0,
      //         position[1]
      //     )}${letter}${this.textItem.text[position[0]].slice(position[1])}`;
      // } else {
      //     if (typeof position === 'number') {
      //         textBlock = [
      //             `${this.textItem.text+" ".slice(
      //                 0,
      //                 position
      //             )}${letter}${this.textItem.text+" ".slice(position)}`,
      //         ];
      //     }
      // }
      if (typeof position === 'number') {
        var textCharCount = 0;
        this.text.forEach(function (textLine, index) {
          console.log(textLine, position);

          if (position <= textCharCount + textLine.length) {
            console.log("Here");
            console.log("Before", JSON.parse(JSON.stringify(_this2.text[index])));
            _this2.text[index] = [].concat(textLine.slice(0, position - textCharCount), [new VaraChar({
              "char": letter,
              fontItem: _this2.fontCharacters[letter.charCodeAt(0)] || _this2.fontCharacters['63'],
              isSpace: letter === ' '
            })], textLine.slice(position - textCharCount));
            console.log("After", JSON.parse(JSON.stringify(_this2.text[index])));
          } else {
            textCharCount += textLine.length;
          }
        });
      }

      this.regeneratePositions();
    };

    _proto.regeneratePositions = function regeneratePositions() {
      var _this3 = this;

      console.log(this.block);
      var scale = this.textItem.fontSize / SCALEBASE;
      this.height = 0;
      var lines = this.generateLineData(this.text);
      var top = this.textItem.lineHeight;
      var block = this.block;

      if (lines.length > block._lines.length) {
        while (lines.length > block._lines.length) {
          block.addLine({
            x: 0,
            y: 0
          });
        }
      }

      lines.forEach(function (line, lineIndex) {
        var left = 0;
        var x = 0,
            y = top;

        if (_this3.textItem.textAlign === 'center') {
          x = (_this3.textItem.width - line.width) / 2;
        }

        var lineClass = block.lines[lineIndex];
        lineClass.setPosition(x, y);
        var lettersToSet = [];
        line.text.forEach(function (letter) {
          if (letter.isSpace) {
            left += WHITESPACE;
          } else {
            var foundLetter = block.getLetterById(letter.id);

            if (foundLetter) {
              foundLetter.parent = lineClass;
              foundLetter.setPosition(left, top);
              lettersToSet.push(foundLetter);
              left += foundLetter.character.getFontItem().w;
            } else {
              lettersToSet.push(lineClass.addLetter({
                character: letter,
                width: letter.getFontItem().w,
                x: left,
                y: top
              }));
              left += letter.getFontItem().w;
            }
          }
        });
        top += _this3.textItem.lineHeight;
        _this3.height += _this3.textItem.lineHeight * scale;
        lineClass.setLetters(lettersToSet);
        console.log(lettersToSet);
      });
    };

    _proto.generatePositions = function generatePositions() {
      var _this4 = this;

      var scale = this.textItem.fontSize / SCALEBASE;
      this.height = 0;
      var lines = this.generateLineData(this.text);
      var top = this.textItem.lineHeight;
      var block = new Block({
        width: this.textItem.width,
        x: this.textItem.x,
        y: this.textItem.y,
        ctx: this.ctx,
        options: this.textItem
      });
      lines.forEach(function (line) {
        var left = 0;
        var x = 0,
            y = top;

        if (_this4.textItem.textAlign === 'center') {
          x = (_this4.textItem.width - line.width) / 2;
        }

        var lineClass = block.addLine({
          x: x,
          y: y
        });
        line.text.forEach(function (letter) {
          if (letter.isSpace) {
            left += WHITESPACE;
          } else {
            var currentLetter = letter.getFontItem();
            lineClass.addLetter({
              x: left,
              y: top,
              width: currentLetter.w,
              character: letter
            });
            left += currentLetter.w;
          }
        });
        top += _this4.textItem.lineHeight;
        _this4.height += _this4.textItem.lineHeight * scale;
      });
      this.block = block;
    };

    _proto.generateLineData = function generateLineData(lines) {
      var _this5 = this;

      var scale = this.textItem.fontSize / SCALEBASE;
      var returnData = [{
        text: [],
        width: 0
      }];
      var wordSplittedLines = [];
      lines.forEach(function (line) {
        var l = [[]];
        line.forEach(function (letter) {
          if (letter.isSpace) {
            l.push([]);
          } else {
            l[l.length - 1].push(letter);
          }
        });
        wordSplittedLines.push(l);
      });
      wordSplittedLines.forEach(function (line) {
        var spaceWidth = 0;
        line.forEach(function (word) {
          var _returnData$width, _returnData;

          var wordWidth = 0;
          word.forEach(function (letter) {
            var currentLetter = letter.getFontItem();
            var pathPositionCorrection = currentLetter.paths.reduce(function (a, c) {
              return a + c.mx - c.dx;
            }, 0);
            wordWidth += (currentLetter.w + pathPositionCorrection) * scale;
          });

          if (((_returnData$width = (_returnData = returnData[lines.length - 1]) === null || _returnData === void 0 ? void 0 : _returnData.width) !== null && _returnData$width !== void 0 ? _returnData$width : 0) + wordWidth + 5 * scale + spaceWidth + _this5.textItem.x * scale > _this5.textItem.width) {
            returnData.push({
              text: [].concat(word, [new VaraChar({
                "char": ' ',
                fontItem: _this5.fontCharacters['63'],
                isSpace: true
              })]),
              width: wordWidth
            });
            spaceWidth = 0;
          } else {
            returnData[returnData.length - 1] = {
              text: [].concat(returnData[returnData.length - 1].text, word, [new VaraChar({
                "char": ' ',
                fontItem: _this5.fontCharacters['63'],
                isSpace: true
              })]),
              width: returnData[returnData.length - 1].width + wordWidth
            };
            spaceWidth += WHITESPACE * scale;
          }
        });
      });
      return returnData;
    };

    _proto.render = function render(rafTime) {
      if (this.block) {
        this.block.render(rafTime);
      }
    };

    _proto.rendered = function rendered() {
      var _this$block;

      return ((_this$block = this.block) === null || _this$block === void 0 ? void 0 : _this$block.lines.length) === 0;
    };

    return RenderItem;
  }();

  var Vara = /*#__PURE__*/function () {
    function Vara(elem, fontSource, text, options) {
      this.elementName = elem;
      this.element = document.querySelector(elem);
      this.fontSource = fontSource;
      this.options = options;
      this.textItems = text;
      this.renderData = {
        nonQueued: [],
        queued: []
      };
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
            w: 8.6437,
            h: 14.23173,
            my: 22.6665,
            mx: 0,
            dx: 0,
            d: 'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85',
            pl: 1
          }, {
            w: 1.1037,
            h: 1.5498,
            my: 8.8815,
            dx: 0,
            mx: 1,
            d: 'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
            pl: 1
          }],
          w: 8.6437
        }
      };
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.element.getBoundingClientRect().width;
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

            _this.render();
          }
        }
      };

      xmlhttp.send(null);
    };

    _proto.onDraw = function onDraw(fn) {
      this.onDrawF = fn;
    }
    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    ;

    _proto.normalizeOptions = function normalizeOptions() {
      var _this2 = this;

      this.options = this.options || {};
      this.options = _extends({}, this.defaultOptions, this.options);
      Object.keys(this.defaultCharacters).forEach(function (character) {
        if (_this2.fontCharacters[character] === undefined) {
          _this2.fontCharacters[character] = _this2.defaultCharacters[character];
        }
      });
    }
    /**
     * Performs some actions before rendering starts. These include finding the pathLength of each path and generating the render data.
     */
    ;

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
      this.textItems.forEach(function (item) {
        var renderItem = new RenderItem({
          fontCharacters: _this3.fontCharacters,
          options: _this3.options,
          textItem: item,
          ctx: _this3.ctx
        });
        renderItem.generatePositions();

        if (item.queued) {
          _this3.renderData.queued.push(renderItem);
        } else {
          _this3.renderData.nonQueued.push(renderItem);
        }
      });
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

      this.ctx.clearRect(0, 0, this.canvas.width, canvasHeight);
      this.renderData.nonQueued.forEach(function (item) {
        item.render(rafTime);
      });

      if (this.renderData.queued.length > 0) {
        var queueHead = this.renderData.queued[0];
        queueHead.render(rafTime);

        if (queueHead.rendered()) {
          this.dequeue();
        }
      }

      window.requestAnimationFrame(function (time) {
        return _this4.render(time);
      });
    }
    /**
     * Remove the first item from the queue. Used when a block has been drawn completely.
     * The removed item is moved to the drawnLetters array
     */
    ;

    _proto.dequeue = function dequeue() {
      var removedItem = this.renderData.queued.shift();
      if (removedItem) this.renderData.nonQueued.push(removedItem);
    } // TODO: Make proper calculation function.
    ;

    _proto.calculateCanvasHeight = function calculateCanvasHeight() {
      var height = 0;
      [].concat(this.renderData.nonQueued, this.renderData.queued).forEach(function (item) {
        if (item.height && item.textItem.y) {
          height += item.height + item.textItem.y;
        }
      });
      return height + 50;
    };

    _proto.addLetter = function addLetter(_ref) {
      var letter = _ref.letter,
          id = _ref.id,
          position = _ref.position;
      var block = [].concat(this.renderData.nonQueued, this.renderData.queued).find(function (item) {
        return item.textItem.id === id;
      });
      console.log(letter, position);
      block === null || block === void 0 ? void 0 : block.addLetter({
        letter: letter,
        position: position
      }); // if(block) {
      //     block.
      // }
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

  exports.default = Vara;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vara.umd.development.js.map
