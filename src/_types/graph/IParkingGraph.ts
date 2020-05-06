import {IParkingNode, INormalizedParkingNode} from "./IParkingNode";

export type IParkingGraph = {[ID: string]: IParkingNode};

export type INormalizedParkingGraph = {[ID: string]: INormalizedParkingNode};
