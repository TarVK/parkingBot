import {IParkingEdgeTag} from "../../../_types/graph/IParkingEdgeTag";

export type IIndependentParkingEdge = Readonly<{
    start: {
        ID: string;
        x: number;
        y: number;
    };
    end: {
        ID: string;
        x: number;
        y: number;
    };
    tags: Readonly<IParkingEdgeTag[]>;
}>;
