import { VaraFontItem, VaraText, VaraTextOptions } from '../types';
import Block from './block';
import VaraChar from './char';
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
    block: Block;
    height: number;
    text: VaraChar[][];
    constructor(props: RenderItemProps);
    getCursorPosition(position: number): false | {
        x: number;
        y: number;
    };
    addLetter({ letter, position, }: {
        letter: string;
        position: number | number[];
    }): void;
    removeLetter({ position }: {
        position: number | number[];
    }): void;
    regeneratePositions(lines: {
        text: VaraChar[];
        width: number;
    }[]): void;
    generatePositions(): void;
    generateLineData(lines: VaraChar[][]): {
        text: VaraChar[];
        width: number;
    }[];
    render(rafTime: number): void;
    rendered(): boolean;
}
export {};
