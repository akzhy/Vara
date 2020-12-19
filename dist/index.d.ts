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
        text: string;
        x: number;
        y: number;
    }[];
};
declare type VaraFontItem = {
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
    render(): void;
    draw(_textItem: RenderData): void;
    normalizeOptions(): void;
    calculatePositions(_textItem: RenderData): void;
    createSVGNode(n: string, v: {
        [x: string]: string;
    }): SVGElement;
    processPath(path: string, x?: number, y?: number): string;
    objectKeys<T>(x: T): ObjectKeys<T>;
}
declare class Group {
    items: any[];
    x: number;
    y: number;
    constructor();
}
