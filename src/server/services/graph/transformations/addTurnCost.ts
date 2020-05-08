import {IParkingGraph} from "../../../../_types/graph/IParkingGraph";
import {TransformableSearchGraph, ISearchEdgeMeta} from "./_types/ISearchGraph";
import {ISymmetricEdge} from "./_types/ISymmetricEdge";
import {INormalizedParkingEdge} from "../../../../_types/graph/IParkingEdge";

/**
 * Returns the minimal number of radians to turn (either left or right) to get to the specified angle
 * @param angle The angle in radians
 * @returns The rotation amount
 */
function smallestTurn(angle: number): number {
    return Math.abs((((angle % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); // Clamps value between 0 and PI
}

/**
 * Checks whether a given edge is an original edge of the graph
 * @param edge The edge to check
 * @returns Whether the edge is an original edge
 */
function isOriginalEdge(
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
export function addNodeTurnCostEdges(
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
        if (!isOriginalEdge(inEdge)) return;

        // Replace the incoming edge by an edge to a dedicated enter node
        graph.removeEdge(inEdge);
        const enterID = nodeID + enterSuffix + inIndex;
        graph.addNode(enterID, {original});
        graph.addEdge({...inEdge, end: enterID});
    });

    // Go through all outgoing edges to route them from a dedicated exit vertex
    outEdges.forEach((outEdge, outIndex) => {
        if (!isOriginalEdge(outEdge)) return;

        // Replace the outgoing edge by an edge from a dedicated exit node
        graph.removeEdge(outEdge);
        const exitID = nodeID + exitSuffix + outIndex;
        graph.addNode(exitID, {original});
        graph.addEdge({...outEdge, start: exitID});
    });

    // Add the cross product of incoming and outgoing edges, and calculate their angle difference
    inEdges.forEach((inEdge, inIndex) => {
        if (!isOriginalEdge(inEdge)) return;
        const inOr = inEdge.meta.original;
        const enterID = nodeID + enterSuffix + inIndex;

        outEdges.forEach((outEdge, outIndex) => {
            if (!isOriginalEdge(outEdge)) return;

            const angleDif = outEdge.meta.original.angle - inOr.angle;
            const exitID = nodeID + exitSuffix + outIndex;
            graph.addEdge({
                start: enterID,
                end: exitID,
                weight: smallestTurn(angleDif),
                meta: {type: "turn"},
            });
        });
    });

    // Remove the original node if no longer used
    if (graph.getNodeInEdges(nodeID).length == 0) graph.removeNode(nodeID, true);
}
