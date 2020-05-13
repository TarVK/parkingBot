import {IParkingEdge, INormalizedParkingEdge} from "./IParkingEdge";
import {IParkingNodeTag} from "./IParkingNodeTag";

export type IParkingNode = Readonly<{
    x: number;
    y: number;
    edges?: Readonly<IParkingEdge[]>;
    tags?: Readonly<IParkingNodeTag[]>;
}>;

export type INormalizedParkingNode = Readonly<{
    x: number;
    y: number;
    edges: Readonly<INormalizedParkingEdge[]>;
    tags: Readonly<IParkingNodeTag[]>;
}>;
