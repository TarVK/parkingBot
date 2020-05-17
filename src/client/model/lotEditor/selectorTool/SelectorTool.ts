import {EdgeSelector} from "./EdgeSelector";
import {NodeSelector} from "./NodeSelector";
import {LotEditor} from "../LotEditor";
import {IIndependentParkingNode} from "../../_types/IIndependentParkingNode";
import {
    IPartialIndependentParkingEdge,
    IIndependentParkingEdge,
} from "../../_types/IIndependentParkingEdge";
import {IDataHook} from "model-react";

export class SelectorTool {
    protected edgeSelector: EdgeSelector;
    protected nodeSelector: NodeSelector;

    /**
     * Creates a new selector tool
     * @param editor The editor the tool is for
     */
    public constructor(editor: LotEditor) {
        this.edgeSelector = new EdgeSelector(editor);
        this.nodeSelector = new NodeSelector(editor);
    }

    /**
     * Selects a new item
     * @param item The item to select
     */
    public select(item: IIndependentParkingNode | IIndependentParkingEdge): void {
        if ("ID" in item) {
            this.edgeSelector.setEdge(null);
            this.nodeSelector.setNode(item);
        } else {
            this.edgeSelector.setEdge(item);
            this.nodeSelector.setNode(null);
        }
    }

    /**
     * Retrieves the selected edge or node
     * @param hook The hook to subscribe to changes
     * @returns The selected edge or node
     */
    public getSelected(
        hook: IDataHook
    ): null | IIndependentParkingNode | IIndependentParkingEdge {
        return this.nodeSelector.getNode(hook) || this.edgeSelector.getEdge(hook);
    }

    /**
     * Retrieves the edge selector
     * @returns The edge selector
     */
    public getEdgeSelector(): EdgeSelector {
        return this.edgeSelector;
    }

    /**
     * Retrieves the node selector
     * @returns The node selector
     */
    public getNodeSelector(): NodeSelector {
        return this.nodeSelector;
    }
}
