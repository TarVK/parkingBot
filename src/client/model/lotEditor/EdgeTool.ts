import {Field, IDataHook} from "model-react";
import {IParkingEdgeTag} from "../../../_types/graph/IParkingEdgeTag";

export class EdgeTool {
    protected twoWayEdge = new Field(false);
    protected selectedTags = new Field([] as IParkingEdgeTag[]);

    // Getters
    /**
     * Retrieves whether the edge to create should be a two way edge
     * @param hook The hook to subscribe to changes
     * @returns Whether to create two way edges
     */
    public getIsTwoWayEdge(hook: IDataHook): boolean {
        return this.twoWayEdge.get(hook);
    }

    /**
     * Retrieves the selected tags for new edges
     * @param hook The hook to subscribe to changes
     * @returns The selected tags
     */
    public getSelectedTags(hook: IDataHook): IParkingEdgeTag[] {
        return this.selectedTags.get(hook);
    }

    // Setters
    /**
     * Sets whether new edges should be two way edges
     * @param twoWay Whether the new edges should be two way
     */
    public setTwoWayEdge(twoWay: boolean): void {
        this.twoWayEdge.set(twoWay);
    }

    /**
     * Sets the tags that new edges should have
     * @param tags The tags for new edges
     */
    public setSelectedTags(tags: IParkingEdgeTag[]): void {
        this.selectedTags.set(tags);
    }
}
