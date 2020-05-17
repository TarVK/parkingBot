import {Field, IDataHook} from "model-react";
import {IParkingNodeTag} from "../../../_types/graph/IParkingNodeTag";

export class NodeTool {
    protected positionPrecision = new Field(0.25 as number);
    protected selectedTags = new Field([] as IParkingNodeTag[]);

    // Getters
    /**
     * Retrieves the selected tags for new edges
     * @param hook The hook to subscribe to changes
     * @returns The selected tags
     */
    public getSelectedTags(hook: IDataHook): IParkingNodeTag[] {
        return this.selectedTags.get(hook);
    }

    /**
     * Retrieves the position precision
     * @param hook The hook to subscribe to changes
     * @returns The position precision
     */
    public getPositionPrecision(hook: IDataHook): number {
        return this.positionPrecision.get(hook);
    }

    // Setters
    /**
     * Sets the tags that new edges should have
     * @param tags The tags for new edges
     */
    public setSelectedTags(tags: IParkingNodeTag[]): void {
        this.selectedTags.set(tags);
    }

    /**
     * Sets the precision to be rounded to for newly added nodes
     * @param precision The precision to set
     */
    public setPositionPrecision(precision: number): void {
        this.positionPrecision.set(precision);
    }

    // Tools
    /**
     * Rounds the position in accordance to the position rounding precision
     * @param pos The position to round
     * @returns The rounded position
     */
    public getRoundedPos(pos: {x: number; y: number}): {x: number; y: number} {
        const f = this.positionPrecision.get(null);
        if (f == 0) return pos;
        return {
            x: Math.round(pos.x / f) * f,
            y: Math.round(pos.y / f) * f,
        };
    }
}
