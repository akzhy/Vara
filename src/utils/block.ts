import Vara from '..';
import { BlockName, VaraText, VaraTextOptions } from '../types';
import VaraChar from './char';
import Letter from './letter';
import Line, { LineProps } from './line';
import RenderBase from './renderbase';

interface BlockProps {
    ctx: CanvasRenderingContext2D;
    options: Required<VaraText>;
    root: Vara;
}

export default class Block extends RenderBase {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;

    ctx: CanvasRenderingContext2D;
    previousRAFTime: number;
    lines: Line[];
    drawnLines: Line[];
    totalPathLength: number;
    options: Required<VaraText>;
    text: VaraChar[][];

    private root: Vara;
    private userDefinedRenderFn: (
        ctx: CanvasRenderingContext2D,
        rafTime: number
    ) => void;

    name: BlockName;

    constructor(props: BlockProps) {
        super(props);

        this.x = props.options.x;
        this.y = props.options.y;
        this.width = props.options.width;
        this.height = 0;

        this.lines = [];
        this.drawnLines = [];
        this.ctx = props.ctx;
        this.previousRAFTime = 0;
        this.totalPathLength = 0;
        this.text = [];
        this.options = props.options;

        this.name = 'block';

        this.root = props.root;
        this.scale = Math.min(1, props.options.fontSize / this.root.scalebase);

        this.userDefinedRenderFn = () => null;

        this.initTextToVaraChar();

        this.generatePositions();
    }

    // Begin private functions

    private initTextToVaraChar() {
        if (typeof this.options.text === 'string') {
            this.text = [
                this.options.text.split('').map(
                    letter =>
                        new VaraChar({
                            char: letter,
                            fontItem:
                                this.root.fontCharacters[
                                    letter.charCodeAt(0)
                                ] || this.root.fontCharacters['63'],
                            isSpace: letter === ' ',
                        })
                ),
            ];
        } else if (Array.isArray(this.options.text)) {
            this.text = this.options.text.map(line =>
                line.split('').map(
                    letter =>
                        new VaraChar({
                            char: letter,
                            fontItem:
                                this.root.fontCharacters[
                                    letter.charCodeAt(0)
                                ] || this.root.fontCharacters['63'],
                            isSpace: letter === ' ',
                        })
                )
            );
        } else {
            // TODO: Show warning / error
            this.text = [];
        }
    }

    private regeneratePositions(
        lines: {
            text: VaraChar[];
            width: number;
        }[]
    ) {
        this.height = 0;

        let top = this.options.lineHeight;

        const lettersToSetInLine: Letter[][] = [];

        lines.forEach((line, lineIndex) => {
            let left = 0;
            let x = 0,
                y = top;
            if (this.options.textAlign === 'center') {
                x = (this.options.width - line.width) / 2;
            }

            let lineClass = this.getLineAtIndex(lineIndex);
            lineClass.setPosition(x, y);

            const lettersToSet: Letter[] = [];

            line.text.forEach(char => {
                if (char.isSpace) {
                    left += char.getFontItem().w;
                } else {
                    let foundLetter = this.getLetterByCharacterId(char.id);
                    if (foundLetter) {
                        foundLetter.setParent(lineClass);
                        foundLetter.setPosition(left, 0);
                        lettersToSet.push(foundLetter);

                        left += foundLetter.character.getFontItem().w;
                    } else {
                        // TODO: Show meaningful error
                        console.error(
                            `Error - Letter with id ${char.id} not found`
                        );
                    }
                }
            });
            top += this.options.lineHeight;
            this.height += this.options.lineHeight;

            lettersToSetInLine.push(lettersToSet);
        });

        this.getLines().forEach((line, lineIndex) => {
            line.setLetters(lettersToSetInLine[lineIndex]);
        });
    }

    private generatePositions() {
        this.height = 0;

        const lines = this.generateLineData(this.text);

        let top = this.options.lineHeight;
        lines.forEach(line => {
            let left = 0;
            let x = 0,
                y = top;
            if (this.options.textAlign === 'center') {
                x = (this.options.width - line.width) / 2;
            }

            const lineClass = this.addLine({
                x,
                y,
            });

            line.text.forEach(letter => {
                const currentLetter = letter.getFontItem();

                lineClass.addLetter({
                    x: left,
                    y: 0,
                    width: currentLetter.w,
                    character: letter,
                });

                left += currentLetter.w;
            });
            top += this.options.lineHeight;
            this.height += this.options.lineHeight;
        });
    }

    private generateLineData(lines: VaraChar[][]) {
        const returnData: {
            text: VaraChar[];
            width: number;
        }[] = [
            {
                text: [],
                width: 0,
            },
        ];

        const wordSplittedLines: VaraChar[][][] = [];

        lines.forEach(line => {
            let l: VaraChar[][] = [[]];
            line.forEach(letter => {
                if (letter.isSpace) {
                    l.push([]);
                } else {
                    l[l.length - 1].push(letter);
                }
            });
            wordSplittedLines.push(l);
        });

        wordSplittedLines.forEach(line => {
            let spaceWidth = 0;
            line.forEach(word => {
                let wordWidth = 0;

                word.forEach(letter => {
                    const currentLetter = letter.getFontItem();

                    let pathPositionCorrection = currentLetter.paths.reduce(
                        (a, c) => a + c.mx - c.dx,
                        0
                    );
                    wordWidth +=
                        (currentLetter.w + pathPositionCorrection) * this.scale;
                });

                const spaceChar = new VaraChar({
                    char: ' ',
                    fontItem: this.root.fontCharacters['32'],
                    isSpace: true,
                });

                if (
                    (returnData[returnData.length - 1]?.width ?? 0) +
                        wordWidth +
                        spaceWidth +
                        this.options.x >
                    this.options.width
                ) {
                    returnData.push({
                        text: [...word, spaceChar],
                        width: wordWidth,
                    });
                    spaceWidth = 0;
                } else {
                    returnData[returnData.length - 1] = {
                        text: [
                            ...returnData[returnData.length - 1].text,
                            ...word,
                            spaceChar,
                        ],
                        width:
                            returnData[returnData.length - 1].width + wordWidth,
                    };
                    spaceWidth += spaceChar.getFontItem().w;
                }
            });
        });

        return returnData;
    }

    // End private functions

    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */
    addLine(line: Omit<LineProps, 'ctx' | 'parent'>) {
        const newLine = new Line({
            ...line,
            ctx: this.ctx,
            parent: this,
        });

        this.lines.push(newLine);

        return newLine;
    }

    removeLine(index?: number) {
        const allLines = this.getLines();
        if (index) {
            const foundLine = allLines[index];

            if (foundLine) {
                this.lines = this.lines.filter(
                    line => line.id !== foundLine.id
                );
                this.drawnLines = this.drawnLines.filter(
                    line => line.id !== foundLine.id
                );
            } else {
                // TODO: Show proper warning
                //console.warn();
            }
        } else {
            const toRemove = allLines[allLines.length - 1];

            this.lines = this.lines.filter(line => line.id !== toRemove.id);
            this.drawnLines = this.drawnLines.filter(
                line => line.id !== toRemove.id
            );
        }
    }

    getCursorPosition(position: number) {
        let textCharCount = 0;
        let charId = -1;
        this.text.forEach((textLine, index) => {
            if (index < textCharCount + textLine.length) {
                charId = this.text[index][position - textCharCount].id;
            } else {
                textCharCount += textLine.length;
            }
        });

        if (charId > -1) {
            const letter = this.getLetterByCharacterId(charId);

            if (letter) {
                const line = letter.getParent('line', letter) as Line;

                const xPosition =
                    line.x + (letter.x + letter.width) * this.scale;
                const yPosition = line.y;

                return {
                    x: xPosition,
                    y: yPosition,
                };
            } else {
                console.warn('Letter not found');
                return false;
            }
        } else {
            console.warn('Character Not found');
            return false;
        }
    }

    addLetter({
        letter,
        position,
    }: {
        letter: string;
        position: number | number[];
    }) {
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

        const newChar = new VaraChar({
            char: letter,
            fontItem:
                this.root.fontCharacters[letter.charCodeAt(0)] ||
                this.root.fontCharacters['63'],
            isSpace: letter === ' ',
        });

        if (typeof position === 'number') {
            let textCharCount = 0;
            this.text.forEach((textLine, index) => {
                if (position <= textCharCount + textLine.length) {
                    this.text[index] = [
                        ...textLine.slice(0, position - textCharCount),
                        newChar,
                        ...textLine.slice(position - textCharCount),
                    ];
                } else {
                    textCharCount += textLine.length;
                }
            });
        }

        const lines = this.generateLineData(this.text);

        if (lines.length > this.getLineCount()) {
            while (lines.length > this.getLineCount()) {
                this.addLine({
                    x: 0,
                    y: 0,
                });
            }
        }

        this.getLastLine().addLetter({
            character: newChar,
            width: newChar.fontItem.w,
            x: 0,
            y: 0,
        });

        this.regeneratePositions(lines);
    }

    removeLetter({ position }: { position: number | number[] }) {
        let charId = -1;

        if (typeof position === 'number') {
            let textCharCount = 0;
            this.text.forEach((textLine, index) => {
                if (position <= textCharCount + textLine.length) {
                    if (position <= textCharCount + textLine.length) {
                        charId = this.text[index][position - textCharCount].id;
                        this.text[index].splice(position - textCharCount, 1);
                    } else {
                        textCharCount += textLine.length;
                    }
                } else {
                    textCharCount += textLine.length;
                }
            });
        }

        const lines = this.generateLineData(this.text);

        if (lines.length < this.getLineCount()) {
            while (lines.length < this.getLineCount()) {
                this.removeLine();
            }
        }

        const letter = this.getAllLetters().find(
            item => item.character.getId() === charId
        );

        if (letter) {
            const line = letter.getParent('line', letter);

            if (line) {
                line.removeLetter(letter.id);
            }
        }

        this.regeneratePositions(lines);
    }

    getAllLetters() {
        const letters = this.getLines().map(item => item.getAllLetters());
        return letters.flat();
    }

    getLines() {
        return [...this.lines, ...this.drawnLines];
    }

    getLineCount() {
        return this.getLines().length;
    }

    getLineAtIndex(index: number) {
        return this.getLines()[index];
    }

    getLastLine() {
        const allLines = this.getLines();
        return allLines[allLines.length - 1];
    }

    getLetterByCharacterId(id: number) {
        return (
            this.getAllLetters().find(item => item.character.id === id) ?? false
        );
    }

    setRenderFunction(
        fn: (ctx: CanvasRenderingContext2D, rafTime: number) => void
    ) {
        this.userDefinedRenderFn = fn;
    }

    updateOptions(options: VaraTextOptions) {
        this.options = {
            ...this.options,
            ...options,
        };
    }

    /**
     * Remove the first line from the queue of lines. Used when a text line has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    dequeue() {
        const removedItem = this.lines.shift();
        if (removedItem) this.drawnLines.push(removedItem);
    }

    /**
     * Increment or decrement the total path length
     * @param pathLength Path length that is to be incremented or decrement
     * @param action Whether to increment or decrement
     */
    modifyPathLength(
        pathLength: number,
        action: 'increment' | 'decrement' = 'increment'
    ) {
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
    render(rafTime: number) {
        if (this.previousRAFTime === 0) {
            this.previousRAFTime = rafTime;
        }

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.strokeStyle = this.options.color;
        this.ctx.lineWidth = this.options.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.drawnLines.forEach(line => {
            line.render(rafTime, this.previousRAFTime);
        });

        if (this.lines.length > 0) {
            const line = this.lines[0];
            if (line.isDone()) {
                this.dequeue();
            }
            line.render(rafTime, this.previousRAFTime);
        }
        this.userDefinedRenderFn(this.ctx, rafTime);

        this.ctx.restore();
        this.previousRAFTime = rafTime;
    }
}
