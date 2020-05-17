import {IParkingEdge} from "../../../../_types/graph/IParkingEdge";
import {Field, IDataHook} from "model-react";
import {LotEditor} from "../LotEditor";
import {IParkingNodeTag} from "../../../../_types/graph/IParkingNodeTag";
import {IIndependentParkingNode} from "../../_types/IIndependentParkingNode";

export class NodeSelector {
    protected editor: LotEditor;
    protected selectedNode = new Field(null as null | IIndependentParkingNode);

    /**
     * Creates a new edge selector
     * @param editor
     */
    constructor(editor: LotEditor) {
        this.editor = editor;
    }

    // Getters
    /**
     * Retrieves the selected node
     * @param hook The hook to subscribe to changes
     * @returns The selected node
     */
    public getNode(hook: IDataHook): null | IIndependentParkingNode {
        return this.selectedNode.get(hook);
    }

    /**
     * Retrieves the tags of the currently selected node
     * @param hook The hook to subscribe to changes
     * @returns The tags of the selected node
     */
    public getTags(hook: IDataHook): readonly IParkingNodeTag[] {
        return this.getNode(hook)?.tags || [];
    }

    /**
     * Retrieves the ID of the node
     * @param hook The hook to subscribe to changes
     * @returns The ID of the node
     */
    public getID(hook: IDataHook): string {
        return this.getNode(hook)?.ID || "";
    }

    /**
     * Retrieves the x coordinate of the node
     * @param hook The hook to subscribe to changes
     * @returns The x coordinate
     */
    public getX(hook: IDataHook): number {
        return this.getNode(hook)?.x || 0;
    }

    /**
     * Retrieves the y coordinate of the node
     * @param hook The hook to subscribe to changes
     * @returns The y coordinate
     */
    public getY(hook: IDataHook): number {
        return this.getNode(hook)?.y || 0;
    }

    // Setters
    /**
     * Sets the node to be selected
     * @param node The node to be selected
     */
    public setNode(node: null | IIndependentParkingNode): void {
        this.selectedNode.set(node);
    }

    /**
     * Sets the new tags for the node
     * @param tags The new tags
     */
    public setTags(tags: IParkingNodeTag[]): void {
        this.updateNode(node => ({...node, tags}));
    }

    /**
     * Sets the new ID of the node
     * @param ID The new ID
     * @returns Whether the new ID is available and could be set
     */
    public setID(ID: string): boolean {
        return this.updateNode(node => ({...node, ID}));
    }

    /**
     * Sets the new x coordinate of the node
     * @param end The new x coordinate
     */
    public setX(x: number): void {
        this.updateNode(node => ({...node, x}));
    }

    /**
     * Sets the new y coordinate of the node
     * @param end The new y coordinate
     */
    public setY(y: number): void {
        this.updateNode(node => ({...node, y}));
    }

    /**
     * Updates the currently selected node to the passed node
     * @param newNode The new node
     * @returns Whether it could be updated (ID has to be unique)
     */
    public updateNode(
        newNode:
            | IIndependentParkingNode
            | ((oldNode: IIndependentParkingNode) => IIndependentParkingNode)
    ): boolean {
        const node = this.getNode(null);
        if (node) {
            if (newNode instanceof Function) newNode = newNode(node);
            const couldUpdate = this.editor.updateNode(node, newNode);
            if (couldUpdate) {
                this.setNode(newNode);
                return true;
            }
        }

        return false;
    }

    // Other actions
    /**
     * Deletes the selected node
     */
    public deleteNode(): void {
        const selectedNode = this.selectedNode.get(null);
        if (selectedNode) {
            this.editor.deleteNode(selectedNode);
            this.selectedNode.set(null);
        }
    }
}
