declare type VaraGeneralOptions = {
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: 'left' | 'center' | 'right';
    autoAnimation?: boolean;
    queued?: boolean;
    delay?: number;
    letterSpacing?: {
        [x: string]: number;
    } | number;
    breakWord?: boolean;
    width?: number;
};
declare type VaraTextOptions = VaraGeneralOptions & {
    id?: string | number | false;
    x?: number;
    y?: number;
    fromCurrentPosition?: {
        x?: boolean;
        y?: boolean;
    };
};
declare type VaraText = VaraTextOptions & {
    text: string;
};
declare type RenderData = VaraText & {
    render?: {
        path: string;
        x: number;
        y: number;
        pathLength: number;
        dashOffset: number;
    }[];
    currentlyDrawing?: number;
    startTime?: number | false;
};
declare type VaraFontItem = {
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
declare type ObjectKeys<T> = T extends object ? (keyof T)[] : T extends number ? [] : T extends Array<any> | string ? string[] : never;
declare class Vara {
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
    fontProperties: {
        s: number;
        slc: 'round';
        bsw: number;
        lh: number;
        space: number;
        tf: number;
    };
    WHITESPACE: number;
    SCALEBASE: number;
    constructor(elem: string, fontSource: string, text: VaraText[], options: VaraGeneralOptions);
    init(): void;
    preRender(): void;
    render(rafTime?: number): void;
    draw(_textItem: RenderData, rafTime: number): void;
    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    normalizeOptions(): void;
    /**
     * Calculates the position of each item on the canvas and returns the data required to render it.
     * @param {RenderData} _textItem A single text block that needs to be rendered.
     */
    generateRenderData(_textItem: RenderData): void;
    /**
     * Creates and returns an SVG element
     * @param n The name of the SVG node to be created
     * @param v The attributes of the node
     */
    createSVGNode(n: string, v: {
        [x: string]: string;
    }): SVGElement;
    /**
     * Modifies the move to command of a given path and returns it.
     * @param path The path "d" property
     * @param x The x co-ordinate
     * @param y The y co-ordinate
     */
    processPath(path: string, x?: number, y?: number): string;
    objectKeys<T>(x: T): ObjectKeys<T>;
    boundRect(x: number, y: number, w: number, h?: number): void;
}
declare class Group {
    items: any[];
    x: number;
    y: number;
    constructor();
}
