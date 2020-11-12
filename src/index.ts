//# sourceMappingURL=./vara.js.map
import { SVGPathData } from "svg-pathdata"

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
    };
};

type VaraFontItem = {
    paths: Array<{
        w: number;
        h: number;
        my: number;
        mx: number;
        pw: number;
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
                        pw: 28.2464542388916,
                        d:
                            'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85',
                    },
                    {
                        w: 1.103759765625,
                        h: 1.549820899963379,
                        my: 8.881500004827977,
                        mx: 1,
                        pw: 4.466640472412109,
                        d:
                            'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
                    },
                ],
                w: 8.643798828125,
            },
        };

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.element.appendChild(this.canvas);

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
                    this.render();
                }
            }
        };
        xmlhttp.send(null);
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

        textItem.render.text.split('').forEach(letter => {
            let charCode = letter.charCodeAt(0);
            if (this.fontCharacters[charCode])
                this.fontCharacters[charCode].paths.forEach(path => {
                    const svg = new SVGPathData(path.d);
                    console.log(svg);
                });
        });
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

        if (!textItem.breakWord) {
            const textBlock =
                typeof textItem.text === 'string'
                    ? [textItem.text]
                    : textItem.text;

            const breakedTextBlock = textBlock.map(line => {
                return line.split(' ');
            });

            let lineWidth = 0;
            const lines: string[] = [''];
            breakedTextBlock.forEach(line => {
                line.forEach(word => {
                    let wordWidth = 0;

                    word.split('').forEach(letter => {
                        const charCode = letter.charCodeAt(0);

                        const currentLetter =
                            this.fontCharacters[charCode] ||
                            this.fontCharacters['63'];

                        wordWidth += currentLetter.w * (textItem.fontSize / 16);
                    });

                    if (lineWidth + wordWidth > textItem.width) {
                        lineWidth = 0;
                        lines.push(word);
                    } else {
                        lines[lines.length - 1] += word;
                        lineWidth += wordWidth;
                    }
                    lines[lines.length - 1] += ' ';
                });
            });

            lines.forEach(line => {
                textItem.render = {
                    text: line,
                    x: textItem.x,
                    y: textItem.y,
                };
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

    objectKeys<T>(x: T) {
        let keys = Object.keys(x) as ObjectKeys<T>;
        return keys;
    }
}

if (window) {
    (<any>window).Vara = Vara;
}
