import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";
import {
    TransformableSearchGraph,
    ISearchGraph,
} from "./transformations/_types/ISearchGraph";
import {TransformableGraph} from "./transformations/TransformableGraph";

/**
 * Creates a transformable parking graph
 * @param inputGraph The graph to create a transformable graph from
 * @returns The created transformable graph
 */
export function createTransformableParkingGraph(
    inputGraph: INormalizedParkingGraph
): TransformableSearchGraph {
    const searchGraph = {} as ISearchGraph;
    Object.keys(inputGraph).forEach(ID => {
        const node = inputGraph[ID];
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
