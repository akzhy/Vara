import { BlockName, VaraText } from '../types';
import Line, { LineProps } from './line';
import RenderBase from './renderbase';
interface BlockProps {
    x: number;
    y: number;
    width: number;
    ctx: CanvasRenderingContext2D;
    options: Required<VaraText>;
}
export default class Block extends RenderBase {
    x: number;
    y: number;
    width: number;
    scale: number;
    ctx: CanvasRenderingContext2D;
    previousRAFTime: number;
    lines: Line[];
    _lines: Line[];
    drawnLines: Line[];
    totalPathLength: number;
    options: Required<VaraText>;
    name: BlockName;
    constructor(props: BlockProps);
    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */
    addLine(line: Omit<LineProps, 'ctx' | 'parent'>): Line;
    getAllLetters(): import("./letter").default[];
    getLetterById(id: number): false | import("./letter").default;
    /**
     * Remove the first item from the queue. Used when a text line has been drawn completely.
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
