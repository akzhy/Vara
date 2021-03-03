import { BlockName } from "../types";
import Block from "./block";
import Letter, { LetterProps } from "./letter";
import RenderBase from "./renderbase";
export interface LineProps {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    parent: Block;
}
export default class Line extends RenderBase {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    letters: Letter[];
    drawnLetters: Letter[];
    name: BlockName;
    constructor(props: LineProps);
    addLetter(letter: Omit<LetterProps, "ctx" | "parent">): Letter;
    /**
     * Remove the first item from the queue. Used when a letter has been drawn completely.
     * The removed item is moved to the drawnLetters array
     */
    dequeue(): void;
    /**
     * Render the current line
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number, prevRAFTime: number): void;
    paint(): void;
}
