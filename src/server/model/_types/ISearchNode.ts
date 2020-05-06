import {ISearchEdge} from "./ISearchEdge";

export type ISearchNode = {
    original: string;
    edges: ISearchEdge[];
};
