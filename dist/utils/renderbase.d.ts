import { BlockMapped, BlockName, Blocks } from '../types';
interface RenderItemProps {
    ctx: CanvasRenderingContext2D;
    parent?: Blocks;
}
export default class RenderBase {
    ctx: CanvasRenderingContext2D;
    parent?: Blocks | null;
    name: BlockName;
    constructor(props: RenderItemProps);
    getParent<T extends BlockName>(parentName: T, current: Blocks): BlockMapped[T] | false;
}
export {};
