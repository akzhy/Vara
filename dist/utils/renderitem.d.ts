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
    block: Block | null;
    height: number;
    text: VaraChar[][];
    constructor(props: RenderItemProps);
    addLetter({ letter, position, }: {
        letter: string;
        position: number | number[];
    }): void;
    regeneratePositions(): void;
    generatePositions(): void;
    generateLineData(lines: VaraChar[][]): {
        text: VaraChar[];
        width: number;
    }[];
    render(rafTime: number): void;
    rendered(): boolean;
}
export {};
