import Block from './block';
import Letter, { LetterProps } from './letter';
import RenderBase from './renderbase';

export interface LineProps {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    parent: Block;
}

let lineId = 0;

/**
 * Used to represent a line of text drawn in the canvas.
 *
 */

export default class Line extends RenderBase {
    x: number;
    y: number;
    width: number;
    letters: Letter[];
    drawnLetters: Letter[];
    id: number;

    constructor(props: LineProps) {
        super(props);

        this.x = props.x;
        this.y = props.y;
        this.ctx = props.ctx;

        // This will act as queue of letters
        // Each item is animated one after the other
        this.letters = [];

        // This will contain all the letters that have already been drawn (animated).
        this.drawnLetters = [];

        // The name of this class.
        // Name is used for finding a specific parent using the getParent method
        this.name = 'line';

        this.width = 0;

        this.id = lineId;
        lineId++;
    }

    /**
     * Add a new letter to this line
     * @param letter - The letter to be added
     */
    addLetter(letter: Omit<LetterProps, 'ctx' | 'parent'> & { parent?: Line }) {
        // Create the letter

        const newLetter = new Letter({
            ...letter,
            parent: letter.parent ?? this,
            ctx: this.ctx,
        });

        // Create all the parts of the letter
        // A letter can have multiple parts.
        // The letter i has two parts, the tittle (dot) and the line part?

        letter.character.getFontItem().paths.forEach(path => {
            newLetter.addPart({
                path: path.d,
                x: path.mx - path.dx,
                y: -path.my,
                pathLength: path.pl,
                dashOffset: 0,
                width: path.w,
            });
        });

        this.width += letter.width;
        this.letters.push(newLetter);

        // Return the newly created letter
        return newLetter;
    }

    removeLetter(letterId: number) {
        this.letters = this.letters.filter(letter => letter.id !== letterId);
        this.drawnLetters = this.drawnLetters.filter(
            letter => letter.id !== letterId
        );
    }

    /**
     * Override the letters of this line.
     *
     * Letter states are preserved.
     *
     * @param letters The new letters of the line
     */
    setLetters(letters: Letter[]) {
        this.letters = letters.filter(letter => !letter.isDone());
        this.drawnLetters = letters.filter(letter => letter.isDone());
    }

    /**
     * Sets the position of the current line
     * @param x X-coordinate, relative to the parent block
     * @param y Y-coordinate, relative to the parent block
     */
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Used to check if all the letters in this line have been drawn.
     */
    isDone() {
        return this.letters.length === 0;
    }

    /**
     * Returns all the letters in this line including those that are to be animated.
     */
    getAllLetters() {
        return [...this.letters, ...this.drawnLetters];
    }

    /**
     * Remove the first letter from the queue. Used when a letter has been drawn completely.
     * The removed letter is moved to the drawnLetters array
     */
    private dequeue() {
        const removedItem = this.letters.shift();
        if (removedItem) this.drawnLetters.push(removedItem);
    }

    /**
     * Render the current line
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number, prevRAFTime: number) {
        this.ctx.save();

        // Set the position of the line
        this.ctx.translate(this.x, this.y);

        if (this.letters.length > 0) {
            const currentLetter = this.letters[0];
            currentLetter.render(rafTime, prevRAFTime);

            // If the current letter is animated, then remove it from the queue and add it to the drawn letters
            if (currentLetter.isDone()) {
                this.dequeue();
            }
        }

        // Paint all the already animated letters
        // The paint method will draw the line without changing the dashOffset

        this.drawnLetters.forEach(letter => {
            letter.paint();
        });

        // Restore canvas state (position)
        this.ctx.restore();
    }
}
