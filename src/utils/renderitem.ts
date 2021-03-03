import { VaraFontItem, VaraText, VaraTextOptions } from '../types';
import Block from './block';
import { SCALEBASE, WHITESPACE } from './constants';

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

    constructor(props: RenderItemProps) {
        this.textItem = {
            ...props.options,
            ...props.textItem,
        };
        console.log(this.textItem);
        this.height = 0;
        this.fontCharacters = props.fontCharacters;
        this.ctx = props.ctx;
        this.block = null;
    }

    generatePositions() {
        let scale = this.textItem.fontSize / SCALEBASE;
        this.height = 0;
        // TODO: Create non breaking text
        if (!this.textItem.breakWord) {
            const textBlock =
                typeof this.textItem.text === 'string'
                    ? [this.textItem.text]
                    : this.textItem.text;

            const breakedTextBlock = textBlock.map(line => {
                return line.split(' ');
            });

            const lines: {
                text: string;
                width: number;
            }[] = [
                {
                    text: '',
                    width: 0,
                },
            ];

            breakedTextBlock.forEach(line => {
                let spaceWidth = 0;
                line.forEach(word => {
                    let wordWidth = 0;

                    word.split('').forEach(letter => {
                        const charCode = letter.charCodeAt(0);

                        const currentLetter =
                            this.fontCharacters[charCode] ||
                            this.fontCharacters['63'];
                        let pathPositionCorrection = currentLetter.paths.reduce(
                            (a, c) => a + c.mx - c.dx,
                            0
                        );
                        wordWidth +=
                            (currentLetter.w + pathPositionCorrection) * scale;
                    });

                    if (
                        lines[lines.length - 1].width +
                            wordWidth +
                            5 * scale +
                            spaceWidth +
                            this.textItem.x * scale >
                        this.textItem.width
                    ) {
                        lines.push({
                            text: word + ' ',
                            width: wordWidth,
                        });
                        spaceWidth = 0;
                    } else {
                        lines[lines.length - 1] = {
                            text: lines[lines.length - 1].text + word,
                            width: lines[lines.length - 1].width + wordWidth,
                        };
                        spaceWidth += WHITESPACE * scale;
                        lines[lines.length - 1].text += ' ';
                    }
                });
            });

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
                    y = 0;
                if (this.textItem.textAlign === 'center') {
                    x = (this.textItem.width - line.width) / 2;
                }

                const lineClass = block.addLine({
                    x,
                    y,
                });

                line.text.split('').forEach(letter => {
                    console.log(letter);
                    if (letter === ' ') {
                        left += WHITESPACE;
                    } else {
                        const currentLetter =
                            this.fontCharacters[letter.charCodeAt(0)] ||
                            this.fontCharacters['63'];

                        const letterClass = lineClass.addLetter({
                            x: left,
                            y: top,
                            width: currentLetter.w,
                        });

                        currentLetter.paths.forEach(path => {
                            letterClass.addPart({
                                path: path.d,
                                x: path.mx - path.dx,
                                y: -path.my,
                                pathLength: path.pl,
                                dashOffset: 0,
                                width: path.w,
                            });
                        });
                        left += currentLetter.w;
                    }
                });
                top += this.textItem.lineHeight;
                this.height += this.textItem.lineHeight * scale;
            });

            this.block = block;
        }
    }

    render(rafTime:number){
        if(this.block) {
            this.block.render(rafTime);
        }
    }

    rendered() {
        return this.block?.lines.length === 0;
    }
}
