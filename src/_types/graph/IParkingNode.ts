import {IParkingEdge, INormalizedParkingEdge} from "./IParkingEdge";

export type IParkingNodeTag =
    | "spot" /** A valid parking spot */
    | "entrance" /** The car entrance to the parking lot */
    | "exit" /** The car exit of the parking lot */
    | "pedestrianEntrance" /** The pedestrian entrance to the parking lot */
    | "pedestrianExit" /** The pedestrian exit to the parking lot */
    | "carPath" /** A road path */
    | "pedestrianPath" /** A pedestrian path */
    | "botPath" /** A pedestrian parking bot path */;

// If tags are left out, they will automatically be set to ["carPath", "pedestrianPath", "botPath"]
// If "spot", "entrance" or "exit" is present, "carPath" will automatically be added if absent
// If "spot", "pedestrianEntrance" or "pedestrianExit" is present, "pedestrianPath" will automatically be added if absent

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
