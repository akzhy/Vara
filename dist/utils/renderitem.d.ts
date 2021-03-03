import { VaraFontItem, VaraText, VaraTextOptions } from '../types';
import Block from './block';
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
    constructor(props: RenderItemProps);
    generatePositions(): void;
    render(rafTime: number): void;
    rendered(): boolean;
}
export {};
