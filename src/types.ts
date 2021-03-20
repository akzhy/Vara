import Block from "./utils/block";
import Letter from "./utils/letter";
import LetterPart from "./utils/letterpart";
import Line from "./utils/line";

export type VaraGeneralOptions = {
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
    lineHeight?: number;
};

export type VaraTextOptions = VaraGeneralOptions & {
    id?: string | number | false;
    x?: number;
    y?: number;
    absolutePosition?: boolean;
};

export type VaraText = VaraTextOptions & {
    text: string | string[];
};

export type VaraFontItem = {
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

export type ObjectKeys<T> = T extends object
    ? (keyof T)[]
    : T extends number
    ? []
    : T extends Array<any> | string
    ? string[]
    : never;

export const BLOCK_COMPOSITION = ["block","line","letter","letterPart"] as const;

export type BlockComposition = typeof BLOCK_COMPOSITION;

export type BlockName = BlockComposition[number];

export type Blocks = Block | Line | Letter | LetterPart;

export type BlockMapped = {
    "block" : Block,
    "line": Line,
    "letter": Letter,
    "letterPart": LetterPart
}