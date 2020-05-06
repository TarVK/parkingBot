import {
    IParkingGraph,
    INormalizedParkingGraph,
} from "../../../../_types/graph/IParkingGraph";
import {ISearchGraph} from "../../../model/_types/ISearchGraph";
import {ISearchEdge} from "../../../model/_types/ISearchEdge";
import {isInterfaceNode} from "../isInterfaceNode";
import {createPedestrianID} from "./pedestrianNodeSuffix";

/**
 * Returns the minimal number of radians to turn (either left or right) to get to the specified angle
 * @param angle The angle in radians
 * @returns The rotation amount
 */
function smallestTurn(angle: number): number {
    return Math.abs((((angle % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); // Clamps value between 0 and PI
}

/**
 * Adds the turn edges to the search graph
 * @param parkingGraph The graph to add (/replace) edges to
 * @param includeTurn The list of node ids for which to create the turn edges
 * @param include The list of node ids for which to put any node in the graph
 * @returns The search graph with the turn edges added
 */
function addTurnEdges(
    parkingGraph: INormalizedParkingGraph,
    includeTurn: string[],
    include: string[]
): ISearchGraph {
    // Store the incoming edges for each of the nodes
    const incomingEdges = {} as {[ID: string]: string[]};
    Object.keys(parkingGraph).forEach(ID => {
        const node = parkingGraph[ID];
        node.edges.forEach(({end}) => {
            if (!incomingEdges[end]) incomingEdges[end] = [];
            incomingEdges[end].push(ID);
        });
    });
    const getEnterID = (start: string, end: string): string =>
        includeTurn.includes(end)
            ? `${end}-Enter${incomingEdges[end].findIndex(inc => inc === start)}`
            : end;

    // Define a graph to store the result in, and a method to add edges
    const searchGraph = {} as ISearchGraph;
    const addEdge = (originalID: string, start: string, edge: ISearchEdge): void => {
        if (!searchGraph[start])
            searchGraph[start] = {
                original: originalID,
                edges: [],
            };
        searchGraph[start].edges.push(edge);
    };

    // Go through each included node, and replace it with a collection of nodes
    includeTurn.forEach(ID => {
        const node = parkingGraph[ID];

        // Go through all incoming edges
        incomingEdges[ID].forEach((incomingNodeID, incomingEdgeIndex) => {
            const incomingNode = parkingGraph[incomingNodeID];
            const incomingEdge = incomingNode.edges.find(({end}) => end === ID);
            if (incomingEdge === undefined) return;

            // Go through all outgoing edges to add turn edges between incoming and outgoing
            node.edges.forEach(({angle: outgoingAngle}, outgoingEdgeIndex) => {
                const angleDif = outgoingAngle - incomingEdge.angle;
                addEdge(ID, `${ID}-Enter${incomingEdgeIndex}`, {
                    end: `${ID}-Exit${outgoingEdgeIndex}`,
                    weight: smallestTurn(angleDif),
                    isPedestrianPath: false,
                    isCarTurn: true,
                });
            });
        });

        // Go through all outgoing edges to add them with vertices
        node.edges.forEach(({end: outgoingNodeID, distance}, outgoingEdgeIndex) => {
            addEdge(ID, `${ID}-Exit${outgoingEdgeIndex}`, {
                end: getEnterID(ID, outgoingNodeID),
                weight: distance,
                isPedestrianPath: false,
                isCarTurn: false,
            });
        });
    });

    // Create all edges for nodes that shouldn't be included in turning
    include.forEach(ID => {
        if (includeTurn.includes(ID)) return;
        const node = parkingGraph[ID];

        // Add all outgoing edges
        node.edges.forEach(({end, distance}, outgoingEdgeIndex) => {
            addEdge(ID, ID, {
                end: getEnterID(ID, end),
                weight: distance,
                isPedestrianPath: false,
                isCarTurn: false,
            });
        });
    });

    return searchGraph;
}

/**
 * Concerts a parking graph to a search graph that can be used for finding the optimal parking spot
 * @param parkingGraph The parking graph
 */
export function createSpotSearchGraph(
    parkingGraph: INormalizedParkingGraph
): ISearchGraph {
    const carPathNodes = Object.keys(parkingGraph).filter(ID =>
        parkingGraph[ID].tags.includes("carPath")
    );
    const standardNodes = carPathNodes.filter(ID => !isInterfaceNode(parkingGraph[ID]));
    const searchGraph = addTurnEdges(parkingGraph, standardNodes, carPathNodes);

    // Create the second copy of the graph, connecting to parking spots and pedestrian entrance/exit
    Object.keys(parkingGraph).forEach(ID => {
        const node = parkingGraph[ID];
        if (!node.tags.includes("pedestrianPath")) return;

        // Create all edges to pedestrian nodes
        const pedestrianEdges = node.edges
            .filter(({end}) => {
                const endNode = parkingGraph[end];
                return endNode.tags.includes("pedestrianPath");
            })
            .map(({end, distance}) => ({
                end: createPedestrianID(end),
                weight: distance,
                isCarTurn: false,
                isPedestrianPath: true,
            }));

        // If the node is a spot, just add the edges, otherwise add a pedestrian node
        if (node.tags.includes("spot")) {
            searchGraph[ID].edges.push(...pedestrianEdges);
        } else {
            searchGraph[createPedestrianID(ID)] = {
                original: ID,
                edges: pedestrianEdges,
            };
        }
    });

    return searchGraph;
}
