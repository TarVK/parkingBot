import {INormalizedParkingGraph} from "../../../../_types/graph/IParkingGraph";
import {isInterfaceNode} from "../isInterfaceNode";
import {createTransformableParkingGraph} from "../createTransformableParkingGraph";
import {TransformableGraph} from "../transformations/TransformableGraph";
import {
    ISearchNodeMeta,
    ISearchEdgeMeta,
    ISearchGraph,
} from "../transformations/_types/ISearchGraph";
import {getNodesAndEdgesWithTags} from "../transformations/searchGraphTransformationUtils";
import {addNodeTurnCostEdges} from "../transformations/addTurnCost";
import {ISymmetricEdge} from "../transformations/_types/ISymmetricEdge";

/**
 * Concerts a parking graph to a search graph that can be used for finding the optimal parking spot
 * @param parkingGraph The parking graph
 */
export function createSpotSearchGraph(
    parkingGraph: INormalizedParkingGraph
): ISearchGraph {
    /** Get the input graph in transformable form */
    const baseGraph = createTransformableParkingGraph(parkingGraph);

    /** Create the search graph */
    const searchGraph = new TransformableGraph<ISearchNodeMeta, ISearchEdgeMeta>();

    // Create the graph to all parking spots and add turn costs
    const {
        nodes: robotRoadNodes,
        edges: robotRoadEdges,
    } = getNodesAndEdgesWithTags(baseGraph, ["carPath", "botPath"]);
    robotRoadNodes.forEach(node => searchGraph.addRenamedNode(node, `0-${node.ID}`));
    robotRoadEdges.forEach(edge =>
        searchGraph.addRenamedEdge(edge, `0-${edge.start}`, `0-${edge.end}`)
    );
    robotRoadNodes
        .filter(node => !isInterfaceNode(node.meta.original))
        .forEach(({ID}) => addNodeTurnCostEdges(searchGraph, `0-${ID}`));

    // Create the graph from the parking spots to the pedestrian exit
    const {
        nodes: pedestrianNodes,
        edges: pedestrianEdges,
    } = getNodesAndEdgesWithTags(baseGraph, ["pedestrianPath"]);
    pedestrianNodes
        .filter(node => !node.meta.original.tags.includes("spot"))
        .forEach(node => searchGraph.addRenamedNode(node, `1-${node.ID}`));
    pedestrianEdges.forEach(edge => {
        const startMeta = baseGraph.getNodeMeta(edge.start);
        const newEdge = {...edge, meta: {...edge.meta, type: "walk"}} as ISymmetricEdge<
            ISearchEdgeMeta
        >;
        if (startMeta?.original.tags.includes("spot"))
            searchGraph.addRenamedEdge(newEdge, `0-${edge.start}`, `1-${edge.end}`);
        else searchGraph.addRenamedEdge(newEdge, `1-${edge.start}`, `1-${edge.end}`);
    });

    return searchGraph.export();
}
