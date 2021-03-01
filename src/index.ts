type VaraGeneralOptions = {
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: 'left' | 'center' | 'right';
    autoAnimation?: boolean;
    queued?: boolean;
    delay?: number;
    letterSpacing?:
        | {
              [x: string]: number;
          }
        | number;
    breakWord?: boolean;
    width?: number;
    lineHeight?: number;
};

type VaraTextOptions = VaraGeneralOptions & {
    id?: string | number | false;
    x?: number;
    y?: number;
    absolutePosition?: boolean;
};

type VaraText = VaraTextOptions & {
    text: string;
};

type RenderData = VaraText & {
    render?: {
        path: string;
        x: number;
        y: number;
        pathLength: number;
        dashOffset: number;
    }[];
    currentlyDrawing?: number;
    startTime?: number | false;
    height?: number;
    lastRaf?: number;
    index?: number;
    finished?: boolean;
    started?: boolean;
};

type VaraFontItem = {
    paths: Array<{
        w: number;
        h: number;
        my: number;
        mx: number;
        dx: number;
        d: string;
        pl: number;
    }>;
    w: number;
};

type ObjectKeys<T> = T extends object
    ? (keyof T)[]
    : T extends number
    ? []
    : T extends Array<any> | string
    ? string[]
    : never;

class Vara {
    elementName: string;
    element: HTMLElement;
    fontSource: string;
    options: VaraGeneralOptions;
    textItems: VaraText[];
    renderData: RenderData[];
    rendered: boolean;
    defaultOptions: Required<VaraGeneralOptions>;
    defaultCharacters: {
        [x: string]: VaraFontItem;
    };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    contextHeight: number;
    fontCharacters: {
        [x: string]: VaraFontItem;
    };
    fontProperties!: {
        s: number;
        // TODO: add other properties
        slc: 'round';
        bsw: number;
        lh: number;
        space: number;
        tf: number;
    };
    WHITESPACE: number;
    SCALEBASE: number;

    constructor(
        elem: string,
        fontSource: string,
        text: VaraText[],
        options: VaraGeneralOptions
    ) {
        this.elementName = elem;
        this.element = document.querySelector(elem) as HTMLElement;
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
                global: 0,
            },
            width: this.element.getBoundingClientRect().width,
            lineHeight: 30,
        };

        this.defaultCharacters = {
            '63': {
                paths: [
                    {
                        w: 8.643798828125,
                        h: 14.231731414794922,
                        my: 22.666500004827977,
                        mx: 0,
                        dx: 0,
                        d:
                            'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85',
                        pl: 1,
                    },
                    {
                        w: 1.103759765625,
                        h: 1.549820899963379,
                        my: 8.881500004827977,
                        dx: 0,
                        mx: 1,
                        d:
                            'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
                        pl: 1,
                    },
                ],
                w: 8.643798828125,
            },
        };

        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.element.appendChild(this.canvas);
        this.WHITESPACE = 10;
        this.SCALEBASE = 16;

        this.contextHeight = 0;

        this.init();
    }

    init() {
        this.normalizeOptions();

        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', this.fontSource, true);
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const contents = JSON.parse(xmlhttp.responseText);
                    this.fontCharacters = contents.c;
                    this.fontProperties = contents.p;
                    this.preRender();
                    this.render();
                    //window.requestAnimationFrame()
                }
            }
        };
        xmlhttp.send(null);
    }

    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */

    normalizeOptions() {
        this.options = this.options || {};

        this.objectKeys(this.defaultOptions).forEach(optionKey => {
            if (this.options[optionKey] === undefined) {
                // @ts-ignore
                this.options[optionKey] = this.defaultOptions[optionKey];
            }
        });

        this.renderData.forEach((textItem, i) => {
            if (typeof textItem === 'string') {
                this.renderData[i] = {
                    text: textItem,
                    ...this.defaultOptions,
                };
            } else if (typeof textItem === 'object') {
                this.objectKeys(this.options).forEach(option => {
                    if (textItem[option] === undefined)
                        // @ts-ignore
                        textItem[option] = this.options[option];
                });
            }
        });

        Object.keys(this.defaultCharacters).forEach(character => {
            if (this.fontCharacters[character] === undefined) {
                this.fontCharacters[character] = this.defaultCharacters[
                    character
                ];
            }
        });
    }

    preRender() {
        let svg = this.createSVGNode('svg', {
            width: '100',
            height: '100',
        });
        svg.style.position = 'absolute';
        svg.style.zIndex = '-100';
        svg.style.opacity = '0';
        svg.style.top = '0';

        document.body.appendChild(svg);
        let svgPathData = this.createSVGNode('path', {
            d: '',
        }) as SVGPathElement;
        svg.appendChild(svgPathData);
        this.objectKeys(this.fontCharacters).forEach(char => {
            this.fontCharacters[char].paths.forEach((path, i) => {
                svgPathData.setAttributeNS(null, 'd', path.d);
                this.fontCharacters[char].paths[
                    i
                ].dx = svgPathData.getBoundingClientRect().x;
                this.fontCharacters[char].paths[
                    i
                ].pl = svgPathData.getTotalLength();
            });
        });

        this.renderData.forEach((item, index) => {
            item.currentlyDrawing = 0;
            item.startTime = false;

            item.index = index;
            this.generateRenderData(item);
        });

        console.log(this.renderData);
    }

    render(rafTime = 0) {
        let canvasHeight = this.calculateCanvasHeight();
        if (canvasHeight !== this.canvas.height) {
            this.canvas.height = canvasHeight;
        }
        this.ctx.clearRect(0, 0, 800, canvasHeight);

        const firstQueued = this.renderData.find(item => item.queued);
        if (firstQueued) {
            firstQueued.started = true;
        }

        this.renderData.forEach(item => {
            if (!item.queued) {
                item.started = true;
            }
            this.draw(item, rafTime);
        });

        window.requestAnimationFrame(time => this.render(time));
    }

    draw(_textItem: RenderData, rafTime: number) {
        const textItem = <Required<RenderData>>_textItem;
        this.ctx.strokeStyle = textItem.color;
        this.ctx.lineWidth = textItem.strokeWidth;
        this.ctx.fillStyle = 'transparent';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        let scale = textItem.fontSize / this.SCALEBASE;

        const totalPathLength = textItem.render.reduce(
            (a, c) => a + c.pathLength,
            0
        );

        if (!textItem.startTime) {
            textItem.startTime = rafTime;
            textItem.lastRaf = rafTime;
        }

        textItem.render.forEach((item, itemIndex) => {

            if(!textItem.started) {
                return;
            }

            this.ctx.save();
            this.ctx.scale(scale, scale);

            this.ctx.lineDashOffset = 1;
            this.ctx.setLineDash([item.dashOffset, item.pathLength + 1]);

            if (textItem.finished) {
                this.ctx.stroke(
                    new Path2D(this.processPath(item.path, item.x, item.y))
                );
                this.ctx.restore();
                return;
            }

            const delta = (rafTime - (textItem.startTime as number)) / 1000;
            if (textItem.started && textItem.delay > 0) {
                textItem.delay-= rafTime-textItem.lastRaf;
                textItem.lastRaf = rafTime;
                return;
            }


            const pathDuration =
                ((item.pathLength / totalPathLength) * textItem.duration) /
                1000;

            const speed = item.pathLength / pathDuration;

            if (textItem.currentlyDrawing === itemIndex) {
                if (item.dashOffset >= item.pathLength) {
                    textItem.currentlyDrawing += 1;
                    if (textItem.currentlyDrawing >= textItem.render.length) {
                        textItem.finished = true;
                        this.startDrawingNext(textItem.index);
                    }
                }
                item.dashOffset += speed * delta;
            }

            this.ctx.stroke(
                new Path2D(this.processPath(item.path, item.x, item.y))
            );
            this.ctx.restore();
        });

        textItem.startTime = rafTime;
    }

    /**
     * Calculates the position of each item on the canvas and returns the data required to render it.
     * @param {RenderData} _textItem A single text block that needs to be rendered.
     */
    generateRenderData(_textItem: RenderData) {
        const textItem = <Required<RenderData>>_textItem;
        let scale = textItem.fontSize / this.SCALEBASE;
        textItem.height = 0;
        // TODO: Create non breaking text
        if (!textItem.breakWord) {
            const textBlock =
                typeof textItem.text === 'string'
                    ? [textItem.text]
                    : textItem.text;

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
                            textItem.x * scale >
                        textItem.width
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
                        spaceWidth += this.WHITESPACE * scale;
                        lines[lines.length - 1].text += ' ';
                    }
                });
            });

            let posX = textItem.x / scale,
                posY =
                    this.getTopPosition(textItem.index) / scale +
                    textItem.y / scale,
                top = textItem.lineHeight;

            if (!textItem.render) {
                textItem.render = [];
            }
            lines.forEach(line => {
                let left = 0;
                let x = posX,
                    y = posY;
                if (textItem.textAlign === 'center') {
                    x = (textItem.width - line.width) / 2 / scale;
                }
                line.text.split('').forEach(letter => {
                    if (letter === ' ') {
                        left += this.WHITESPACE;
                    } else {
                        const currentLetter =
                            this.fontCharacters[letter.charCodeAt(0)] ||
                            this.fontCharacters['63'];

                        currentLetter.paths.forEach(path => {
                            textItem.render.push({
                                path: path.d,
                                x: x + left + path.mx - path.dx,
                                y: y + top - path.my,
                                pathLength: path.pl,
                                dashOffset: 0,
                            });
                        });

                        left += currentLetter.w;
                    }
                });
                top += textItem.lineHeight;
                textItem.height += textItem.lineHeight * scale;
                // if (!textItem.absolutePosition) {
                //     console.log(textItem.height, textItem.lineHeight);
                // }
            });
        }
    }

    calculateCanvasHeight() {
        let height = 0;
        this.renderData.forEach(item => {
            if (item.height && item.y) {
                height += item.height + item.y;
            }
        });
        return height + 50;
    }

    getTopPosition(i: number) {
        if (i === 0) return 0;
        else {
            let topPosition = 0;
            this.renderData.slice(0, i).forEach(item => {
                if (!item.absolutePosition) {
                    topPosition += (item.height ?? 0) + (item.y ?? 0);
                }
            });
            return topPosition;
        }
    }

    alterText(
        id: number,
        text: string,
        letterAnimate: (text: string) => number[]
    ) {
        this.renderData[id].currentlyDrawing = 0;
        this.renderData[id].render = [];
        this.renderData[id].text = text;

        let shouldAnimate = letterAnimate(text);
        this.generateRenderData(this.renderData[id]);

        this.renderData[id].render?.forEach((item, i) => {
            if (!shouldAnimate.includes(i)) {
                item.dashOffset = item.pathLength;
            }
        });
    }

    startDrawingNext(current: number) {
        if (current + 1 < this.renderData.length) {
            this.renderData[current + 1].started = true;
        }
    }

    /**
     * Creates and returns an SVG element
     * @param n The name of the SVG node to be created
     * @param v The attributes of the node
     */

    createSVGNode(n: string, v: { [x: string]: string }) {
        const e = document.createElementNS('http://www.w3.org/2000/svg', n);
        for (var p in v)
            e.setAttributeNS(
                null,
                p.replace(/[A-Z]/g, function(m) {
                    return '-' + m.toLowerCase();
                }),
                v[p]
            );
        return e;
    }

    /**
     * Modifies the move to command of a given path and returns it.
     * @param path The path "d" property
     * @param x The x co-ordinate
     * @param y The y co-ordinate
     */
    processPath(path: string, x = 0, y = 0) {
        let svgPath = path.split('');
        svgPath[2] = x + 1 + '';
        svgPath[4] = y + '';
        return svgPath.join('');
    }

    objectKeys<T>(x: T) {
        let keys = Object.keys(x) as ObjectKeys<T>;
        return keys;
    }

    boundRect(x: number, y: number, w: number, h = 10) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(209, 56, 61,0.4)';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.fill();
        this.ctx.restore();
    }
}

class Group {
    items: any[];
    x: number;
    y: number;

    constructor() {
        this.items = [];
        this.x = 0;
        this.y = 0;
    }
}

if (window) {
    (<any>window).Vara = Vara;
}
