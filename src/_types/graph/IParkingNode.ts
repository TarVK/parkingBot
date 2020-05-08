import {IParkingEdge, INormalizedParkingEdge} from "./IParkingEdge";
import {IParkingNodeTag} from "./IParkingNodeTag";

export type IParkingNode = {
    x: number;
    y: number;
    edges?: IParkingEdge[];
    tags?: IParkingNodeTag[];
};

export type INormalizedParkingNode = {
    x: number;
    y: number;
    edges: INormalizedParkingEdge[];
    tags: IParkingNodeTag[];
};
