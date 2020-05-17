import {IParkingEdge} from "../../../../_types/graph/IParkingEdge";
import {Field, IDataHook} from "model-react";
import {LotEditor} from "../LotEditor";
import {
    IIndependentParkingEdge,
    IPartialIndependentParkingEdge,
} from "../../_types/IIndependentParkingEdge";
import {IParkingEdgeTag} from "../../../../_types/graph/IParkingEdgeTag";

export class EdgeSelector {
    protected editor: LotEditor;
    protected selectedEdge = new Field(null as null | IIndependentParkingEdge);

    /**
     * Creates a new edge selector
     * @param editor
     */
    constructor(editor: LotEditor) {
        this.editor = editor;
    }

    // Getters
    /**
     * Retrieves the selected edge
     * @param hook The hook to subscribe to changes
     * @returns The selected edge
     */
    public getEdge(hook: IDataHook): null | IIndependentParkingEdge {
        return this.selectedEdge.get(hook);
    }

    /**
     * Retrieves the selected edge without positional data
     * @param hook The hook to subscribe to changes
     * @returns The selected edge
     */
    public getPartialEdge(hook: IDataHook): null | IPartialIndependentParkingEdge {
        const edge = this.selectedEdge.get(hook);
        return edge && {...edge, start: edge.start.ID, end: edge.end.ID};
    }

    /**
     * Retrieves the tags of the currently selected edge
     * @param hook The hook to subscribe to changes
     * @returns The tags of the selected edge
     */
    public getTags(hook: IDataHook): readonly IParkingEdgeTag[] {
        return this.getEdge(hook)?.tags || [];
    }

    /**
     * Retrieves the ID of the start node of the edge
     * @param hook The hook to subscribe to changes
     * @returns The ID of the start node
     */
    public getStart(hook: IDataHook): string {
        return this.getEdge(hook)?.start.ID || "";
    }

    /**
     * Retrieves the ID of the end node of the edge
     * @param hook The hook to subscribe to changes
     * @returns The ID of the end node
     */
    public getEnd(hook: IDataHook): string {
        return this.getEdge(hook)?.end.ID || "";
    }

    // Setters
    /**
     * Sets the edge to be selected
     * @param edge The edge to be selected
     */
    public setEdge(edge: null | IIndependentParkingEdge): void {
        this.selectedEdge.set(edge);
    }

    /**
     * Sets the new tags for the edge
     * @param tags The new tags
     */
    public setTags(tags: IParkingEdgeTag[]): void {
        this.updateEdge(edge => ({...edge, tags}));
    }

    /**
     * Sets the new starting node of the edge
     * @param start The new starting node
     * @returns Whether the start exists and could be set
     */
    public setStart(start: string): boolean {
        return this.updateEdge(edge => ({...edge, start}));
    }

    /**
     * Sets the new end node of the edge
     * @param end The new end node
     * @returns Whether the end exists and could be set
     */
    public setEnd(end: string): boolean {
        return this.updateEdge(edge => ({...edge, end}));
    }

    /**
     * Updates the currently selected edge to the passed edge
     * @param newEdge The new edge
     * @returns Whether it could be updated (start and end node must exist)
     */
    public updateEdge(
        newEdge:
            | IPartialIndependentParkingEdge
            | ((
                  oldEdge: IPartialIndependentParkingEdge
              ) => IPartialIndependentParkingEdge)
    ): boolean {
        const edge = this.getPartialEdge(null);
        if (edge) {
            if (newEdge instanceof Function) newEdge = newEdge(edge);
            const couldUpdate = this.editor.updateEdge(edge, newEdge);
            if (couldUpdate) {
                const graph = this.editor.getGraph(null);
                this.setEdge({
                    ...newEdge,
                    start: {
                        x: graph[newEdge.start].x,
                        y: graph[newEdge.start].y,
                        ID: newEdge.start,
                    },
                    end: {
                        x: graph[newEdge.end].x,
                        y: graph[newEdge.end].y,
                        ID: newEdge.end,
                    },
                });
                return true;
            }
        }
        return false;
    }

    // Other actions
    /**
     * Deletes the selected edge
     */
    public deleteEdge(): void {
        const selectedEdge = this.getPartialEdge(null);
        if (selectedEdge) {
            this.editor.deleteEdge(selectedEdge);
            this.selectedEdge.set(null);
        }
    }

    /**
     * Creates the reversed version of this edge
     * @returns Whether the reversed version was created successfully
     */
    public createReverseEdge(): boolean {
        // TODO: implement
        return true;
    }
}
