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
    _letters: Letter[];
    drawnLetters: Letter[];
    name: BlockName;

    constructor(props: LineProps) {
        super(props);

        this.x = props.x;
        this.y = props.y;
        this.ctx = props.ctx;
        this.letters = [];
        this._letters = [];
        this.drawnLetters = [];
        this.name = "line";
    }

    addLetter(letter: Omit<LetterProps, "ctx"|"parent"> & { parent?: Line}) {
        const newLetter = new Letter({
            ...letter,
            parent: letter.parent ?? this,
            ctx: this.ctx
        })

        letter.character.getFontItem().paths.forEach(path => {
            newLetter.addPart({
                path: path.d,
                x: path.mx - path.dx,
                y: -path.my,
                pathLength: path.pl,
                dashOffset: 0,
                width: path.w,
            });
        })
        this.letters.push(newLetter);
        this._letters.push(newLetter);

        return newLetter;
    }

    setLetters(letters: Letter[]) {
        this._letters = letters;
        this.letters = letters.filter(letter => !letter.isDone());
        this.drawnLetters = letters.filter(letter => letter.isDone());
    }

    generateLetter(letter: Omit<LetterProps, "ctx"|"parent">) {
        const newLetter = new Letter({
            ...letter,
            parent: this,
            ctx: this.ctx
        })
        return newLetter;
    }

    setPosition(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    isDone(){
        return this.letters.length === 0;
    }

    getAllLetters(){
        return this._letters;
    }

    /**
     * Remove the first item from the queue. Used when a letter has been drawn completely.
     * The removed item is moved to the drawnLetters array
     */
    dequeue() {
        const removedItem = this.letters.shift();
        if (removedItem) this.drawnLetters.push(removedItem);
    }

    /**
     * Render the current line
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number, prevRAFTime: number){
        this.ctx.save();
        this.ctx.translate(this.x, this.y);

        if(this.letters.length > 0) {
            const currentLetter = this.letters[0];
            currentLetter.render(rafTime, prevRAFTime);

            if(currentLetter.parts.length === 0) {
                this.dequeue();
            }
        }

        this.drawnLetters.forEach(letter => {
            letter.paint();
        })

        this.ctx.restore();
    }
}