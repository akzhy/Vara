import { BlockName } from '../types';
import Block from './block';
import VaraChar from './char';
import LetterPart, { LetterPartProps } from './letterpart';
import Line from './line';
import RenderBase from './renderbase';
export interface LetterProps {
    x: number;
    y: number;
    width: number;
    ctx: CanvasRenderingContext2D;
    parent: Line;
    character: VaraChar;
}
export default class Letter extends RenderBase {
    x: number;
    y: number;
    width: number;
    character: VaraChar;
    id: number;
    parts: LetterPart[];
    drawnParts: LetterPart[];
    name: BlockName;
    rootBlock: Block;
    constructor(props: LetterProps);
    setPosition(x: number, y: number): void;
    /**
     * Add a new part to the queue
     * @param part The part to be added
     */
    addPart(part: Omit<LetterPartProps, 'ctx' | 'parent'>): void;
    setParent(parent: Line): void;
    isDone(): boolean;
    /**
     * Remove the first item from the queue. Used when a part has been drawn completely.
     *
     * The removed item is moved to the drawnParts array
     */
    dequeue(): void;
    /**
     * Render the current letter
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number, previousRAFTime: number): void;
    /**
     * Paints the paths whose animations are complete
     */
    paint(): void;
}
