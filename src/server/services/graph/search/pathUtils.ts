import {ISearchGraph} from "../transformations/_types/ISearchGraph";
import {IParkingNodeTag} from "../../../../_types/graph/IParkingNodeTag";
import {IParkingGraph} from "../../../../_types/graph/IParkingGraph";

/**
 * Creates a path to the end node given the predecessor list and the end node
 * @param predecessors The list of predecessor nodes
 * @param end The final node
 * @returns The created path
 */
export function createPath(
    predecessors: {
        [ID: string]: string;
    },
    end: string
): string[] {
    const path = [] as string[];
    let next = end;
    do {
        path.unshift(next);
        next = predecessors[next];
    } while (next);
    return path;
}

/**
 * Splits a path into two, based on the tag the node has. Both paths will contain the node that was split on
 * @param path The path to be split
 * @param parkingGraph The parking graph to get the nodes from
 * @param tag The tag to split on
 * @returns The two paths that were created
 */
export function splitPath(
    path: string[],
    parkingGraph: IParkingGraph,
    tag: IParkingNodeTag
): [string[], string[]] {
    const first = [] as string[];
    const second = [] as string[];
    let found = false;
    path.forEach(ID => {
        const node = parkingGraph[ID];
        if (!found && node.tags?.includes(tag)) {
            found = true;
            first.push(ID);
        }

        if (found) second.push(ID);
        else first.push(ID);
    });
    return [first, second];
}

/**
 * Retrieves the path that has to be taken in the original graph based on the path in the search graph
 * @param path The path in the search graph
 * @param searchGraph The search graph
 * @returns The path in the original graph
 */
export function getOriginalPath(path: string[], searchGraph: ISearchGraph): string[] {
    let ID = path[0];
    if (!ID) return [];
    let originalID = undefined as string | undefined;

    const newPath = [] as string[];
    path.forEach(ID => {
        const newOriginal = searchGraph[ID].meta.original;
        if (originalID != newOriginal.ID) newPath.push(newOriginal.ID);
        originalID = newOriginal.ID;
    });

    return newPath;
}
