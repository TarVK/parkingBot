import {TNormalized} from "../TNormalized";

export type IParkingEdge = {end: string; distance?: number; angle?: number};

export type INormalizedParkingEdge = TNormalized<IParkingEdge>;
