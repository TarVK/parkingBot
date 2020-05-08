import {TNormalized} from "../TNormalized";
import {IParkingEdgeTag} from "./IParkingEdgeTag";

export type IParkingEdge = {
    end: string;
    distance?: number;
    angle?: number;
    tags?: IParkingEdgeTag[];
};

export type INormalizedParkingEdge = TNormalized<IParkingEdge>;
