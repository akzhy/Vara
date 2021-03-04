import Block from "./utils/block";
import Letter from "./utils/letter";
import LetterPart from "./utils/letterpart";
import Line from "./utils/line";
import RenderItem from "./utils/renderitem";
export declare type VaraGeneralOptions = {
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
    lineHeight?: number;
};
export declare type VaraTextOptions = VaraGeneralOptions & {
    id?: string | number | false;
    x?: number;
    y?: number;
    absolutePosition?: boolean;
};
export declare type VaraText = VaraTextOptions & {
    text: string | string[];
};
export declare type RenderData = RenderItem[];
export declare type VaraFontItem = {
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
export declare type ObjectKeys<T> = T extends object ? (keyof T)[] : T extends number ? [] : T extends Array<any> | string ? string[] : never;
export declare const BLOCK_COMPOSITION: readonly ["block", "line", "letter", "letterPart"];
export declare type BlockComposition = typeof BLOCK_COMPOSITION;
export declare type BlockName = BlockComposition[number];
export declare type Blocks = Block | Line | Letter | LetterPart;
export declare type BlockMapped = {
    "block": Block;
    "line": Line;
    "letter": Letter;
    "letterPart": LetterPart;
};
