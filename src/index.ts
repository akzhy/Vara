//# sourceMappingURL=./vara.js.map
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
};

type VaraTextOptions = VaraGeneralOptions & {
    id?: string | number | false;
    x?: number;
    y?: number;
    fromCurrentPosition?: {
        x?: boolean;
        y?: boolean;
    };
};

type VaraText = VaraTextOptions & {
    text: string;
};

type RenderData = VaraText & {
    render?: {
        text: string;
        x: number;
        y: number;
    }[];
};

type VaraFontItem = {
    paths: Array<{
        w: number;
        h: number;
        my: number;
        mx: number;
        dx: number;
        d: string;
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
                    },
                    {
                        w: 1.103759765625,
                        h: 1.549820899963379,
                        my: 8.881500004827977,
                        dx: 0,
                        mx: 1,
                        d:
                            'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
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
                }
            }
        };
        xmlhttp.send(null);
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
            });
        });
    }

    render() {
        this.calculatePositions(this.renderData[1]);
        this.draw(this.renderData[1]);
    }

    draw(_textItem: RenderData) {
        // path - "d": "m 0,0 c 1.677946,-5.44834,5.875964,-14.09066,3.788545,-14.26551,-1.909719,-0.15996,-2.796112,9.62055,-3.788545,14.26551 z"
        const textItem = <Required<RenderData>>_textItem;
        this.ctx.strokeStyle = textItem.color;
        this.ctx.lineWidth = textItem.strokeWidth;
        this.ctx.fillStyle = 'transparent';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        let top = 0;

        let scale = textItem.fontSize / this.SCALEBASE;

        textItem.render.forEach(textLine => {
            let left = textLine.x/2;
            
            textLine.text.split('').forEach(letter => {
                let charCode = letter.charCodeAt(0);
                if (letter === ' ') {
                    left += this.WHITESPACE;
                } else if (this.fontCharacters[charCode]) {
                    this.ctx.save();
                    this.ctx.scale(scale, scale);
                    this.fontCharacters[charCode].paths.forEach(path => {
                        let processedPath = this.processPath(path.d, left + path.mx - path.dx, textLine.y + top + 20 - path.my + 1)
                        this.ctx.stroke(new Path2D(processedPath));
                    });
                    left += this.fontCharacters[charCode].w;
                    this.ctx.restore();
                }
            });
            top+= 30;
        })
    }

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

    calculatePositions(_textItem: RenderData) {
        const textItem = <Required<RenderData>>_textItem;
        let scale = textItem.fontSize / this.SCALEBASE;
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
            }[] = [{
                text: "",
                width: 0
            }];
            breakedTextBlock.forEach(line => {
                let spaceWidth = 0;
                line.forEach(word => {
                    let wordWidth = 0;

                    word.split('').forEach(letter => {
                        const charCode = letter.charCodeAt(0);

                        const currentLetter =
                            this.fontCharacters[charCode] ||
                            this.fontCharacters['63'];
                        let pathPositionCorrection = currentLetter.paths.reduce((a,c) => a+c.mx-c.dx, 0)
                        wordWidth += (currentLetter.w + pathPositionCorrection) * scale;
                    });

                    if (lines[lines.length-1].width + wordWidth + spaceWidth + textItem.x*scale > textItem.width) {
                        lines.push({
                            text: word,
                            width: wordWidth
                        });
                        spaceWidth = 0;
                    } else {
                        lines[lines.length - 1] = {
                            text: lines[lines.length-1].text+word,
                            width: lines[lines.length-1].width+wordWidth
                        };
                        spaceWidth+= this.WHITESPACE * scale;
                        lines[lines.length - 1].text += ' ';
                    }
                });
            });

            lines.forEach(line => {
                console.log(line.text, line.width)
                let x = textItem.x;
                if(textItem.textAlign === "center") {
                    console.log(line.width, (textItem.width - line.width)/2);
                    x = (textItem.width - line.width)/2;
                }
                if (textItem.render) {
                    textItem.render.push({
                        text: line.text,
                        x: x,
                        y: textItem.y,
                    });
                } else {
                    textItem.render = [
                        {
                            text: line.text,
                            x: x,
                            y: textItem.y,
                        },
                    ];
                }
            });
        }
    }

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

    processPath(path:string, x=0, y=0) {
        let svgPath = path.split('');
        svgPath[2] = x + 1 + '';
        svgPath[4] = y + '';
        return svgPath.join('');
    }

    objectKeys<T>(x: T) {
        let keys = Object.keys(x) as ObjectKeys<T>;
        return keys;
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
