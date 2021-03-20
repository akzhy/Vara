import {
    VaraGeneralOptions,
    VaraText,
    VaraFontItem,
    ObjectKeys,
    VaraTextOptions,
} from './types';
import Block from './utils/block';

export default class Vara {
    elementName: string;
    element: HTMLElement;
    fontSource: string;
    options: VaraGeneralOptions;
    textItems: VaraText[];
    blocks: Block[];
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
    onDrawF?: () => void;
    private readyfn?: () => void;

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
                global: 0,
            },
            width: this.element.getBoundingClientRect().width,
            lineHeight: 30,
        };

        this.defaultCharacters = {
            '63': {
                paths: [
                    {
                        w: 8.6437,
                        h: 14.23173,
                        my: 22.6665,
                        mx: 0,
                        dx: 0,
                        d:
                            'm 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85',
                        pl: 1,
                    },
                    {
                        w: 1.1037,
                        h: 1.5498,
                        my: 8.8815,
                        dx: 0,
                        mx: 1,
                        d:
                            'm 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z',
                        pl: 1,
                    },
                ],
                w: 8.6437,
            },
        };

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.element.getBoundingClientRect().width;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.element.appendChild(this.canvas);
        this.WHITESPACE = 10;
        this.SCALEBASE = 16;

        this.contextHeight = 0;

        this.init();
    }

    private init() {
        this.normalizeOptions();

        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', this.fontSource, true);
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    const contents = JSON.parse(xmlhttp.responseText);
                    this.fontCharacters = contents.c;
                    this.fontProperties = contents.p;
                    this.preRender();
                    if (this.readyfn) this.readyfn();
                    this.render();
                }
            }
        };
        xmlhttp.send(null);
    }

    ready(fn: () => void) {
        this.readyfn = fn;
    }

    onDraw(fn: () => void) {
        this.onDrawF = fn;
    }

    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    private normalizeOptions() {
        this.options = this.options || {};

        this.options = {
            ...this.defaultOptions,
            ...this.options,
        };

        Object.keys(this.defaultCharacters).forEach(character => {
            if (this.fontCharacters[character] === undefined) {
                this.fontCharacters[character] = this.defaultCharacters[
                    character
                ];
            }
        });
    }

    /**
     * Performs some actions before rendering starts. These include finding the pathLength of each path and generating the render data.
     */
    private preRender() {
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

        this.textItems.forEach(item => {
            const block = new Block({
                root: this,
                options: {
                    ...(this.options as Required<VaraTextOptions>),
                    ...item,
                },
                ctx: this.ctx,
            });

            this.blocks.push(block);
        });
    }

    private render(rafTime = 0) {
        let canvasHeight = this.calculateCanvasHeight();
        if (canvasHeight !== this.canvas.height) {
            this.canvas.height = canvasHeight;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, canvasHeight);

        this.blocks.forEach(item => {
            item.render(rafTime);
        });

        window.requestAnimationFrame(time => this.render(time));
    }

    // TODO: Make proper calculation function.
    calculateCanvasHeight() {
        let height = 0;
        this.blocks.forEach(item => {
            if (item.height && item.options.y) {
                height += item.height + item.options.y;
            }
        });
        return height + 50;
    }

    addLetter({
        letter,
        id,
        position,
    }: {
        letter: string;
        id: string;
        position: number;
    }) {
        const block = this.blocks.find(item => item.options.id === id);
        block?.addLetter({ letter, position });
        // if(block) {
        //     block.
        // }
    }

    removeLetter({ id, position }: { id: string; position: number }) {
        const block = this.blocks.find(item => item.options.id === id);

        block?.removeLetter({ position });
        // if(block) {
        //     block.
        // }
    }

    getCursorPosition({ position, id }: { position: number; id: string }) {
        const block = this.blocks.find(item => item.options.id === id);

        return block?.getCursorPosition(position);
    }

    setRenderFunction(id: string, fn: (ctx: CanvasRenderingContext2D) => void) {
        const block = this.blocks.find(item => item.options.id === id);
        return block?.setRenderFunction(fn);
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

if (window) {
    (window as any).Vara = Vara;
}
