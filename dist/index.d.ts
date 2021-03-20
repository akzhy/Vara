import { VaraGeneralOptions, VaraText, VaraFontItem, ObjectKeys } from './types';
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
    fontProperties: {
        s: number;
        slc: 'round';
        bsw: number;
        lh: number;
        space: number;
        tf: number;
    };
    onDrawF?: () => void;
    private readyfn?;
    WHITESPACE: number;
    SCALEBASE: number;
    constructor(elem: string, fontSource: string, text: VaraText[], options: VaraGeneralOptions);
    private init;
    ready(fn: () => void): void;
    onDraw(fn: () => void): void;
    /**
     * Sets default option value for all existing option properties.
     * If an option value is not provided, then it will first check if it is given in the global options, if not it will use the default option.
     */
    private normalizeOptions;
    /**
     * Performs some actions before rendering starts. These include finding the pathLength of each path and generating the render data.
     */
    private preRender;
    private createWhitespaceLine;
    private render;
    calculateCanvasHeight(): number;
    addLetter({ letter, id, position, }: {
        letter: string;
        id: string;
        position: number;
    }): void;
    removeLetter({ id, position }: {
        id: string;
        position: number;
    }): void;
    getCursorPosition({ position, id }: {
        position: number;
        id: string;
    }): false | {
        x: number;
        y: number;
    } | undefined;
    setRenderFunction(id: string, fn: (ctx: CanvasRenderingContext2D) => void): void | undefined;
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
