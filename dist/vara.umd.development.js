(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Vara = {}));
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

    _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var varaCharId = 0;

  var VaraChar = /*#__PURE__*/function () {
    function VaraChar(props) {
      var _props$isSpace;

      this["char"] = props["char"];
      this.fontItem = props.fontItem;
      this.isSpace = (_props$isSpace = props.isSpace) != null ? _props$isSpace : false;
      this.id = varaCharId;
      varaCharId++;
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

  var BLOCK_COMPOSITION = ["block", "line", "letter", "letterPart"];

  var RenderBase = /*#__PURE__*/function () {
    function RenderBase(props) {
      var _props$parent;

      this.ctx = props.ctx;
      this.parent = (_props$parent = props.parent) != null ? _props$parent : null;
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
          if (current.parent) return this.getParent(parentName, current == null ? void 0 : current.parent);else return false;
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

  var letterId = 0;

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
      _this.name = 'letter';
      _this.character = props.character;
      _this.id = letterId;
      letterId++;
      _this.rootBlock = _this.getParent('block', _assertThisInitialized(_this));
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
        this.rootBlock.modifyPathLength(part.pathLength, 'increment');
      }
    };

    _proto.setParent = function setParent(parent) {
      this.parent = parent;
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

  var lineId = 0;
  /**
   * Used to represent a line of text drawn in the canvas.
   *
   */

  var Line = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(Line, _RenderBase);

    function Line(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.x;
      _this.y = props.y;
      _this.ctx = props.ctx; // This will act as queue of letters
      // Each item is animated one after the other

      _this.letters = []; // This will contain all the letters that have already been drawn (animated).

      _this.drawnLetters = []; // The name of this class.
      // Name is used for finding a specific parent using the getParent method

      _this.name = 'line';
      _this.width = 0;
      _this.id = lineId;
      lineId++;
      return _this;
    }
    /**
     * Add a new letter to this line
     * @param letter - The letter to be added
     */


    var _proto = Line.prototype;

    _proto.addLetter = function addLetter(letter) {
      var _letter$parent;

      // Create the letter
      var newLetter = new Letter(_extends({}, letter, {
        parent: (_letter$parent = letter.parent) != null ? _letter$parent : this,
        ctx: this.ctx
      })); // Create all the parts of the letter
      // A letter can have multiple parts.
      // The letter i has two parts, the tittle (dot) and the line part?

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
      this.width += letter.width;
      this.letters.push(newLetter); // Return the newly created letter

      return newLetter;
    };

    _proto.removeLetter = function removeLetter(letterId) {
      this.letters = this.letters.filter(function (letter) {
        return letter.id !== letterId;
      });
      this.drawnLetters = this.drawnLetters.filter(function (letter) {
        return letter.id !== letterId;
      });
    }
    /**
     * Override the letters of this line.
     *
     * Letter states are preserved.
     *
     * @param letters The new letters of the line
     */
    ;

    _proto.setLetters = function setLetters(letters) {
      this.letters = letters.filter(function (letter) {
        return !letter.isDone();
      });
      this.drawnLetters = letters.filter(function (letter) {
        return letter.isDone();
      });
    }
    /**
     * Sets the position of the current line
     * @param x X-coordinate, relative to the parent block
     * @param y Y-coordinate, relative to the parent block
     */
    ;

    _proto.setPosition = function setPosition(x, y) {
      this.x = x;
      this.y = y;
    }
    /**
     * Used to check if all the letters in this line have been drawn.
     */
    ;

    _proto.isDone = function isDone() {
      return this.letters.length === 0;
    }
    /**
     * Returns all the letters in this line including those that are to be animated.
     */
    ;

    _proto.getAllLetters = function getAllLetters() {
      return [].concat(this.letters, this.drawnLetters);
    }
    /**
     * Remove the first letter from the queue. Used when a letter has been drawn completely.
     * The removed letter is moved to the drawnLetters array
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
      this.ctx.save(); // Set the position of the line

      this.ctx.translate(this.x, this.y);

      if (this.letters.length > 0) {
        var currentLetter = this.letters[0];
        currentLetter.render(rafTime, prevRAFTime); // If the current letter is animated, then remove it from the queue and add it to the drawn letters

        if (currentLetter.isDone()) {
          this.dequeue();
        }
      } // Paint all the already animated letters
      // The paint method will draw the line without changing the dashOffset


      this.drawnLetters.forEach(function (letter) {
        letter.paint();
      }); // Restore canvas state (position)

      this.ctx.restore();
    };

    return Line;
  }(RenderBase);

  var Block = /*#__PURE__*/function (_RenderBase) {
    _inheritsLoose(Block, _RenderBase);

    function Block(props) {
      var _this;

      _this = _RenderBase.call(this, props) || this;
      _this.x = props.options.x;
      _this.y = props.options.y;
      _this.width = props.options.width;
      _this.height = 0;
      _this.lines = [];
      _this.drawnLines = [];
      _this.ctx = props.ctx;
      _this.previousRAFTime = 0;
      _this.totalPathLength = 0;
      _this.text = [];
      _this.options = props.options;
      _this.name = 'block';
      _this.root = props.root;
      _this.scale = Math.min(1, props.options.fontSize / _this.root.scalebase);

      _this.userDefinedRenderFn = function () {
        return null;
      };

      _this.initTextToVaraChar();

      _this.generatePositions();

      return _this;
    } // Begin private functions


    var _proto = Block.prototype;

    _proto.initTextToVaraChar = function initTextToVaraChar() {
      var _this2 = this;

      if (typeof this.options.text === 'string') {
        this.text = [this.options.text.split('').map(function (letter) {
          return new VaraChar({
            "char": letter,
            fontItem: _this2.root.fontCharacters[letter.charCodeAt(0)] || _this2.root.fontCharacters['63'],
            isSpace: letter === ' '
          });
        })];
      } else if (Array.isArray(this.options.text)) {
        this.text = this.options.text.map(function (line) {
          return line.split('').map(function (letter) {
            return new VaraChar({
              "char": letter,
              fontItem: _this2.root.fontCharacters[letter.charCodeAt(0)] || _this2.root.fontCharacters['63'],
              isSpace: letter === ' '
            });
          });
        });
      } else {
        // TODO: Show warning / error
        this.text = [];
      }
    };

    _proto.regeneratePositions = function regeneratePositions(lines) {
      var _this3 = this;

      this.height = 0;
      var top = this.options.lineHeight;
      var lettersToSetInLine = [];
      lines.forEach(function (line, lineIndex) {
        var left = 0;
        var x = 0,
            y = top;

        if (_this3.options.textAlign === 'center') {
          x = (_this3.options.width - line.width) / 2;
        }

        var lineClass = _this3.getLineAtIndex(lineIndex);

        lineClass.setPosition(x, y);
        var lettersToSet = [];
        line.text.forEach(function (_char) {
          if (_char.isSpace) {
            left += _char.getFontItem().w;
          } else {
            var foundLetter = _this3.getLetterByCharacterId(_char.id);

            if (foundLetter) {
              foundLetter.setParent(lineClass);
              foundLetter.setPosition(left, 0);
              lettersToSet.push(foundLetter);
              left += foundLetter.character.getFontItem().w;
            } else {
              // TODO: Show meaningful error
              console.error("Error - Letter with id " + _char.id + " not found");
            }
          }
        });
        top += _this3.options.lineHeight;
        _this3.height += _this3.options.lineHeight;
        lettersToSetInLine.push(lettersToSet);
      });
      this.getLines().forEach(function (line, lineIndex) {
        line.setLetters(lettersToSetInLine[lineIndex]);
      });
    };

    _proto.generatePositions = function generatePositions() {
      var _this4 = this;

      this.height = 0;
      var lines = this.generateLineData(this.text);
      var top = this.options.lineHeight;
      lines.forEach(function (line) {
        var left = 0;
        var x = 0,
            y = top;

        if (_this4.options.textAlign === 'center') {
          x = (_this4.options.width - line.width) / 2;
        }

        var lineClass = _this4.addLine({
          x: x,
          y: y
        });

        line.text.forEach(function (letter) {
          var currentLetter = letter.getFontItem();
          lineClass.addLetter({
            x: left,
            y: 0,
            width: currentLetter.w,
            character: letter
          });
          left += currentLetter.w;
        });
        top += _this4.options.lineHeight;
        _this4.height += _this4.options.lineHeight;
      });
    };

    _proto.generateLineData = function generateLineData(lines) {
      var _this5 = this;

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
            wordWidth += (currentLetter.w + pathPositionCorrection) * _this5.scale;
          });
          var spaceChar = new VaraChar({
            "char": ' ',
            fontItem: _this5.root.fontCharacters['32'],
            isSpace: true
          });

          if (((_returnData$width = (_returnData = returnData[returnData.length - 1]) == null ? void 0 : _returnData.width) != null ? _returnData$width : 0) + wordWidth + spaceWidth + _this5.options.x > _this5.options.width) {
            returnData.push({
              text: [].concat(word, [spaceChar]),
              width: wordWidth
            });
            spaceWidth = 0;
          } else {
            returnData[returnData.length - 1] = {
              text: [].concat(returnData[returnData.length - 1].text, word, [spaceChar]),
              width: returnData[returnData.length - 1].width + wordWidth
            };
            spaceWidth += spaceChar.getFontItem().w;
          }
        });
      });
      return returnData;
    } // End private functions

    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */
    ;

    _proto.addLine = function addLine(line) {
      var newLine = new Line(_extends({}, line, {
        ctx: this.ctx,
        parent: this
      }));
      this.lines.push(newLine);
      return newLine;
    };

    _proto.removeLine = function removeLine(index) {
      var allLines = this.getLines();

      if (index) {
        var foundLine = allLines[index];

        if (foundLine) {
          this.lines = this.lines.filter(function (line) {
            return line.id !== foundLine.id;
          });
          this.drawnLines = this.drawnLines.filter(function (line) {
            return line.id !== foundLine.id;
          });
        }
      } else {
        var toRemove = allLines[allLines.length - 1];
        this.lines = this.lines.filter(function (line) {
          return line.id !== toRemove.id;
        });
        this.drawnLines = this.drawnLines.filter(function (line) {
          return line.id !== toRemove.id;
        });
      }
    };

    _proto.getCursorPosition = function getCursorPosition(position) {
      var _this6 = this;

      var textCharCount = 0;
      var charId = -1;
      this.text.forEach(function (textLine, index) {
        if (index < textCharCount + textLine.length) {
          charId = _this6.text[index][position - textCharCount].id;
        } else {
          textCharCount += textLine.length;
        }
      });

      if (charId > -1) {
        var letter = this.getLetterByCharacterId(charId);

        if (letter) {
          var line = letter.getParent('line', letter);
          var xPosition = line.x + (letter.x + letter.width) * this.scale;
          var yPosition = line.y;
          return {
            x: xPosition,
            y: yPosition
          };
        } else {
          console.warn('Letter not found');
          return false;
        }
      } else {
        console.warn('Character Not found');
        return false;
      }
    };

    _proto.addLetter = function addLetter(_ref) {
      var _this7 = this;

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
      var newChar = new VaraChar({
        "char": letter,
        fontItem: this.root.fontCharacters[letter.charCodeAt(0)] || this.root.fontCharacters['63'],
        isSpace: letter === ' '
      });

      if (typeof position === 'number') {
        var textCharCount = 0;
        this.text.forEach(function (textLine, index) {
          if (position <= textCharCount + textLine.length) {
            _this7.text[index] = [].concat(textLine.slice(0, position - textCharCount), [newChar], textLine.slice(position - textCharCount));
          } else {
            textCharCount += textLine.length;
          }
        });
      }

      var lines = this.generateLineData(this.text);

      if (lines.length > this.getLineCount()) {
        while (lines.length > this.getLineCount()) {
          this.addLine({
            x: 0,
            y: 0
          });
        }
      }

      this.getLastLine().addLetter({
        character: newChar,
        width: newChar.fontItem.w,
        x: 0,
        y: 0
      });
      this.regeneratePositions(lines);
    };

    _proto.removeLetter = function removeLetter(_ref2) {
      var _this8 = this;

      var position = _ref2.position;
      var charId = -1;

      if (typeof position === 'number') {
        var textCharCount = 0;
        this.text.forEach(function (textLine, index) {
          if (position <= textCharCount + textLine.length) {
            if (position <= textCharCount + textLine.length) {
              charId = _this8.text[index][position - textCharCount].id;

              _this8.text[index].splice(position - textCharCount, 1);
            } else {
              textCharCount += textLine.length;
            }
          } else {
            textCharCount += textLine.length;
          }
        });
      }

      var lines = this.generateLineData(this.text);

      if (lines.length < this.getLineCount()) {
        while (lines.length < this.getLineCount()) {
          this.removeLine();
        }
      }

      var letter = this.getAllLetters().find(function (item) {
        return item.character.getId() === charId;
      });

      if (letter) {
        var line = letter.getParent('line', letter);

        if (line) {
          line.removeLetter(letter.id);
        }
      }

      this.regeneratePositions(lines);
    };

    _proto.getAllLetters = function getAllLetters() {
      var letters = this.getLines().map(function (item) {
        return item.getAllLetters();
      });
      return letters.flat();
    };

    _proto.getLines = function getLines() {
      return [].concat(this.lines, this.drawnLines);
    };

    _proto.getLineCount = function getLineCount() {
      return this.getLines().length;
    };

    _proto.getLineAtIndex = function getLineAtIndex(index) {
      return this.getLines()[index];
    };

    _proto.getLastLine = function getLastLine() {
      var allLines = this.getLines();
      return allLines[allLines.length - 1];
    };

    _proto.getLetterByCharacterId = function getLetterByCharacterId(id) {
      var _this$getAllLetters$f;

      return (_this$getAllLetters$f = this.getAllLetters().find(function (item) {
        return item.character.id === id;
      })) != null ? _this$getAllLetters$f : false;
    };

    _proto.setRenderFunction = function setRenderFunction(fn) {
      this.userDefinedRenderFn = fn;
    };

    _proto.updateOptions = function updateOptions(options) {
      this.options = _extends({}, this.options, options);
    }
    /**
     * Remove the first line from the queue of lines. Used when a text line has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    ;

    _proto.dequeue = function dequeue() {
      var removedItem = this.lines.shift();
      if (removedItem) this.drawnLines.push(removedItem);
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
      var _this9 = this;

      if (this.previousRAFTime === 0) {
        this.previousRAFTime = rafTime;
      }

      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.strokeStyle = this.options.color;
      this.ctx.lineWidth = this.options.strokeWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.drawnLines.forEach(function (line) {
        line.render(rafTime, _this9.previousRAFTime);
      });

      if (this.lines.length > 0) {
        var line = this.lines[0];

        if (line.isDone()) {
          this.dequeue();
        }

        line.render(rafTime, this.previousRAFTime);
      }

      this.userDefinedRenderFn(this.ctx, rafTime);
      this.ctx.restore();
      this.previousRAFTime = rafTime;
    };

    return Block;
  }(RenderBase);

  var Vara = /*#__PURE__*/function () {
    function Vara(elem, fontSource, text, options) {
      this.elementName = elem;
      this.element = document.querySelector(elem);
      this.fontSource = fontSource;
      this.options = options;
      this.textItems = text;
      this.blocks = [];
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
      this.whitespace = 10;
      this.scalebase = 16;
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
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            var contents = JSON.parse(xmlhttp.responseText);
            _this.fontCharacters = contents.c;
            _this.fontProperties = contents.p;

            _this.preRender();

            if (_this.readyfn) _this.readyfn();

            _this.render();
          }
        }
      };

      xmlhttp.send(null);
    };

    _proto.ready = function ready(fn) {
      this.readyfn = fn;
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

      // TODO: Cleanup all appended elements
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
      this.setScaleBase();
      this.setWhitespaceWidth();

      if (this.fontCharacters['32'] === undefined) {
        this.createWhitespaceLine();
      }

      this.objectKeys(this.fontCharacters).forEach(function (_char) {
        _this3.fontCharacters[_char].paths.forEach(function (path, i) {
          svgPathData.setAttributeNS(null, 'd', path.d);
          _this3.fontCharacters[_char].paths[i].dx = svgPathData.getBoundingClientRect().x;
          _this3.fontCharacters[_char].paths[i].pl = svgPathData.getTotalLength();
        });
      });
      this.textItems.forEach(function (item) {
        var block = new Block({
          root: _this3,
          options: _extends({}, _this3.options, item),
          ctx: _this3.ctx
        });

        _this3.blocks.push(block);
      });
    };

    _proto.createWhitespaceLine = function createWhitespaceLine() {
      var path = "m0,0 l0,0 " + this.whitespace + ",0";
      var fontItem = {
        paths: [{
          d: path,
          dx: 0,
          h: 1,
          mx: 0,
          my: 0,
          pl: this.whitespace,
          w: this.whitespace
        }],
        w: this.whitespace
      };
      this.fontCharacters['32'] = fontItem;
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
      this.blocks.forEach(function (item) {
        item.render(rafTime);
      });
      window.requestAnimationFrame(function (time) {
        return _this4.render(time);
      });
    } // TODO: Make proper calculation function.
    ;

    _proto.calculateCanvasHeight = function calculateCanvasHeight() {
      var height = 0;
      this.blocks.forEach(function (item) {
        if (item.height && item.options.y) {
          height += item.height + item.options.y;
        }
      });
      return height + 50;
    };

    _proto.addLetter = function addLetter(_ref) {
      var letter = _ref.letter,
          id = _ref.id,
          position = _ref.position;
      var block = this.getBlock(id);

      if (block) {
        block.addLetter({
          letter: letter,
          position: position
        });
        return true;
      } else {
        console.warn("Block with id " + id + " not found");
        return false;
      }
    };

    _proto.removeLetter = function removeLetter(_ref2) {
      var id = _ref2.id,
          position = _ref2.position;
      var block = this.getBlock(id);

      if (block) {
        block.removeLetter({
          position: position
        });
        return true;
      } else {
        console.warn("Block with id " + id + " not found");
        return false;
      }
    };

    _proto.getCursorPosition = function getCursorPosition(_ref3) {
      var position = _ref3.position,
          id = _ref3.id;
      var block = this.getBlock(id);

      if (block) {
        return block.getCursorPosition(position);
      } else {
        console.warn("Block with id " + id + " not found");
        return false;
      }
    };

    _proto.setRenderFunction = function setRenderFunction(id, fn) {
      var block = this.getBlock(id);

      if (block) {
        return block.setRenderFunction(fn);
      } else {
        console.warn("Block with id " + id + " not found");
        return false;
      }
    };

    _proto.getBlock = function getBlock(id) {
      var _this$blocks$find;

      return (_this$blocks$find = this.blocks.find(function (item) {
        return item.options.id === id;
      })) != null ? _this$blocks$find : false;
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
    };

    _proto.setScaleBase = function setScaleBase() {
      var charCode = this.fontCharacters['97'] ? '97' : Object.keys(this.fontCharacters)[0];
      var psuedoText = this.fontCharacters[charCode];
      var psuedoTextElement = document.createElement('span');
      psuedoTextElement.setAttribute('style', 'position:absolute;opacity:0;');
      psuedoTextElement.textContent = String.fromCharCode(parseInt(charCode));
      this.element.appendChild(psuedoTextElement);
      var psuedoTextElementWidth = psuedoTextElement.clientWidth;
      this.scalebase = psuedoTextElementWidth / psuedoText.w;
      console.log(psuedoTextElementWidth, psuedoText.w);
      this.element.removeChild(psuedoTextElement);
    };

    _proto.setWhitespaceWidth = function setWhitespaceWidth() {
      var psuedoTextElement = document.createElement('span');
      psuedoTextElement.setAttribute('style', 'position:absolute;opacity:0;');
      psuedoTextElement.innerHTML = '&nbsp;';
      this.element.appendChild(psuedoTextElement);
      var psuedoTextElementWidth = psuedoTextElement.clientWidth;
      this.whitespace = psuedoTextElementWidth / this.scalebase;
      this.element.removeChild(psuedoTextElement);
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
