import {
    INormalizedParkingGraph,
    IParkingGraph,
} from "../../../_types/graph/IParkingGraph";
import {includesAny} from "../includesAny";

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
            tags: [...(node.tags || ["carPath", "pedestrianPath", "botPath"])],
            edges: (node.edges || []).map(edge => ({...edge})),
        };
    });

    // Make sure tags are accompanied by the right other tags
    Object.values(graph).forEach(node => {
        if (
            includesAny(node.tags, ["spot", "entrance", "exit"]) &&
            !node.tags?.includes("carPath")
        )
            node.tags?.push("carPath");
        if (
            includesAny(node.tags, ["spot", "pedestrianEntrance", "pedestrianExit"]) &&
            !node.tags?.includes("pedestrianPath")
        )
            node.tags?.push("pedestrianPath");
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
        });
    });

    // Return the updates graph
    return graph as INormalizedParkingGraph;
}
