import {ISearchGraph} from "../../../model/_types/ISearchGraph";
import {graphSearch} from "./graphSearch";
import {ISearchEdge} from "../../../model/_types/ISearchEdge";
import {createPedestrianID} from "./pedestrianNodeSuffix";
import {IParkingGraph} from "../../../../_types/graph/IParkingGraph";
import {getOriginalPath} from "./getOriginalPath";

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
):
    | {
          /** The path towards the spot */
          spotPath: string[];
          /** The path from the spot towards the pedestrian exit */
          exitPath: string[];
      }
    | undefined {
    // Get the predecessor map
    const {distances, predecessors} = graphSearch(
        searchGraph,
        config.startID,
        (edge: ISearchEdge) => {
            if (edge.isCarTurn) return edge.weight * config.turnWeight;
            if (edge.isPedestrianPath) return edge.weight * config.walkWeight;
            return edge.weight;
        }
    );
    console.log(predecessors);

    // Find the shortest path
    let shortestID: string | undefined;
    config.exitIDs.forEach(ID => {
        const pedestrianID = createPedestrianID(ID);
        if (!shortestID || distances[pedestrianID] < distances[shortestID])
            shortestID = pedestrianID;
    });
    if (!shortestID) return undefined;

    // Create lists to properly store the paths
    const exitPath = [] as string[];
    const spotPath = [] as string[];

    let next = shortestID;
    do {
        exitPath.unshift(next);
        next = predecessors[next];
    } while (next && !parkingGraph[searchGraph[next].original].tags?.includes("spot"));
    exitPath.unshift(next);

    do {
        spotPath.unshift(next);
        next = predecessors[next];
    } while (next);
    console.log("Detect");

    return {
        spotPath: getOriginalPath(spotPath, searchGraph),
        exitPath: getOriginalPath(exitPath, searchGraph),
    };
}
