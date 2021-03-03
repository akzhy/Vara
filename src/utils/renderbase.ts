import { BlockMapped, BlockName, Blocks, BLOCK_COMPOSITION } from '../types';

interface RenderItemProps {
    ctx: CanvasRenderingContext2D;
    parent?: Blocks;
}

export default class RenderBase {
    ctx: CanvasRenderingContext2D;
    parent?: Blocks | null;
    name: BlockName;

    constructor(props: RenderItemProps) {
        this.ctx = props.ctx;
        this.parent = props.parent ?? null;
        this.name = 'block';
    }

    getParent<T extends BlockName>(parentName: T, current: Blocks): BlockMapped[T] | false {
        const parentIndex = BLOCK_COMPOSITION.indexOf(parentName);
        const currentItemIndex = BLOCK_COMPOSITION.indexOf(this.name);
        if (parentIndex < currentItemIndex) {
            if (current.name === parentName) {
                return current as BlockMapped[T];
            } else {
                if (current.parent)
                    return this.getParent(parentName, current?.parent);
                else return false;
            }
        } else {
            return false;
        }
    }
}
