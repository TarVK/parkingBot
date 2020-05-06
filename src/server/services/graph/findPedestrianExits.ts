import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";

/**
 * Retrieves the IDs of the pedestrian exits of the graph
 * @param parkingGraph The parking graph to analyze
 * @returns The pedestrian exits
 */
export function findPedestrianExits(parkingGraph: INormalizedParkingGraph): string[] {
    return Object.keys(parkingGraph).filter(key => {
        const node = parkingGraph[key];
        return node.tags.includes("pedestrianExit");
    });
}
