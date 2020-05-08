import {
    INormalizedParkingGraph,
    IParkingGraph,
} from "../../../_types/graph/IParkingGraph";

/**
 * Creates a normalized parking graph
 * @param parkingGraph The graph to normalize
 * @returns The normalized graph
 */
export function normalizeParkingGraph(
    parkingGraph: IParkingGraph
): INormalizedParkingGraph {
    // Copy the graph, and create edge and tag arrays if needed
    const graph = {} as IParkingGraph;
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
    Object.values(graph).forEach(node => {
        node.edges?.forEach(edge => {
            const endNode = graph[edge.end];
            const dX = endNode.x - node.x;
            const dY = endNode.y - node.y;
            if (edge.distance === undefined) edge.distance = Math.sqrt(dX * dX + dY * dY);
            if (edge.angle === undefined) edge.angle = Math.atan2(dY, dX);
            if (!edge.tags) edge.tags = [];
        });
    });

    // Return the updates graph
    return graph as INormalizedParkingGraph;
}
