import Block from './block';
import Letter, { LetterProps } from './letter';
import RenderBase from './renderbase';
export interface LineProps {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    parent: Block;
}
/**
 * Used to represent a line of text drawn in the canvas.
 *
 */
export default class Line extends RenderBase {
    x: number;
    y: number;
    letters: Letter[];
    drawnLetters: Letter[];
    id: number;
    private _letters;
    constructor(props: LineProps);
    /**
     * Add a new letter to this line
     * @param letter - The letter to be added
     */
    addLetter(letter: Omit<LetterProps, 'ctx' | 'parent'> & {
        parent?: Line;
    }): Letter;
    removeLetter(letterId: number): void;
    /**
     * Override the letters of this line.
     *
     * Letter states are preserved.
     *
     * @param letters The new letters of the line
     */
    setLetters(letters: Letter[]): void;
    /**
     * Sets the position of the current line
     * @param x X-coordinate, relative to the parent block
     * @param y Y-coordinate, relative to the parent block
     */
    setPosition(x: number, y: number): void;
    /**
     * Used to check if all the letters in this line have been drawn.
     */
    isDone(): boolean;
    /**
     * Returns all the letters in this line including those that are to be animated.
     */
    getAllLetters(): Letter[];
    /**
     * Remove the first letter from the queue. Used when a letter has been drawn completely.
     * The removed letter is moved to the drawnLetters array
     */
    private dequeue;
    /**
     * Render the current line
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number, prevRAFTime: number): void;
}
