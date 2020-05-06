export const pedestrianNodeSuffix = "-pedestrian";

/**
 * Creates a node to represent a node for a pedestrian
 * @param nodeID The ID of the original node
 * @returns The pedestrian node ID
 */
export function createPedestrianID(nodeID: string): string {
    return nodeID + pedestrianNodeSuffix;
}
