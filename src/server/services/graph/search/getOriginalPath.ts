import {ISearchGraph} from "../../../model/_types/ISearchGraph";

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
        const newOriginalID = searchGraph[ID].original;
        if (originalID != newOriginalID) newPath.push(newOriginalID);
        originalID = newOriginalID;
    });

    return newPath;
}
