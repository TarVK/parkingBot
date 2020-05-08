import {ISymmetricEdge} from "./_types/ISymmetricEdge";
import {
    ISearchEdgeMeta,
    TransformableSearchGraph,
    ISearchNodeMeta,
} from "./_types/ISearchGraph";
import {IParkingEdgeTag} from "../../../../_types/graph/IParkingEdgeTag";
import {includesAll} from "../../arrayUtils";

/**
 * Checks whether an edge has the given tag
 * @param edge The edge to test
 * @param tags The tag to check for
 * @returns Whether the edge has the tag
 */
export function hasEdgeTag(
    edge: ISymmetricEdge<ISearchEdgeMeta>,
    tags: IParkingEdgeTag | IParkingEdgeTag[]
): boolean {
    if (!(tags instanceof Array)) tags = [tags];
    return (
        (edge.meta.type == "original" && includesAll(edge.meta.original?.tags, tags)) ??
        false
    );
}

/**
 * Creates a function to check whether an edge has the specified tag
 * @param tag The tag to check for
 * @returns The edge checking function
 */
export function getEdgeTagChecker(
    tag: IParkingEdgeTag | IParkingEdgeTag[]
): (edge: ISymmetricEdge<ISearchEdgeMeta>) => boolean {
    return edge => hasEdgeTag(edge, tag);
}

/**
 * Retrieves all nodes and edges that have certain edge tags
 * @param graph The graph to get the nodes and edges from
 * @param tags The tags that edges should have, and nodes should be connected to
 * @returns The nodes and edges
 */
export function getNodesAndEdgesWithTags(
    graph: TransformableSearchGraph,
    tags: IParkingEdgeTag | IParkingEdgeTag[]
): {
    nodes: {ID: string; meta: ISearchNodeMeta}[];
    edges: ISymmetricEdge<ISearchEdgeMeta>[];
} {
    return {
        nodes: graph
            .getNodes()
            .filter(({ID}) => graph.doesNodeHaveEdge(ID, getEdgeTagChecker(tags))),
        edges: graph.getEdges().filter(edge => hasEdgeTag(edge, tags)),
    };
}
