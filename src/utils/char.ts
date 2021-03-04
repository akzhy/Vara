import { VaraFontItem } from "../types";

interface VaraCharProps {
    char: string;
    fontItem: VaraFontItem;
    isSpace?: boolean;
}

let ___varaCharId___ = 0;

export default class VaraChar {
    char: string;
    id: number;
    fontItem: VaraFontItem;
    isSpace: boolean;

    constructor(props:VaraCharProps) {
        this.char = props.char;
        this.fontItem = props.fontItem;
        this.isSpace = props.isSpace ?? false;

        this.id = ___varaCharId___;
        ___varaCharId___++;
    }

    getFontItem() {
        return this.fontItem;
    }

    getId() {
        return this.id;
    }
}