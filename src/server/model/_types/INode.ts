import {IEdge} from "./IEdge";

export type INode<N, E> = {
    meta: N;
    edges: IEdge<E>[];
};
