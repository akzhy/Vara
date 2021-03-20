import Vara from '..';
import { BlockName, VaraText } from '../types';
import VaraChar from './char';
import Letter from './letter';
import Line, { LineProps } from './line';
import RenderBase from './renderbase';
interface BlockProps {
    ctx: CanvasRenderingContext2D;
    options: Required<VaraText>;
    root: Vara;
}
export default class Block extends RenderBase {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    ctx: CanvasRenderingContext2D;
    previousRAFTime: number;
    lines: Line[];
    drawnLines: Line[];
    totalPathLength: number;
    options: Required<VaraText>;
    text: VaraChar[][];
    private root;
    private userDefinedRenderFn;
    name: BlockName;
    constructor(props: BlockProps);
    private initTextToVaraChar;
    private regeneratePositions;
    private generatePositions;
    private generateLineData;
    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */
    addLine(line: Omit<LineProps, 'ctx' | 'parent'>): Line;
    removeLine(index?: number): void;
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
    getAllLetters(): Letter[];
    getLines(): Line[];
    getLineCount(): number;
    getLineAtIndex(index: number): Line;
    getLastLine(): Line;
    getLetterByCharacterId(id: number): false | Letter;
    setRenderFunction(fn: (ctx: CanvasRenderingContext2D, rafTime: number) => void): void;
    /**
     * Remove the first line from the queue of lines. Used when a text line has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    dequeue(): void;
    /**
     * Increment or decrement the total path length
     * @param pathLength Path length that is to be incremented or decrement
     * @param action Whether to increment or decrement
     */
    modifyPathLength(pathLength: number, action?: 'increment' | 'decrement'): number;
    /**
     * Render the block
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number): void;
}
export {};
