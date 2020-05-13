import {Field, IDataHook} from "model-react";
import {IParkingGraph} from "../../_types/graph/IParkingGraph";
import {IParkingNode} from "../../_types/graph/IParkingNode";
import {IParkingEdge} from "../../_types/graph/IParkingEdge";
import {includesAny} from "../../services/arrayUtils";
import {IIndependentParkingEdge} from "./_types/IIndependentParkingEdge";
import {IIndependentParkingNode} from "./_types/IIndependentParkingNode";

const visibleNodeTags = [
    "spot" as const,
    "entrance" as const,
    "exit" as const,
    "pedestrianEntrance" as const,
    "pedestrianExit" as const,
    "empty" as const,
];
const visibleEdgeTags = [
    "carPath" as const,
    "pedestrianPath" as const,
    "botPath" as const,
    "empty" as const,
];
export class GraphFilter {
    // Filters
    protected visibleNodes = new Field(visibleNodeTags);
    protected visibleEdges = new Field(visibleEdgeTags);

    // The graph
    protected graph = new Field({} as IParkingGraph);

    /**
     * Creates a new graph filter
     * @param graph The lot to filter
     */
    public constructor(graph?: IParkingGraph) {
        if (graph) this.graph.set(graph);
    }

    // Filter management
    /**
     * Sets the node visible tags
     * @param tags The new node visible tags
     */
    public setNodeVisibleTags(tags: typeof visibleNodeTags): void {
        this.visibleNodes.set(tags);
    }

    /**
     * Sets the new edge visible tags
     * @param tags The new edge visible tags
     */
    public setEdgeVisibleTags(tags: typeof visibleEdgeTags): void {
        this.visibleEdges.set(tags);
    }

    /**
     * Retrieves all possible node visible tags
     * @param hook The hook to subscribe to changes
     * @returns The allowed node visible tags
     */
    public getNodeVisibleTags(hook: IDataHook): typeof visibleNodeTags {
        return this.visibleNodes.get(hook);
    }

    /**
     * Retrieves all possible node visible tags
     * @param hook The hook to subscribe to changes
     * @returns The allowed edge visible tags
     */
    public getEdgeVisibleTags(hook: IDataHook): typeof visibleEdgeTags {
        return this.visibleEdges.get(hook);
    }

    /**
     * Retrieves all possible node visible tags
     * @returns The allowed node visible tags
     */
    public getAvailableNodeVisibleTags(): typeof visibleNodeTags {
        return visibleNodeTags;
    }

    /**
     * Retrieves all possible node visible tags
     * @returns The allowed edge visible tags
     */
    public getAvailableEdgeVisibleTags(): typeof visibleEdgeTags {
        return visibleEdgeTags;
    }

    /**
     * Determines whether a given node should be shown
     * @param node The node
     * @param hook The hook to subscribe to changes
     * @returns Whether the node is shown
     */
    public isNodeVisible(node: IParkingNode, hook: IDataHook): boolean {
        const hideTags = this.getNodeVisibleTags(hook);
        if (hideTags.includes("empty") && node.tags?.length == 0) return true;
        return includesAny((node.tags || []) as any[], hideTags);
    }

    /**
     * Determines whether a given edge should be shown
     * @param edge The edge
     * @param hook The hook to subscribe to changes
     * @returns Whether the node is shown
     */
    public isEdgeVisible(edge: IParkingEdge, hook: IDataHook): boolean {
        const hideTags = this.getEdgeVisibleTags(hook);
        if (hideTags.includes("empty") && edge.tags?.length == 0) return true;
        return includesAny((edge.tags || []) as any[], hideTags);
    }

    // Graph retrieval
    /**
     * Retrieves the current graph
     * @param hook The hook to subscribe to changes
     * @returns The normalized parking graph
     */
    public getGraph(hook: IDataHook): IParkingGraph {
        return this.graph.get(hook);
    }

    /**
     * Retrieves all visible nodes
     * @param hook The hook to subscribe to changes
     * @returns A list of visible nodes
     */
    public getVisibleNodes(hook: IDataHook): IIndependentParkingNode[] {
        const graph = this.getGraph(hook);
        return Object.keys(graph)
            .filter(nodeID => this.isNodeVisible(graph[nodeID], hook))
            .map(nodeID => ({tags: [], ...graph[nodeID], ID: nodeID}));
    }

    /**
     * Retrieves all visible edges
     * @param hook The hook to subscribe to changes
     * @returns A list of visible edges
     */
    public getVisibleEdges(hook: IDataHook): IIndependentParkingEdge[] {
        const graph = this.getGraph(hook);
        const edges = [] as IIndependentParkingEdge[];
        Object.keys(graph).forEach(nodeID => {
            const node = graph[nodeID];
            node.edges?.forEach(edge => {
                if (!this.isEdgeVisible(edge, hook)) return;
                const endNode = graph[edge.end];
                if (!endNode) return;

                edges.push({
                    tags: [],
                    ...edge,
                    start: {ID: nodeID, x: node.x, y: node.y},
                    end: {
                        ID: edge.end,
                        x: endNode.x,
                        y: endNode.y,
                    },
                });
            });
        });

        return edges;
    }
}
