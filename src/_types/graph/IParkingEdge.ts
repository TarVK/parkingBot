import {TNormalized} from "../TNormalized";
import {IParkingEdgeTag} from "./IParkingEdgeTag";

export type IParkingEdge = Readonly<{
    end: string;
    distance?: number;
    angle?: number;
    tags?: Readonly<IParkingEdgeTag[]>;
}>;

export type INormalizedParkingEdge = TNormalized<IParkingEdge>;
