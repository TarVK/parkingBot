import {INode} from "../../../model/_types/INode";
import {IEdge} from "../../../model/_types/IEdge";
import {IGraph} from "../../../model/_types/IGraph";
import {ISymmetricEdge} from "./_types/ISymmetricEdge";
import {IMarkedNode} from "./_types/IMarkedNode";
import {TransformableSearchGraph, ISearchGraph} from "./_types/ISearchGraph";
import {
    IParkingGraph,
    INormalizedParkingGraph,
} from "../../../../_types/graph/IParkingGraph";

/**
 * A class used to ease transforming graphs
 */
export class TransformableGraph<N, E> {
    protected nodes: {[ID: string]: {meta: N}} = {};
    protected edgesOut: {[ID: string]: ISymmetricEdge<E>[]} = {};
    protected edgesIn: {[ID: string]: ISymmetricEdge<E>[]} = {};

    /**
     * Creates a new transformable graph
     * @param graph The graph to read in
     */
    public constructor(graph?: IGraph<N, E>) {
        if (graph) {
            Object.keys(graph).forEach(ID => {
                const node = graph[ID];
                this.addNode(ID, node.meta);
                node.edges.forEach(edge => {
                    this.addEdge(ID, edge.end, edge.weight, edge.meta);
                });
            });
        }
    }

    // Node management
    /**
     * Retrieves the meta data of the given node
     * @param ID The ID of the node
     * @returns The meta data
     */
    public getNodeMeta(ID: string): N | undefined {
        return this.nodes[ID]?.meta;
    }

    /**
     * Checks whether the given node exists
     * @param ID The ID of the node to check
     * @returns Whether the node exists
     */
    public containsNode(ID: string): boolean {
        return this.nodes[ID] != undefined;
    }

    /**
     * Retrieves all the node IDs in the graph
     * @returns The IDs
     */
    public getNodeIDs(): string[] {
        return Object.keys(this.nodes);
    }

    /**
     * Retrieves all the nodes in the graph
     * @returns The nodes
     */
    public getNodes(): IMarkedNode<N>[] {
        return this.getNodeIDs().map(ID => ({ID, meta: this.getNodeMeta(ID) as any}));
    }

    /**
     * Adds a node to the graph
     * @param ID The ID of the node to add
     * @param meta The metadata of the node to add
     */
    public addNode(ID: string, meta: N): void;

    /**
     * Adds a node to the graph
     * @param node The node to add
     */
    public addNode(node: IMarkedNode<N>): void;
    public addNode(ID: string | IMarkedNode<N>, meta?: N): void {
        if (typeof ID == "object") {
            meta = ID.meta;
            ID = ID.ID;
        }
        this.nodes[ID] = {meta: meta as any};
    }

    /**
     * Adds a node and renames it
     * @param node The node to be added
     * @param newID The new name/ID of the node
     */
    public addRenamedNode(node: IMarkedNode<N>, newID: string): void {
        this.addNode({...node, ID: newID});
    }

    /**
     * Removes a node from the graph
     * @param ID The ID of the node to remove
     * @param fully Whether to also remove the edges attached to this node
     */
    public removeNode(ID: string, fully = true): void {
        delete this.nodes[ID];
        if (fully) {
            this.removeInEdges(ID);
            this.removeOutEdges(ID);
        }
    }

    /**
     * Renames the given node
     * @param ID The old ID
     * @param newID The new ID
     */
    public renameNode(ID: string, newID: string): void {
        if (!this.containsNode(ID))
            throw Error(`Graph doesn't contain a node with ID ${ID}`);
        this.addNode(newID, this.getNodeMeta(ID) as any);

        this.getNodeOutEdges(ID).forEach(edge => this.addEdge({...edge, start: newID}));
        this.getNodeInEdges(ID).forEach(edge => this.addEdge({...edge, end: newID}));

        this.removeNode(ID);
    }

    // Edge management
    /**
     * Adds an edge between the start and end node
     * @param startID The ID of the start node
     * @param endID The ID of the end node
     * @param weight The weight of the edge
     * @param meta The meta data to add for the edge
     */
    public addEdge(startID: string, endID: string, weight: number, meta: E): void;

    /**
     * Adds an edge between the start and end node
     * @param edge The edge to add
     */
    public addEdge(edge: ISymmetricEdge<E>): void;
    public addEdge(
        edge: string | ISymmetricEdge<E>,
        endID?: string,
        weight?: number,
        meta?: E
    ): void {
        if (typeof edge != "object") {
            edge = {
                start: edge,
                end: endID as any,
                weight: weight as any,
                meta: meta as any,
            };
        }

        if (this.containsEdge(edge.start, edge.end))
            this.removeEdge(edge.start, edge.end);

        if (!this.edgesOut[edge.start]) this.edgesOut[edge.start] = [];
        this.edgesOut[edge.start].push(edge);

        if (!this.edgesIn[edge.end]) this.edgesIn[edge.end] = [];
        this.edgesIn[edge.end].push(edge);
    }

    /**
     * Adds an edge and renames the IDs
     * @param edge The edge to add
     * @param newStartID The new start ID
     * @param newEndID The new end ID
     */
    public addRenamedEdge(
        edge: ISymmetricEdge<E>,
        newStartID: string,
        newEndID: string
    ): void {
        this.addEdge({...edge, start: newStartID, end: newEndID});
    }

    /**
     * Adds an edge in the opposite direction
     * @param edge The original edge to add flipped
     */
    public addReversedEdge(edge: ISymmetricEdge<E>): void {
        this.addRenamedEdge(edge, edge.end, edge.start);
    }

    /**
     * Removes an edge between the start and end node
     * @param startID The ID of the start node
     * @param endID The ID of the end node
     */
    public removeEdge(startID: string, endID: string): void;
    /**
     * Removes an edge between the start and end node
     * @param edge The edge to remove
     */
    public removeEdge(edge: ISymmetricEdge<E>): void;
    public removeEdge(startID: string | ISymmetricEdge<E>, endID?: string): void {
        if (typeof startID == "object") {
            endID = startID.end;
            startID = startID.start;
        }

        if (!this.containsEdge(startID, endID as any))
            throw Error(`Edge ${startID}-${endID} is not present in graph`);

        if (this.edgesOut[startID])
            this.edgesOut[startID] = this.edgesOut[startID].filter(
                ({end}) => end != endID
            );

        if (this.edgesIn[endID as any])
            this.edgesIn[endID as any] = this.edgesIn[endID as any].filter(
                ({start}) => start != startID
            );
    }

    /**
     * Removes all edges starting at the given node
     * @param startID The starting node of the edges to remove
     */
    public removeOutEdges(startID: string): void {
        this.getNodeOutEdges(startID).forEach(({end}) => this.removeEdge(startID, end));
    }

    /**
     * Removes all edges ending at the given node
     * @param startID The ending node of the edges to remove
     */
    public removeInEdges(endID: string): void {
        this.getNodeInEdges(endID).forEach(({start}) => this.removeEdge(start, endID));
    }

    /**
     * Retrieves the data of the given edge
     * @param startID The ID of the start node
     * @param endID The ID of the start node
     * @returns The meta data that was found
     */
    public getEdge(
        startID: string,
        endID: string
    ): {meta: E; weight: number} | undefined {
        return this.getNodeOutEdges(startID).find(({end}) => end == endID);
    }

    /**
     * Checks whether the given edge exists
     * @param startID The ID of the start node
     * @param endID The ID of the start node
     * @returns Whether the edge exists
     */
    public containsEdge(startID: string, endID: string): boolean {
        return this.getEdge(startID, endID) !== undefined;
    }

    /**
     * Retrieves the outgoing edges from the given node
     * @param nodeID The ID of the node
     * @returns The outgoing edges
     */
    public getNodeOutEdges(nodeID: string): ISymmetricEdge<E>[] {
        return [...(this.edgesOut[nodeID] || [])];
    }

    /**
     * Retrieves the incoming edges from the given node
     * @param nodeID The ID of the node
     * @returns The incoming edges
     */
    public getNodeInEdges(nodeID: string): ISymmetricEdge<E>[] {
        return [...(this.edgesIn[nodeID] || [])];
    }

    /**
     * Retrieves both the incoming and outgoing edges from the given node
     * @param nodeID The ID of the node
     * @returns The edges
     */
    public getNodeEdges(nodeID: string): ISymmetricEdge<E>[] {
        return [...this.getNodeInEdges(nodeID), ...this.getNodeOutEdges(nodeID)];
    }

    /**
     * Checks whether a given node is attached to an edge that matches the given predicate
     * @param nodeID The node to check
     * @param predicate The predicate for the edge to check
     * @returns Whether such an edge exists
     */
    public doesNodeHaveEdge(
        nodeID: string,
        predicate: (edge: ISymmetricEdge<E>) => boolean
    ): boolean {
        return this.getNodeEdges(nodeID).find(predicate) != undefined;
    }

    /**
     * Retrieves all edges in the graph
     * @returns all edges
     */
    public getEdges(): ISymmetricEdge<E>[] {
        const edges = [] as ISymmetricEdge<E>[];
        this.getNodeIDs().forEach(ID => {
            edges.push(...this.getNodeOutEdges(ID));
        });
        return edges;
    }

    // Utils
    /**
     * Exports the transformable graph as a regular graph
     */
    public export(): IGraph<N, E> {
        const graph = {} as IGraph<N, E>;

        this.getNodeIDs().forEach(ID => {
            const meta = this.getNodeMeta(ID) as any;
            graph[ID] = {meta: meta, edges: this.getNodeOutEdges(ID)};
        });

        return graph;
    }

    /**
     * Normalizes the given parking graph
     * @param parkingGraph The parking graph to normalize
     * @returns The normalized parking graph
     */
    public static normalizeParkingGraph(
        parkingGraph: IParkingGraph
    ): INormalizedParkingGraph {
        // Copy the graph, and create edge and tag arrays if needed
        const graph = {};
        Object.keys(parkingGraph).forEach(key => {
            const node = parkingGraph[key];
            graph[key] = {
                ...node,
                tags: node.tags || [],
                edges: (node.edges || []).map(edge => ({...edge})),
            };
        });

        // Generate bidirectional edges for spots
        Object.keys(graph).forEach(key => {
            const node = graph[key];
            node.edges?.forEach(edge => {
                const endNode = graph[edge.end];
                if (
                    endNode.tags?.includes("spot") &&
                    !endNode.edges?.find(({end}) => end == key)
                ) {
                    endNode.edges?.push({end: key});
                }
            });
        });

        // Calculate distances and angles of edges
        Object.values(graph).forEach((node: any) => {
            node.edges?.forEach((edge: any) => {
                const endNode = graph[edge.end];
                const dX = endNode.x - node.x;
                const dY = endNode.y - node.y;
                if (edge.distance === undefined)
                    (edge.distance as any) = Math.sqrt(dX * dX + dY * dY);
                if (edge.angle === undefined) (edge.angle as any) = Math.atan2(dY, dX);
                if (!edge.tags) (edge.tags as any) = [];
            });
        });

        // Return the updates graph
        return graph as INormalizedParkingGraph;
    }

    /**
     * Creates a transformable graph from a parking graph
     * @param parkingGraph The parking graph
     * @returns The search graph
     */
    public static fromParkingGraph(
        parkingGraph: IParkingGraph
    ): TransformableSearchGraph {
        const normalizedParkingGraph = this.normalizeParkingGraph(parkingGraph);
        const searchGraph = {} as ISearchGraph;
        Object.keys(normalizedParkingGraph).forEach(ID => {
            const node = normalizedParkingGraph[ID];
            searchGraph[ID] = {
                meta: {
                    original: {ID, ...node},
                },
                edges: node.edges.map(edge => ({
                    end: edge.end,
                    weight: edge.distance,
                    meta: {original: {start: ID, ...edge}, type: "original"},
                })),
            };
        });
        return new TransformableGraph(searchGraph);
    }
}
