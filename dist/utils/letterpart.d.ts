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
    constructor(props: LetterPartProps);
    /**
     * Paints the path
     */
    paint(): void;
    /**
     * Increments the dashOffset and then paints the path.
     */
    draw(delta: number): void;
    processPath(path: string, x?: number, y?: number): string;
}
