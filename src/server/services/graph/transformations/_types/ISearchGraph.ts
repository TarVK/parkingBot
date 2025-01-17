import {INormalizedParkingNode} from "../../../../../_types/graph/IParkingNode";
import {INormalizedParkingEdge} from "../../../../../_types/graph/IParkingEdge";
import {IGraph} from "../../../../model/_types/IGraph";
import {INode} from "../../../../model/_types/INode";
import {IEdge} from "../../../../model/_types/IEdge";
import {TransformableGraph} from "../TransformableGraph";

export type ISearchNodeMeta = {original: {ID: string} & INormalizedParkingNode};
export type ISearchEdgeMeta = {
    original?: {start: string} & INormalizedParkingEdge;
    type: "original" | "turn" | "walk";
    spot?: {
        // Only present if this is a spot turn edge
        ID: string;
        isDestination: boolean; // Whether it's the final spot to park at, or just one to pass through
    };
};

export type ISearchGraph = IGraph<ISearchNodeMeta, ISearchEdgeMeta>;
export type ISearchNode = INode<ISearchNodeMeta, ISearchEdgeMeta>;
export type ISearchEdge = IEdge<ISearchEdgeMeta>;

export type TransformableSearchGraph = TransformableGraph<
    ISearchNodeMeta,
    ISearchEdgeMeta
>;
