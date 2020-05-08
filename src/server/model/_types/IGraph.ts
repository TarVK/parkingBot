import {INode} from "./INode";

export type IGraph<N, E> = {[ID: string]: INode<N, E>};
