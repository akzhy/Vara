import { VaraFontItem, VaraText, VaraTextOptions } from '../types';
import Block from './block';
import VaraChar from './char';
import { SCALEBASE, WHITESPACE } from './constants';
import Letter from './letter';
import Line from './line';

interface RenderItemProps {
    textItem: VaraText;
    options: Required<VaraTextOptions>;
    fontCharacters: {
        [x: string]: VaraFontItem;
    };
    ctx: CanvasRenderingContext2D;
}

export default class RenderItem {
    textItem: Required<VaraText>;
    fontCharacters: {
        [x: string]: VaraFontItem;
    };
    ctx: CanvasRenderingContext2D;
    block: Block | null;
    height: number;
    text: VaraChar[][];

    constructor(props: RenderItemProps) {
        this.textItem = {
            ...props.options,
            ...props.textItem,
        };
        this.height = 0;
        this.fontCharacters = props.fontCharacters;
        this.ctx = props.ctx;
        this.block = null;

        if (typeof this.textItem.text === 'string') {
            this.text = [
                this.textItem.text.split('').map(
                    letter =>
                        new VaraChar({
                            char: letter,
                            fontItem:
                                this.fontCharacters[letter.charCodeAt(0)] ||
                                this.fontCharacters['63'],
                            isSpace: letter === ' ',
                        })
                ),
            ];
        } else if (Array.isArray(this.textItem.text)) {
            this.text = this.textItem.text.map(line =>
                line.split('').map(
                    letter =>
                        new VaraChar({
                            char: letter,
                            fontItem:
                                this.fontCharacters[letter.charCodeAt(0)] ||
                                this.fontCharacters['63'],
                            isSpace: letter === ' ',
                        })
                )
            );
        } else {
            // TODO: Show warning / error
            this.text = [];
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

        if (typeof position === 'number') {
            let textCharCount = 0;
            this.text.forEach((textLine, index) => {
                console.log(textLine, position);
                if (position <= textCharCount + textLine.length) {
                    console.log("Here");
                    console.log("Before", JSON.parse(JSON.stringify(this.text[index])));
                    this.text[index] = [
                        ...textLine.slice(0, position - textCharCount),
                        new VaraChar({
                            char: letter,
                            fontItem:
                                this.fontCharacters[letter.charCodeAt(0)] ||
                                this.fontCharacters['63'],
                            isSpace: letter === ' ',
                        }),
                        ...textLine.slice(position - textCharCount),
                    ];
                    console.log("After", JSON.parse(JSON.stringify(this.text[index])));
                } else {
                    textCharCount += textLine.length;
                }
            });
        }

        this.regeneratePositions();
    }

    regeneratePositions() {
        console.log(this.block);
        let scale = this.textItem.fontSize / SCALEBASE;
        this.height = 0;

        const lines = this.generateLineData(this.text);

        let top = this.textItem.lineHeight;

        const block = this.block as Block;

        if (lines.length > block._lines.length) {
            while (lines.length > block._lines.length) {
                block.addLine({
                    x: 0,
                    y: 0,
                });
            }
        }

        lines.forEach((line, lineIndex) => {
            let left = 0;
            let x = 0,
                y = top;
            if (this.textItem.textAlign === 'center') {
                x = (this.textItem.width - line.width) / 2;
            }

            let lineClass = block.lines[lineIndex];
            lineClass.setPosition(x, y);
            const lettersToSet: Letter[] = [];

            line.text.forEach(letter => {
                if (letter.isSpace) {
                    left += WHITESPACE;
                } else {
                    let foundLetter = block.getLetterById(letter.id);
                    if (foundLetter) {
                        foundLetter.parent = lineClass;
                        foundLetter.setPosition(left, top);
                        lettersToSet.push(foundLetter);
                        left += foundLetter.character.getFontItem().w;
                    } else {
                        lettersToSet.push(
                            lineClass.addLetter({
                                character: letter,
                                width: letter.getFontItem().w,
                                x: left,
                                y: top,
                            })
                        );
                        left += letter.getFontItem().w;
                    }
                }
            });
            top += this.textItem.lineHeight;
            this.height += this.textItem.lineHeight * scale;

            lineClass.setLetters(lettersToSet);

            console.log(lettersToSet);
        });
    }

    generatePositions() {
        let scale = this.textItem.fontSize / SCALEBASE;
        this.height = 0;

        const lines = this.generateLineData(this.text);

        let top = this.textItem.lineHeight;

        const block = new Block({
            width: this.textItem.width,
            x: this.textItem.x,
            y: this.textItem.y,
            ctx: this.ctx,
            options: this.textItem,
        });

        lines.forEach(line => {
            let left = 0;
            let x = 0,
                y = top;
            if (this.textItem.textAlign === 'center') {
                x = (this.textItem.width - line.width) / 2;
            }

            const lineClass = block.addLine({
                x,
                y,
            });

            line.text.forEach(letter => {
                if (letter.isSpace) {
                    left += WHITESPACE;
                } else {
                    const currentLetter = letter.getFontItem();

                    lineClass.addLetter({
                        x: left,
                        y: top,
                        width: currentLetter.w,
                        character: letter,
                    });

                    left += currentLetter.w;
                }
            });
            top += this.textItem.lineHeight;
            this.height += this.textItem.lineHeight * scale;
        });

        this.block = block;
    }

    generateLineData(lines: VaraChar[][]) {
        let scale = this.textItem.fontSize / SCALEBASE;

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
                        (currentLetter.w + pathPositionCorrection) * scale;
                });

                if (
                    (returnData[lines.length - 1]?.width ?? 0) +
                        wordWidth +
                        5 * scale +
                        spaceWidth +
                        this.textItem.x * scale >
                    this.textItem.width
                ) {
                    returnData.push({
                        text: [
                            ...word,
                            new VaraChar({
                                char: ' ',
                                fontItem: this.fontCharacters['63'],
                                isSpace: true,
                            }),
                        ],
                        width: wordWidth,
                    });
                    spaceWidth = 0;
                } else {
                    returnData[returnData.length - 1] = {
                        text: [
                            ...returnData[returnData.length - 1].text,
                            ...word,
                            new VaraChar({
                                char: ' ',
                                fontItem: this.fontCharacters['63'],
                                isSpace: true,
                            }),
                        ],
                        width:
                            returnData[returnData.length - 1].width + wordWidth,
                    };
                    spaceWidth += WHITESPACE * scale;
                }
            });
        });

        return returnData;
    }

    render(rafTime: number) {
        if (this.block) {
            this.block.render(rafTime);
        }
    }

    rendered() {
        return this.block?.lines.length === 0;
    }
}
