import { BlockName } from '../types';
import Block from './block';
import Letter from './letter';
import RenderBase from './renderbase';

export interface LetterPartProps {
    x: number;
    y: number;
    path: string;
    pathLength: number;
    dashOffset: number;
    width: number;
    ctx: CanvasRenderingContext2D;
    parent: Letter;
}

export default class LetterPart extends RenderBase {
    x: number;
    y: number;
    path: string;
    pathLength: number;
    dashOffset: number;
    width: number;
    name: BlockName;
    rootBlock: Block;

    constructor(props: LetterPartProps) {
        super(props);

        this.x = props.x;
        this.y = props.y;
        this.path = props.path;
        this.pathLength = props.pathLength;
        this.dashOffset = props.dashOffset;
        this.width = props.width;

        this.name = 'letterPart';

        this.rootBlock = this.getParent('block', this) as Block;
    }

    /**
     * Paints the path
     */
    paint() {
        this.ctx.save();
        this.ctx.stroke(
            new Path2D(this.processPath(this.path, this.x, this.y))
        );
        this.ctx.restore();
    }

    /**
     * Increments the dashOffset and then paints the path.
     */
    draw(delta: number) {
        const pathDuration =
            ((this.pathLength / this.rootBlock.totalPathLength) *
                this.rootBlock.options.duration) /
            1000;

        const speed = this.pathLength / pathDuration;

        this.ctx.save();
        this.ctx.lineDashOffset = 1;
        this.ctx.setLineDash([this.dashOffset, this.pathLength + 1]);
        this.dashOffset += speed * delta;
        this.paint();
        this.ctx.restore();
    }

    processPath(path: string, x = 0, y = 0) {
        let svgPath = path.split('');
        svgPath[2] = x + '';
        svgPath[4] = y + '';
        return svgPath.join('');
    }
}
