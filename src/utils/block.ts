import { BlockName, VaraText } from '../types';
import { SCALEBASE } from './constants';
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

    constructor(props: BlockProps) {
        super(props);

        this.x = props.x;
        this.y = props.y;
        this.width = props.width;

        this.lines = [];
        this._lines = [];
        this.drawnLines = [];
        this.ctx = props.ctx;
        this.previousRAFTime = 0;
        this.totalPathLength = 0;
        this.options = props.options;

        this.name = 'block';

        this.scale = props.options.fontSize / SCALEBASE;
    }

    /**
     * Creates and adds a new line of text
     * @param line The properties of the line to be added
     */
    addLine(line: Omit<LineProps, 'ctx' | 'parent'>) {
        const newLine = new Line({
            ...line,
            ctx: this.ctx,
            parent: this,
        });

        this.lines.push(newLine);
        this._lines.push(newLine);

        return newLine;
    }

    getAllLetters() {
        const letters = this._lines.map(item => item._letters);
        return letters.flat();
    } 


    getLetterById(id: number) {
        return this.getAllLetters().find(item => item.character.id === id) ?? false;
    }

    /**
     * Remove the first item from the queue. Used when a text line has been drawn completely.
     * 
     * The removed item is moved to the drawnParts array
     */
    dequeue() {
        const removedItem = this.lines.shift();
        if (removedItem) this.lines.push(removedItem);
    }

    /**
     * Increment or decrement the total path length
     * @param pathLength Path length that is to be incremented or decrement
     * @param action Whether to increment or decrement
     */
    modifyPathLength(
        pathLength: number,
        action: 'increment' | 'decrement' = 'increment'
    ) {
        if (action === 'increment') {
            this.totalPathLength += pathLength;
        } else {
            this.totalPathLength -= pathLength;
        }
        return this.totalPathLength;
    }

    /**
     * Render the block
     * @param rafTime The time value received from requestAnimationFrame
     */
    render(rafTime: number) {
        if (this.previousRAFTime === 0) {
            this.previousRAFTime = rafTime;
        }

        this.ctx.save();
        this.ctx.strokeStyle = this.options.color;
        this.ctx.lineWidth = this.options.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';


        this.drawnLines.forEach(line => {
            line.render(rafTime, this.previousRAFTime);
        });

        if(this.lines.length > 0) {
            const line = this.lines[0];
            line.render(rafTime, this.previousRAFTime);
            if(line.letters.length === 0) {
                this.dequeue();
            }
        }
        this.ctx.restore();

        this.previousRAFTime = rafTime;
    }
}
