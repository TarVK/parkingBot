import {IParkingGraph} from "../../../../_types/graph/IParkingGraph";
import {IParkingNodeTag} from "../../../../_types/graph/IParkingNodeTag";
import {
    ISearchGraph,
    ISearchEdgeMeta,
    TransformableSearchGraph,
    ISearchNodeMeta,
} from "../transformations/_types/ISearchGraph";
import {ISymmetricEdge} from "../transformations/_types/ISymmetricEdge";
import {IParkingEdgeTag} from "../../../../_types/graph/IParkingEdgeTag";
import {includesAll, includesAny} from "../../../../services/arrayUtils";
import {INormalizedParkingEdge} from "../../../../_types/graph/IParkingEdge";
import {IParkingNode} from "../../../../_types/graph/IParkingNode";
import {IGraph} from "../../../model/_types/IGraph";
import {IEdge} from "../../../model/_types/IEdge";
import Heap from "../../Heap";

/**
 * An abstract class with utilities for creating search graphs
 */
export abstract class AbstractSearchGraph {
    // Searching
    /**
     * Creates a tree connecting all nodes to the start node in the shortest way
     * @param searchGraph The graph to search through
     * @param startID The node to start at
     * @param getWeight The callback to get an edge weight
     * @returns A map of the IDs of all predecessor nodes on the shortest path from the start
     */
    protected search<E>(
        searchGraph: IGraph<any, E>,
        startID: string,
        getWeight: (edge: IEdge<E>, startID: string) => number
    ): {
        distances: {
            [ID: string]: number;
        };
        predecessors: {
            [ID: string]: string;
        };
    } {
        return AbstractSearchGraph.search(searchGraph, startID, getWeight);
    }

    /**
     * Creates a tree connecting all nodes to the start node in the shortest way
     * @param searchGraph The graph to search through
     * @param startID The node to start at
     * @param getWeight The callback to get an edge weight
     * @returns A map of the IDs of all predecessor nodes on the shortest path from the start
     */
    public static search<E>(
        searchGraph: IGraph<any, E>,
        startID: string,
        getWeight: (edge: IEdge<E>, startID: string) => number
    ): {
        distances: {
            [ID: string]: number;
        };
        predecessors: {
            [ID: string]: string;
        };
    } {
        // implementation of dijkstra's algorithm
        const queue = new Heap(
            (
                node1: {distance: number; ID: string},
                node2: {distance: number; ID: string}
            ) => node1.distance <= node2.distance
        );

        const distances = {};
        const visited = {};
        const predecessors = {};
        Object.keys(searchGraph).forEach(nodeID => {
            distances[nodeID] = nodeID == startID ? 0 : Infinity;
            queue.insert({ID: nodeID, distance: distances[nodeID]});
        });

        let n: {ID: string};
        while ((n = queue.extract())) {
            const nodeID = n.ID;
            if (visited[nodeID]) continue;
            visited[nodeID] = true;

            const distance = distances[nodeID];
            const node = searchGraph[nodeID];

            node.edges.forEach(edge => {
                const dist = distance + getWeight(edge, nodeID);
                if (dist < distances[edge.end]) {
                    distances[edge.end] = dist;
                    predecessors[edge.end] = nodeID;
                    queue.insert({ID: edge.end, distance: dist});
                }
            });
        }

        return {distances, predecessors};
    }

    // Transformation utils
    /**
     * Retrieves all of the pedestrian entrances and exits of the lot
     * @param parkingGraph The parking graph to get the data from
     * @returns The pedestrian entrances followed by exits
     */
    protected getInterfaceNodes(
        parkingGraph: TransformableSearchGraph
    ): {
        carEntrances: string[];
        carExits: string[];
        pedestrianEntrances: string[];
        pedestrianExits: string[];
        spots: string[];
    } {
        return {
            carEntrances: parkingGraph
                .getNodes()
                .filter(({meta}) => meta.original.tags.includes("entrance"))
                .map(({ID}) => ID),
            carExits: parkingGraph
                .getNodes()
                .filter(({meta}) => meta.original.tags.includes("exit"))
                .map(({ID}) => ID),
            pedestrianEntrances: parkingGraph
                .getNodes()
                .filter(({meta}) => meta.original.tags.includes("pedestrianEntrance"))
                .map(({ID}) => ID),
            pedestrianExits: parkingGraph
                .getNodes()
                .filter(({meta}) => meta.original.tags.includes("pedestrianExit"))
                .map(({ID}) => ID),
            spots: parkingGraph
                .getNodes()
                .filter(({meta}) => meta.original.tags.includes("spot"))
                .map(({ID}) => ID),
        };
    }

    /**
     * Checks whether this is a special node to interface with "The outside world"
     * @param node The node to check
     * @returns Whether this is an interface node
     */
    protected isInterfaceNode(node: IParkingNode): boolean {
        return includesAny(node.tags, [
            "entrance",
            "exit",
            "pedestrianEntrance",
            "pedestrianExit",
        ]);
    }

    /**
     * Checks whether an edge has one of the given tags
     * @param edge The edge to test
     * @param tags The tag to check for
     * @returns Whether the edge has the tag
     */
    protected hasAnyEdgeTag(
        edge: ISymmetricEdge<ISearchEdgeMeta>,
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): boolean {
        if (!(tags instanceof Array)) tags = [tags];
        return (
            (edge.meta.type == "original" &&
                includesAny(edge.meta.original?.tags, tags)) ??
            false
        );
    }

    /**
     * Checks whether an edge has all the given tags
     * @param edge The edge to test
     * @param tags The tag to check for
     * @returns Whether the edge has the tag
     */
    protected hasAllEdgeTags(
        edge: ISymmetricEdge<ISearchEdgeMeta>,
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): boolean {
        if (!(tags instanceof Array)) tags = [tags];
        return (
            (edge.meta.type == "original" &&
                includesAll(edge.meta.original?.tags, tags)) ??
            false
        );
    }

    /**
     * Creates a function to check whether an edge has one of the specified tags
     * @param tags The tags to check for
     * @returns The edge checking function
     */
    protected getAnyEdgeTagChecker(
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): (edge: ISymmetricEdge<ISearchEdgeMeta>) => boolean {
        return edge => this.hasAnyEdgeTag(edge, tags);
    }

    /**
     * Creates a function to check whether an edge has all the specified tags
     * @param tags The tags to check for
     * @returns The edge checking function
     */
    protected getAllEdgeTagsChecker(
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): (edge: ISymmetricEdge<ISearchEdgeMeta>) => boolean {
        return edge => this.hasAllEdgeTags(edge, tags);
    }

    /**
     * Retrieves all nodes and edges that have any of the specified edge tags
     * @param graph The graph to get the nodes and edges from
     * @param tags The tags that edges should have, and nodes should be connected to
     * @returns The nodes and edges
     */
    protected getNodesAndEdgesWithAnyTags(
        graph: TransformableSearchGraph,
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): {
        nodes: {ID: string; meta: ISearchNodeMeta}[];
        edges: ISymmetricEdge<ISearchEdgeMeta>[];
    } {
        return {
            nodes: graph
                .getNodes()
                .filter(({ID}) =>
                    graph.doesNodeHaveEdge(ID, this.getAnyEdgeTagChecker(tags))
                ),
            edges: graph.getEdges().filter(edge => this.hasAnyEdgeTag(edge, tags)),
        };
    }

    /**
     * Retrieves all nodes and edges that have all of the specified edge tags
     * @param graph The graph to get the nodes and edges from
     * @param tags The tags that edges should have, and nodes should be connected to
     * @returns The nodes and edges
     */
    protected getNodesAndEdgesWithAllTags(
        graph: TransformableSearchGraph,
        tags: IParkingEdgeTag | IParkingEdgeTag[]
    ): {
        nodes: {ID: string; meta: ISearchNodeMeta}[];
        edges: ISymmetricEdge<ISearchEdgeMeta>[];
    } {
        return {
            nodes: graph
                .getNodes()
                .filter(({ID}) =>
                    graph.doesNodeHaveEdge(ID, this.getAllEdgeTagsChecker(tags))
                ),
            edges: graph.getEdges().filter(edge => this.hasAllEdgeTags(edge, tags)),
        };
    }

    // Turn functions

    /**
     * Returns the minimal number of radians to turn (either left or right) to get to the specified angle
     * @param angle The angle in radians
     * @returns The rotation amount
     */
    protected smallestTurn(angle: number): number {
        return Math.abs(
            (((angle % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
        ); // Clamps value between 0 and PI
    }

    /**
     * Checks whether a given edge is an original edge of the graph
     * @param edge The edge to check
     * @returns Whether the edge is an original edge
     */
    protected isOriginalEdge(
        edge: ISymmetricEdge<ISearchEdgeMeta>
    ): edge is ISymmetricEdge<{
        type: "original";
        original: {start: string} & INormalizedParkingEdge;
    }> {
        return edge.meta.type == "original" && edge.meta.original != undefined;
    }

    /**
     * Updates the transformable graph by replacing a node with the same node but with turn costs
     * @param graph The graph to add the turn edges in
     * @param nodeID The ID of the node for which to add turn edges
     * @param enterSuffix A suffix that will be used to mark nodes that represent entering the original node
     * @param exitSuffix A suffix that will be used to make nodes that represent exiting the original node
     */
    protected addNodeTurnCostEdges(
        graph: TransformableSearchGraph,
        nodeID: string,
        enterSuffix: string = "-Enter",
        exitSuffix: string = "-Exit"
    ): void {
        const meta = graph.getNodeMeta(nodeID);
        if (!meta) throw Error(`Node with ID ${nodeID} does not exist in graph`);
        const {original} = meta;

        const inEdges = graph.getNodeInEdges(nodeID);
        const outEdges = graph.getNodeOutEdges(nodeID);

        // Go through all incoming edges and route them to a dedicated enter vertex
        inEdges.forEach((inEdge, inIndex) => {
            if (!this.isOriginalEdge(inEdge)) return;

            // Replace the incoming edge by an edge to a dedicated enter node
            graph.removeEdge(inEdge);
            const enterID = nodeID + enterSuffix + inIndex;
            graph.addNode(enterID, {original});
            graph.addEdge({...inEdge, end: enterID});
        });

        // Go through all outgoing edges to route them from a dedicated exit vertex
        outEdges.forEach((outEdge, outIndex) => {
            if (!this.isOriginalEdge(outEdge)) return;

            // Replace the outgoing edge by an edge from a dedicated exit node
            graph.removeEdge(outEdge);
            const exitID = nodeID + exitSuffix + outIndex;
            graph.addNode(exitID, {original});
            graph.addEdge({...outEdge, start: exitID});
        });

        // Add the cross product of incoming and outgoing edges, and calculate their angle difference
        inEdges.forEach((inEdge, inIndex) => {
            if (!this.isOriginalEdge(inEdge)) return;
            const inOr = inEdge.meta.original;
            const enterID = nodeID + enterSuffix + inIndex;

            outEdges.forEach((outEdge, outIndex) => {
                if (!this.isOriginalEdge(outEdge)) return;

                const angleDif = outEdge.meta.original.angle - inOr.angle;
                const exitID = nodeID + exitSuffix + outIndex;
                graph.addEdge({
                    start: enterID,
                    end: exitID,
                    weight: this.smallestTurn(angleDif),
                    meta: {type: "turn"},
                });
            });
        });

        // Remove the original node if no longer used
        if (graph.getNodeInEdges(nodeID).length == 0) graph.removeNode(nodeID, true);
    }

    // Path utils
    /**
     * Creates a path to the end node given the predecessor list and the end node
     * @param predecessors The list of predecessor nodes
     * @param end The final node
     * @returns The created path
     */
    protected createPath(
        predecessors: {
            [ID: string]: string;
        },
        end: string
    ): string[] {
        const path = [] as string[];
        let next = end;
        do {
            path.unshift(next);
            next = predecessors[next];
        } while (next);
        return path;
    }

    /**
     * Splits a path into two, based on the tag the node has. Both paths will contain the node that was split on
     * @param path The path to be split
     * @param parkingGraph The parking graph to get the nodes from
     * @param tag The tag to split on
     * @returns The two paths that were created
     */
    protected splitPath(
        path: string[],
        parkingGraph: IParkingGraph,
        tag: IParkingNodeTag
    ): [string[], string[]] {
        const first = [] as string[];
        const second = [] as string[];
        let found = false;
        path.forEach(ID => {
            const node = parkingGraph[ID];
            if (!found && node.tags?.includes(tag)) {
                found = true;
                first.push(ID);
            }

            if (found) second.push(ID);
            else first.push(ID);
        });
        return [first, second];
    }

    /**
     * Retrieves the path that has to be taken in the original graph based on the path in the search graph
     * @param path The path in the search graph
     * @param searchGraph The search graph
     * @returns The path in the original graph
     */
    protected getOriginalPath(path: string[], searchGraph: ISearchGraph): string[] {
        let ID = path[0];
        if (!ID) return [];
        let originalID = undefined as string | undefined;

        const newPath = [] as string[];
        path.forEach(ID => {
            const newOriginal = searchGraph[ID].meta.original;
            if (originalID != newOriginal.ID) newPath.push(newOriginal.ID);
            originalID = newOriginal.ID;
        });

        return newPath;
    }
}
