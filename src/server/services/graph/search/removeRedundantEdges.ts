import {ISearchGraph} from "../../../model/_types/ISearchGraph";
import {ISearchEdge} from "../../../model/_types/ISearchEdge";

// This file is untested (and unused0)

/**
 * Removes redundant edges
 * @param searchGraph The graph to remove the redundant edges from
 */
function removeRedundantEdges(searchGraph: ISearchGraph) {
    // Store the incoming edges for each of the nodes
    const incomingEdges = {} as {[ID: string]: string[]};
    Object.keys(searchGraph).forEach(ID => {
        const node = searchGraph[ID];
        node.edges.forEach(({end}) => {
            if (!incomingEdges[end]) incomingEdges[end] = [];
            incomingEdges[end].push(ID);
        });
    });

    let found = false;
    const removeEdge = (nodeID: string, edge: ISearchEdge) => {
        const node = searchGraph[nodeID];
        const edgeIndex = node.edges.indexOf(edge);
        if (edgeIndex >= 0) node.edges.splice(edgeIndex, 1);
        const incoming = incomingEdges[edge.end];
        const nodeIndex = incoming.indexOf(nodeID);
        if (nodeIndex >= 0) incoming.splice(nodeIndex, 1);
        found = true;
    };
    const addEdge = (nodeID: string, edge: ISearchEdge) => {
        const node = searchGraph[nodeID];
        node.edges.push(edge);
        const incoming = incomingEdges[edge.end];
        if (!incoming.includes(nodeID)) incoming.push(nodeID);
        found = true;
    };

    // Remove redundant edges
    const combine = (edge1: ISearchEdge, edge2: ISearchEdge): ISearchEdge | undefined => {
        if (edge1.isCarTurn && edge1.weight == 0) return edge2;
        if (edge2.isCarTurn && edge2.weight == 0) return {...edge1, end: edge2.end};
        if (
            !edge1.isCarTurn &&
            !edge2.isCarTurn &&
            edge1.isPedestrianPath == edge2.isPedestrianPath
        )
            return {...edge2, weight: edge1.weight + edge2.weight};
    };

    do {
        found = false;
        Object.keys(searchGraph).forEach(ID => {
            const node = searchGraph[ID];
            const edges = node.edges;

            edges.forEach(edge => {
                const edgeNode = searchGraph[edge.end];

                // Non null car turns can't be removed (could be merged, but by construction of turns wer know that we don't have 2 consecutive turns)
                if (edge.isCarTurn && edge.weight != 0) return;

                // If there are 2 or more edges on either side, removal of the node yields equal or more edges (sum becomes product), so don't remove nodes in these cases
                if (edgeNode.edges.length >= 2 && incomingEdges[edge.end].length >= 2)
                    return;

                // Check whether there are multiple incoming or multiple outgoing edges
                if (edgeNode.edges.length > 1) {
                    // There is only 1 incoming edge, get rid of as many outgoing edges as possible
                    let combinedAll = true;
                    edgeNode.edges.forEach(outEdge => {
                        const combined = combine(edge, outEdge);
                        if (combined) {
                            removeEdge(edge.end, outEdge); // Can safely remove this edge, since the node is only reachable from 1 node anyhow
                            addEdge(ID, combined);
                        } else {
                            combinedAll = false;
                        }
                    });

                    // If all edges could be combined, remove the reference to the node
                    if (combinedAll) removeEdge(ID, edge);
                } else {
                    // There are multiple incoming edges but at most 1 outgoing
                    edgeNode.edges.forEach(outEdge => {
                        const combined = combine(edge, outEdge);
                        if (combined) {
                            removeEdge(ID, edge);
                            addEdge(ID, combined);
                        }
                    });
                }
            });
        });
    } while (found);

    // Delete any non-required nodes without incoming edges
    Object.keys(searchGraph).forEach(ID => {
        const node = searchGraph[ID];
        if (incomingEdges[ID].length == 0) delete searchGraph[ID];
    });
}
