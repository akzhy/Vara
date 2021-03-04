import { VaraFontItem } from "../types";
interface VaraCharProps {
    char: string;
    fontItem: VaraFontItem;
    isSpace?: boolean;
}
export default class VaraChar {
    char: string;
    id: number;
    fontItem: VaraFontItem;
    isSpace: boolean;
    constructor(props: VaraCharProps);
    getFontItem(): VaraFontItem;
    getId(): number;
}
export {};
