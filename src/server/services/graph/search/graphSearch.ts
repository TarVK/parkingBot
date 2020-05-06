import {ISearchGraph} from "../../../model/_types/ISearchGraph";
import Heap from "../../Heap";
import {ISearchEdge} from "../../../model/_types/ISearchEdge";

/**
 * Creates a tree connecting all nodes to the start node in the shortest way
 * @param searchGraph The graph to search through
 * @param startID The node to start at
 * @param getWeight The callback to get an edge weight
 * @returns A map of the IDs of all predecessor nodes on the shortest path from the start
 */
export function graphSearch(
    searchGraph: ISearchGraph,
    startID: string,
    getWeight: (edge: ISearchEdge, startID: string) => number
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
        (node1: {distance: number; ID: string}, node2: {distance: number; ID: string}) =>
            node1.distance <= node2.distance
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
