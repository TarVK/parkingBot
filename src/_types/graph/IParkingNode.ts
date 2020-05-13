import {IParkingEdge, INormalizedParkingEdge} from "./IParkingEdge";
import {IParkingNodeTag} from "./IParkingNodeTag";

export type IParkingNode = Readonly<{
    x: number;
    y: number;
    edges?: IParkingEdge[];
    tags?: IParkingNodeTag[];
}>;

export type INormalizedParkingNode = Readonly<{
    x: number;
    y: number;
    edges: INormalizedParkingEdge[];
    tags: IParkingNodeTag[];
}>;
