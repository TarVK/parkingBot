import {
    ISearchGraph,
    TransformableSearchGraph,
    ISearchEdgeMeta,
    ISearchNodeMeta,
    ISearchEdge,
} from "../transformations/_types/ISearchGraph";
import {
    IParkingGraph,
    INormalizedParkingGraph,
} from "../../../../_types/graph/IParkingGraph";
import {TransformableGraph} from "../transformations/TransformableGraph";
import {AbstractSearchGraph} from "./AbstractSearchGraph";
import {IDistances} from "../_types/IDistances";
import {IPredecessors} from "../_types/IPredecessors";
import {includesAll} from "../../../../services/arrayUtils";
import {IParkingEdgeTag} from "../../../../_types/graph/IParkingEdgeTag";
import {IParkingSpaces} from "../../../model/_types/IParkingSpaces";
import {IRoute} from "../../../../_types/IRoute";

export class ParkingSearchGraph extends AbstractSearchGraph {
    protected parkingGraph: INormalizedParkingGraph;
    protected pedestrianExitGraph: ISearchGraph;
    protected pedestrianEntranceGraph: ISearchGraph;
    protected carEntranceExitGraph: ISearchGraph;
    protected botReturnGraph: ISearchGraph;

    protected interfaceNodes: {
        carEntrances: string[];
        carExits: string[];
        pedestrianEntrances: string[];
        pedestrianExits: string[];
        spots: string[];
        botQueues: {[entranceID: string]: string};
    };

    /**
     * Creates a new parking search graph
     * @param parkingGraph The parking graph to create a search graph for
     */
    public constructor(parkingGraph: INormalizedParkingGraph) {
        super();
        this.parkingGraph = parkingGraph;
        const transformableParkingGraph = TransformableGraph.fromParkingGraph(
            parkingGraph
        );
        this.pedestrianEntranceGraph = this.createPedestrianEntranceGraph(
            transformableParkingGraph
        );
        this.pedestrianExitGraph = this.createPedestrianExitGraph(
            transformableParkingGraph
        );
        this.carEntranceExitGraph = this.createCarEntranceExitGraph(
            transformableParkingGraph
        );
        this.botReturnGraph = this.createBotReturnGraph(transformableParkingGraph);
        this.interfaceNodes = this.getInterfaceNodes(transformableParkingGraph);
    }

    // Graph creation/transformation
    /**
     * Creates the pedestrian entrance graph
     * @param parkingGraph The parking graph to create it from
     * @returns The pedestrian entrance graph
     */
    protected createPedestrianEntranceGraph(
        parkingGraph: TransformableSearchGraph
    ): ISearchGraph {
        const searchGraph = new TransformableGraph<ISearchNodeMeta, ISearchEdgeMeta>();
        const {
            nodes: pedestrianNodes,
            edges: pedestrianEdges,
        } = this.getNodesAndEdgesWithAnyTags(parkingGraph, ["pedestrianPath"]);
        pedestrianNodes.forEach(node => searchGraph.addNode(node));
        pedestrianEdges
            .filter(edge => {
                const startNode = parkingGraph.getNodeMeta(edge.start)?.original;
                return !startNode?.tags.includes("spot");
            })
            .forEach(edge => searchGraph.addEdge(edge));
        return searchGraph.export();
    }

    /**
     * Creates the pedestrian exit graph
     * @param parkingGraph The parking graph to create it from
     * @returns The pedestrian exit graph
     */
    protected createPedestrianExitGraph(
        parkingGraph: TransformableSearchGraph
    ): ISearchGraph {
        const searchGraph = new TransformableGraph<ISearchNodeMeta, ISearchEdgeMeta>();
        const {
            nodes: pedestrianNodes,
            edges: pedestrianEdges,
        } = this.getNodesAndEdgesWithAnyTags(parkingGraph, ["pedestrianPath"]);
        pedestrianNodes.forEach(node => searchGraph.addNode(node));
        pedestrianEdges.forEach(edge => {
            const startNode = parkingGraph.getNodeMeta(edge.start)?.original;
            if (startNode?.tags.includes("spot"))
                edge = {
                    ...edge,
                    meta: {...edge.meta, spot: {ID: startNode.ID, isDestination: false}},
                };

            searchGraph.addReversedEdge(edge);
        });
        return searchGraph.export();
    }

    /**
     * Creates the car entrance exit graph
     * @param parkingGraph The parking graph to create it from
     * @returns The car entrance exit graph
     */
    protected createCarEntranceExitGraph(
        parkingGraph: TransformableSearchGraph
    ): ISearchGraph {
        const searchGraph = new TransformableGraph<ISearchNodeMeta, ISearchEdgeMeta>();
        const requiredTags = ["carPath"] as IParkingEdgeTag[];

        // Create the route to the parking spot (graph 1)
        const {
            nodes: robotRoadNodes,
            edges: robotRoadEdges,
        } = this.getNodesAndEdgesWithAllTags(parkingGraph, [...requiredTags, "botPath"]);
        robotRoadNodes
            .filter(node => !node.meta.original.tags.includes("exit"))
            .forEach(node => searchGraph.addRenamedNode(node, `0-${node.ID}`));
        robotRoadEdges.forEach(edge =>
            searchGraph.addRenamedEdge(edge, `0-${edge.start}`, `0-${edge.end}`)
        );

        // Create the route from the parking spot (graph 2)

        const {nodes: roadNodes, edges: roadEdges} = this.getNodesAndEdgesWithAllTags(
            parkingGraph,
            requiredTags
        );
        roadNodes
            .filter(node => !node.meta.original.tags.includes("spot"))
            .forEach(node => searchGraph.addRenamedNode(node, `1-${node.ID}`));
        roadEdges
            .filter(
                edge => !this.edgeConnectsToNodesWithAnyTags(parkingGraph, edge, ["spot"])
            )
            .forEach(edge =>
                searchGraph.addRenamedEdge(edge, `1-${edge.start}`, `1-${edge.end}`)
            );

        // Insert dedicated spot nodes that connects the two graphs
        roadNodes
            .filter(node => node.meta.original.tags.includes("spot"))
            .forEach(node => {
                searchGraph.addRenamedNode(node, `spot-${node.ID}`);
                parkingGraph
                    .getNodeInEdges(node.ID)
                    .filter(edge => includesAll(edge.meta.original?.tags, requiredTags))
                    .forEach(edge => {
                        searchGraph.addRenamedEdge(
                            edge,
                            `0-${edge.start}`,
                            `spot-${edge.end}`
                        );
                        searchGraph.addRenamedEdge(
                            edge,
                            `1-${edge.start}`,
                            `spot-${edge.end}`
                        );
                    });
                parkingGraph
                    .getNodeOutEdges(node.ID)
                    .filter(edge => includesAll(edge.meta.original?.tags, requiredTags))
                    .forEach(edge => {
                        searchGraph.addRenamedEdge(
                            edge,
                            `spot-${edge.start}`,
                            `0-${edge.end}`
                        );
                        searchGraph.addRenamedEdge(
                            edge,
                            `spot-${edge.start}`,
                            `1-${edge.end}`
                        );
                    });
            });

        // Add all turning edges
        searchGraph
            .getNodes()
            .filter(node => !this.isInterfaceNode(node.meta.original))
            .forEach(({ID}) => this.addNodeTurnCostEdges(searchGraph, ID));

        // Adds all spot IDs to turn edges through spots
        searchGraph
            .getEdges()
            .filter(
                edge =>
                    edge.meta.type == "turn" &&
                    searchGraph.getNodeMeta(edge.start)?.original.tags.includes("spot")
            )
            .forEach(edge => {
                const node = searchGraph.getNodeMeta(edge.start)?.original;
                if (node) {
                    const isDestination = !!edge.start.match(/^spot\-/); // Only the spot nodes connecting the two graphs are destinations
                    searchGraph.addEdge({
                        ...edge,
                        meta: {
                            ...edge.meta,
                            spot: {
                                ID: node.ID,
                                isDestination,
                            },
                        },
                    });
                }
            });

        return searchGraph.export();
    }

    /**
     * Creates the bot return graph
     * @param parkingGraph The parking graph to create it from
     * @returns The bot return graph
     */
    protected createBotReturnGraph(parkingGraph: TransformableSearchGraph): ISearchGraph {
        const searchGraph = new TransformableGraph<ISearchNodeMeta, ISearchEdgeMeta>();
        const {
            nodes: botNodes,
            edges: botEdges,
        } = this.getNodesAndEdgesWithAnyTags(parkingGraph, ["botPath"]);
        botNodes.forEach(node => searchGraph.addNode(node));
        botEdges.forEach(edge => {
            const startNode = parkingGraph.getNodeMeta(edge.start)?.original;
            if (startNode?.tags.includes("spot"))
                edge = {
                    ...edge,
                    meta: {...edge.meta, spot: {ID: startNode.ID, isDestination: false}},
                };

            searchGraph.addReversedEdge(edge);
        });
        return searchGraph.export();
    }

    // Graph searching
    /**
     * Finds the walk data for each of the nodes
     * @param walkCost The cost of walking 1 meter compared to driving 1
     * @param parkingSpaces The state of the parking spaces
     * @returns The relevant pedestrian path data
     */
    protected findPedestrianData(
        walkCost: number,
        parkingSpaces: IParkingSpaces
    ): {
        entranceDistances: IDistances;
        entrancePredecessors: {[ID: string]: IPredecessors};
        exitDistances: IDistances;
        exitSuccessors: {[ID: string]: IPredecessors};
    } {
        const entranceDistances = {} as IDistances;
        const entrancePredecessors = {} as {[ID: string]: IPredecessors};
        const exitDistances = {} as IDistances;
        const exitSuccessors = {} as {[ID: string]: IPredecessors};
        this.interfaceNodes.spots.forEach(ID => {
            entranceDistances[ID] = Infinity;
            exitDistances[ID] = Infinity;
        });

        const getCost = (edge: ISearchEdge) => {
            if (edge.meta.spot) {
                const spotData = parkingSpaces[edge.meta.spot.ID];
                if (spotData?.isClaimed || spotData?.isTaken) return Infinity;
            }
            return edge.weight * walkCost;
        };

        // Find the best entrances
        this.interfaceNodes.pedestrianEntrances.forEach(entranceID => {
            const {distances, predecessors} = this.search(
                this.pedestrianEntranceGraph,
                entranceID,
                getCost
            );
            this.interfaceNodes.spots.forEach(ID => {
                if (distances[ID] < entranceDistances[ID]) {
                    entranceDistances[ID] = distances[ID];
                    entrancePredecessors[ID] = predecessors;
                }
            });
        });

        // Find the best exits
        this.interfaceNodes.pedestrianExits.forEach(exitID => {
            const {distances, predecessors} = this.search(
                this.pedestrianExitGraph,
                exitID,
                getCost
            );
            this.interfaceNodes.spots.forEach(ID => {
                if (distances[ID] < exitDistances[ID]) {
                    exitDistances[ID] = distances[ID];
                    exitSuccessors[ID] = predecessors; // exit graph is reversed
                }
            });
        });

        // Return all the data
        return {entranceDistances, entrancePredecessors, exitDistances, exitSuccessors};
    }

    /**
     * Finds the path for the robot to take
     * @param spotPath The path to the parking spot destination
     * @param botQueueNodeID The node that represents the waiting area of the bots
     * @param parkingSpaces The state of the parking spaces
     * @returns The paths for the bot to take, if possible
     */
    public findBotPath(
        spotPath: string[],
        botQueueNodeID: string,
        parkingSpaces: IParkingSpaces
    ): {pointDir: number; path: [string[], string[]]} | null {
        const spotPathNodes = {};
        spotPath.forEach(nodeID => (spotPathNodes[nodeID] = true));

        const {distances, predecessors} = this.search(
            this.botReturnGraph,
            botQueueNodeID,
            (edge: ISearchEdge, startID: string) => {
                if (edge.meta.spot) {
                    const spotData = parkingSpaces[edge.meta.spot.ID];
                    if (spotData?.isClaimed || spotData?.isTaken) return Infinity;
                }
                if (spotPathNodes[startID] && startID != botQueueNodeID) return Infinity;
                return edge.weight;
            }
        );

        // Go through the nodes of the path, and find the last one that we can return from
        const botSpotPath = [...spotPath];
        let finalStop: string | null;
        do {
            finalStop = botSpotPath[botSpotPath.length - 1];
            if (distances[finalStop] < Infinity) {
                break;
            } else {
                finalStop = null;
                botSpotPath.pop();
            }
        } while (botSpotPath.length > 0);
        if (!finalStop) return null;

        // Get the direction to point at
        let pointDir = 0;
        const removedNodeID = spotPath[botSpotPath.length];
        const lastNodeID = botSpotPath[botSpotPath.length - 1];
        if (removedNodeID && lastNodeID) {
            const removedNode = this.botReturnGraph[removedNodeID];
            const lastNode = this.botReturnGraph[lastNodeID];
            if (!lastNode || !removedNode) throw Error("Invalid node on path");

            let dx = removedNode.meta.original.x - lastNode.meta.original.x;
            let dy = removedNode.meta.original.y - lastNode.meta.original.y;
            const carDir = Math.atan2(dy, dx);

            const botNode = this.botReturnGraph[predecessors[lastNodeID]];
            dx = botNode.meta.original.x - lastNode.meta.original.x;
            dy = botNode.meta.original.y - lastNode.meta.original.y;
            const botDir = Math.atan2(dy, dx);

            pointDir = carDir - botDir;
        }

        pointDir += Math.PI / 2; // 0 should point right, rather than up
        pointDir = (pointDir + Math.PI * 2) % (Math.PI * 2);

        // Remove the part of the path until the queue is reached
        while (botSpotPath[0].length && botSpotPath[0] != botQueueNodeID)
            botSpotPath.shift();

        // Create the return path
        const returnPath = this.getOriginalPath(
            this.createPath(predecessors, finalStop).reverse(),
            this.botReturnGraph
        );

        // Make sure to wait 1 node further than the actual parking spot
        return {pointDir, path: [[...botSpotPath, returnPath[1]], returnPath.slice(1)]};
    }

    /**
     * Finds the best parking spot
     * @param config The configuration for the search specifics
     * @returns The path to both the parking spot and the exit
     */
    public findParkingSpot(config: {
        /** The node to start the search from */
        startID: string;
        /** How expensive walking 1 meter is in relation to driving 1 meter */
        walkWeight: number;
        /** How expensive turning 90 degrees is in relation to driving 1 meter */
        turnWeight: number;
        /** The parking spots states */
        parkingSpaces: IParkingSpaces;
    }): IRoute | undefined {
        // Make sure no invalid weights are specified
        config.turnWeight = Math.max(0, config.turnWeight) / (Math.PI / 2);
        config.walkWeight = Math.max(0, config.walkWeight);

        // Get the walking information
        const {
            entranceDistances,
            entrancePredecessors,
            exitDistances,
            exitSuccessors,
        } = this.findPedestrianData(config.walkWeight, config.parkingSpaces);

        // Get the predecessor map
        const {distances, predecessors} = this.search(
            this.carEntranceExitGraph,
            `0-${config.startID}`,
            (edge: ISearchEdge) => {
                let v = edge.weight;
                if (edge.meta.type == "turn") v *= config.turnWeight;
                if (edge.meta.spot) {
                    const spot = edge.meta.spot;
                    if (spot.isDestination)
                        v += exitDistances[spot.ID] + entranceDistances[spot.ID];
                    if (
                        config.parkingSpaces[spot.ID].isClaimed ||
                        config.parkingSpaces[spot.ID].isTaken
                    )
                        return Infinity;
                }
                return v;
            }
        );

        // Find the shortest path
        let shortestID: string | undefined;
        this.interfaceNodes.carExits.forEach(ID => {
            const transformedID = `1-${ID}`;
            if (!shortestID || distances[transformedID] < distances[shortestID])
                shortestID = transformedID;
        });
        console.log(shortestID && distances[shortestID]);
        if (!shortestID || distances[shortestID] == Infinity) return undefined;

        // Create the overall car path
        const [carEntranceSearchPath, carExitSearchPath] = this.splitSearchPath(
            this.createPath(predecessors, shortestID),
            this.carEntranceExitGraph,
            node => !!node.edges.find(edge => edge.meta.spot?.isDestination)
        );
        const carEntrancePath = this.getOriginalPath(
            carEntranceSearchPath,
            this.carEntranceExitGraph
        );
        const carExitPath = this.getOriginalPath(
            carExitSearchPath,
            this.carEntranceExitGraph
        );
        const spotID = carExitPath[0];

        // Get the pedestrian exit and entrance path
        const pedestrianEntrancePath = this.getOriginalPath(
            this.createPath(entrancePredecessors[spotID], spotID),
            this.pedestrianEntranceGraph
        );
        const pedestrianExitPath = this.getOriginalPath(
            this.createPath(exitSuccessors[spotID], spotID).reverse(),
            this.pedestrianExitGraph
        );

        const carPath = [
            carEntrancePath,
            pedestrianExitPath,
            pedestrianEntrancePath,
            carExitPath,
        ] as IRoute["car"];

        // Get the bot path
        const botPath = this.findBotPath(
            carEntrancePath,
            this.interfaceNodes.botQueues[config.startID],
            config.parkingSpaces
        );
        if (!botPath) return undefined;

        return {
            car: carPath,
            bot: botPath,
        };
    }
}
