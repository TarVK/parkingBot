import {INormalizedParkingNode} from "../../../_types/graph/IParkingNode";
import {includesAny} from "../includesAny";

/**
 * Checks whether this is a special node to interface with "The outside world"
 * @param node The node to check
 * @returns Whether this is an interface node
 */
export function isInterfaceNode(node: INormalizedParkingNode): boolean {
    return includesAny(node.tags, [
        "spot",
        "entrance",
        "exit",
        "pedestrianEntrance",
        "pedestrianExit",
    ]);
}
