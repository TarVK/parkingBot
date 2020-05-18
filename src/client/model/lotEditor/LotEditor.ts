import {IParkingGraph} from "../../../_types/graph/IParkingGraph";
import {GraphFilter} from "../GraphFilter";
import {ITool} from "./_types/ITool";
import {Field, IDataHook} from "model-react";
import {IPartialIndependentParkingEdge} from "../_types/IIndependentParkingEdge";
import {IIndependentParkingNode} from "../_types/IIndependentParkingNode";
import {SelectorTool} from "./selectorTool/SelectorTool";
import {IParkingEdge} from "../../../_types/graph/IParkingEdge";
import {IParkingNode} from "../../../_types/graph/IParkingNode";
import {EdgeTool} from "./EdgeTool";
import {NodeTool} from "./NodeTool";

export class LotEditor extends GraphFilter {
    protected edgeTool: EdgeTool;
    protected nodeTool: NodeTool;
    protected selectorTool: SelectorTool;
    protected selectedTool = new Field("selector" as ITool);

    /**
     * Creates a new lot creator
     * @param graph The lot to start with
     */
    public constructor(graph?: IParkingGraph) {
        super(graph);
        this.selectorTool = new SelectorTool(this);
        this.edgeTool = new EdgeTool();
        this.nodeTool = new NodeTool();
    }

    // Graph management
    /**
     * Updates the graph
     * @param graph The new graph
     */
    public setGraph(graph: IParkingGraph): void {
        this.graph.set(graph);
    }

    // Tool management
    /**
     * Selects the specified tool
     * @param tool The new tool to select
     */
    public selectTool(tool: ITool): void {
        this.selectedTool.set(tool);
    }

    /**
     * Retrieves the currently selected tool
     * @param hook The hook to subscribe to changes
     * @returns The currently selected tool
     */
    public getSelectedToolName(hook: IDataHook): ITool {
        return this.selectedTool.get(hook);
    }

    /**
     * Retrieves the selector tool
     * @returns The selector tool
     */
    public getSelectorTool(): SelectorTool {
        return this.selectorTool;
    }

    /**
     * Retrieves the edge tool
     * @returns The edge tool
     */
    public getEdgeTool(): EdgeTool {
        return this.edgeTool;
    }

    /**
     * Retrieves the node tool
     * @returns The node tool
     */
    public getNodeTool(): NodeTool {
        return this.nodeTool;
    }

    /**
     * Retrieves the tool that's currently selected
     * @param hook The hook to subscribe to changes
     * @returns The tool that's currently selected
     */
    public getSelectedTool(hook: IDataHook): SelectorTool | EdgeTool | NodeTool {
        return {
            selector: this.selectorTool,
            edgeCreator: this.edgeTool,
            nodeCreator: this.nodeTool,
        }[this.getSelectedToolName(hook)];
    }

    // Graph editing
    /**
     * Adds a new edge
     * @param edge The edge to add
     * @returns Whether the edge could be added (nodes need to exist)
     */
    public addEdge(edge: IPartialIndependentParkingEdge): boolean {
        // Check if the start and end nodes exist
        const graph = this.getGraph(null);
        const startNode = graph[edge.start];
        const endNode = graph[edge.end];
        if (!startNode || !endNode) return false;

        // Check if there is no edge from the start to the end node already
        const alreadyExists = startNode.edges?.find(({end}) => end == edge.end) != null;
        if (alreadyExists) return false;

        // Add the edge
        this.setGraph({
            ...graph,
            [edge.start]: {
                ...startNode,
                edges: [...(startNode.edges || []), {end: edge.end, tags: edge.tags}],
            },
        });
        return true;
    }

    /**
     * Updates the given edge
     * @param edge The old version of the edge
     * @param newEdge The new version of the edge
     * @returns Whether the edge could be added (nodes need to exist)
     */
    public updateEdge(
        edge: IPartialIndependentParkingEdge,
        newEdge: IPartialIndependentParkingEdge
    ): boolean {
        // Delete the old edge
        this.deleteEdge(edge);

        // Insert the new edge
        if (!this.addEdge(newEdge)) {
            // Revert if the new edge couldn't be inserted
            this.addEdge(edge);
            return false;
        }

        return true;
    }

    /**
     * Deletes the given edge from the graph
     * @param edge The edge to remove
     */
    public deleteEdge(edge: IPartialIndependentParkingEdge): void {
        // Get the node to update
        const graph = this.getGraph(null);
        const startNode = graph[edge.start];
        if (!startNode) return;

        // Remove the edge from the node
        this.setGraph({
            ...graph,
            [edge.start]: {
                ...startNode,
                edges: startNode.edges?.filter(
                    e =>
                        !(
                            e.end == edge.end &&
                            e.tags?.length == edge.tags.length &&
                            e.tags?.reduce(
                                (same, tag, i) => same && tag == edge.tags[i],
                                true
                            )
                        )
                ),
            },
        });
    }

    /**
     * Adds a new node
     * @param node The node to be added
     * @returns Whether the node could be added (the ID must be unique)
     */
    public addNode(node: IIndependentParkingNode): boolean {
        // Make sure the node doesn't exit already
        const graph = this.getGraph(null);
        if (graph[node.ID]) return false;

        // Add the node
        this.setGraph({
            ...graph,
            [node.ID]: {
                x: node.x,
                y: node.y,
                tags: node.tags,
                edges: [],
            },
        });
        return true;
    }

    /**
     * Updates the given node
     * @param node The old version of the node
     * @param newNode The new version of the node
     * @returns Whether the node could be updated (if the ID changed, it must be unique)
     */
    public updateNode(
        node: IIndependentParkingNode,
        newNode: IIndependentParkingNode
    ): boolean {
        // Make sure the node doesn't exit already
        const graph = this.getGraph(null);
        if (newNode.ID != node.ID && graph[newNode.ID]) return false;

        // Remove the node from the graph
        const {[node.ID]: removedNode, ...remainingGraph} = graph;

        // Replace all the edge end IDs that are affected
        const newGraph = {} as IParkingGraph;
        Object.keys(remainingGraph).forEach(key => {
            const n = remainingGraph[key];
            newGraph[key] = {
                ...n,
                edges: n.edges?.map(edge =>
                    edge.end == node.ID ? {...edge, end: newNode.ID} : edge
                ),
            };
        });

        // Add the new node
        newGraph[newNode.ID] = {
            x: newNode.x,
            y: newNode.y,
            tags: newNode.tags,
            edges: removedNode.edges,
        };

        // Set the new graph
        this.setGraph(newGraph);
        return true;
    }

    /**
     * Deletes the given node from the graph
     * @param node The node to remove
     * @returns The removed node
     */
    public deleteNode(node: IIndependentParkingNode): IParkingNode {
        // Remove the node from the graph
        const graph = this.getGraph(null);
        const {[node.ID]: removedNode, ...remainingGraph} = graph;

        // Remove all nodes that go to this node
        const newGraph = {} as IParkingGraph;
        Object.keys(remainingGraph).forEach(key => {
            const n = remainingGraph[key];
            newGraph[key] = {
                ...n,
                edges: n.edges?.filter(({end}) => end != node.ID),
            };
        });

        // Set the new graph
        this.setGraph(newGraph);
        return removedNode;
    }
}
