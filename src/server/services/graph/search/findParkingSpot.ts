import {IGraph} from "../../../model/_types/IGraph";
import {graphSearch} from "./graphSearch";
import {IEdge} from "../../../model/_types/IEdge";
import {IParkingGraph} from "../../../../_types/graph/IParkingGraph";
import {getOriginalPath, createPath} from "./pathUtils";
import {ISearchGraph, ISearchEdge} from "../transformations/_types/ISearchGraph";

/**
 * Finds the best parking spot
 * @param searchGraph The graph to search through
 * @param parkingGraph The parking graph to get metadata from
 * @param config The configuration for the search specifics
 * @returns The path to both the parking spot and the exit
 */
export function findParkingSpot(
    searchGraph: ISearchGraph,
    parkingGraph: IParkingGraph,
    config: {
        /** The node to start the search from */
        startID: string;
        /** The nodes that are pedestrian exits */
        exitIDs: string[];
        /** How expensive walking 1 meter is in relation to driving 1 meter */
        walkWeight: number;
        /** How expensive turning 90 degrees is in relation to driving 1 meter */
        turnWeight: number;
    }
): string[] | undefined {
    // Make sure no invalid weights are specified
    config.turnWeight = Math.max(0, config.turnWeight);
    config.walkWeight = Math.max(0, config.walkWeight);

    // Get the predecessor map
    const {distances, predecessors} = graphSearch(
        searchGraph,
        config.startID,
        (edge: ISearchEdge) => {
            if (edge.meta.type == "turn") return edge.weight * config.turnWeight;
            if (edge.meta.type == "walk") return edge.weight * config.walkWeight;
            return edge.weight;
        }
    );

    // Find the shortest path
    let shortestID: string | undefined;
    config.exitIDs.forEach(ID => {
        const pedestrianID = `1-${ID}`;
        if (!shortestID || distances[pedestrianID] < distances[shortestID])
            shortestID = pedestrianID;
    });
    if (!shortestID) return undefined;

    // Create the overall path
    const path = getOriginalPath(createPath(predecessors, shortestID), searchGraph);
    return path;
}
