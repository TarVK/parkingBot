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

export class ParkingSearchGraph extends AbstractSearchGraph {
    protected parkingGraph: INormalizedParkingGraph;
    protected pedestrianExitGraph: ISearchGraph;
    protected pedestrianEntranceGraph: ISearchGraph;
    protected carEntranceExitGraph: ISearchGraph;

    protected interfaceNodes: {
        carEntrances: string[];
        carExits: string[];
        pedestrianEntrances: string[];
        pedestrianExits: string[];
        spots: string[];
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
        pedestrianEdges.forEach(edge => searchGraph.addEdge(edge));
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
        pedestrianEdges.forEach(edge => searchGraph.addReversedEdge(edge));
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

        // Create the route to the parking spot
        const {
            nodes: robotRoadNodes,
            edges: robotRoadEdges,
        } = this.getNodesAndEdgesWithAllTags(parkingGraph, ["carPath", "botPath"]);
        robotRoadNodes
            .filter(node => !node.meta.original.tags.includes("exit"))
            .forEach(node => searchGraph.addRenamedNode(node, `0-${node.ID}`));
        robotRoadEdges.forEach(edge =>
            searchGraph.addRenamedEdge(edge, `0-${edge.start}`, `0-${edge.end}`)
        );

        // Create the route from the parking spot
        robotRoadNodes
            .filter(node => !node.meta.original.tags.includes("spot"))
            .forEach(node => searchGraph.addRenamedNode(node, `1-${node.ID}`));
        robotRoadEdges.forEach(edge => {
            const startMeta = parkingGraph.getNodeMeta(edge.start);
            if (startMeta?.original.tags.includes("spot"))
                searchGraph.addRenamedEdge(edge, `0-${edge.start}`, `1-${edge.end}`);
            else searchGraph.addRenamedEdge(edge, `1-${edge.start}`, `1-${edge.end}`);
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
                if (node)
                    searchGraph.addEdge({...edge, meta: {...edge.meta, spotID: node.ID}});
            });

        return searchGraph.export();
    }

    // Graph searching
    /**
     * Finds the walk data for each of the nodes
     */
    protected findPedestrianData(
        walkCost: number
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
    }): [string[], string[], string[], string[]] | undefined {
        // Make sure no invalid weights are specified
        config.turnWeight = Math.max(0, config.turnWeight) / (Math.PI / 2);
        config.walkWeight = Math.max(0, config.walkWeight);

        // Get the walking information
        const {
            entranceDistances,
            entrancePredecessors,
            exitDistances,
            exitSuccessors,
        } = this.findPedestrianData(config.walkWeight);

        // Get the predecessor map
        const {distances, predecessors} = this.search(
            this.carEntranceExitGraph,
            `0-${config.startID}`,
            (edge: ISearchEdge) => {
                let v = edge.weight;
                if (edge.meta.type == "turn") v *= config.turnWeight;
                if (edge.meta.spotID) {
                    const spotID = edge.meta.spotID;
                    v += exitDistances[spotID] + entranceDistances[spotID];
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
        if (!shortestID || distances[shortestID] == Infinity) return undefined;

        // Create the overall car path
        const carPath = this.getOriginalPath(
            this.createPath(predecessors, shortestID),
            this.carEntranceExitGraph
        );

        // Split it into the entrance and exit path
        const [carEntrancePath, carExitPath] = this.splitPath(
            carPath,
            this.parkingGraph,
            "spot"
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

        return [carEntrancePath, pedestrianExitPath, pedestrianEntrancePath, carExitPath];
    }
}
