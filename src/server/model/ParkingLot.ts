import {INormalizedParkingGraph, IParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./Bot";
import {Car} from "./Car";
import {IGraph} from "./_types/IGraph";
import {normalizeParkingGraph} from "../services/graph/normalizeParkingGraph";
import {createSpotSearchGraph} from "../services/graph/search/createSpotSearchGraph";
import {findPedestrianExits} from "../services/graph/findPedestrianExits";
import {findParkingSpot} from "../services/graph/search/findParkingSpot";
import {ISearchGraph} from "../services/graph/transformations/_types/ISearchGraph";

export class ParkingLot {
    protected graph: INormalizedParkingGraph;
    protected searchGraph: ISearchGraph;
    protected pedestrianExits: string[];
    protected bots: Bot[] = [];

    /**
     * Creates a new parking lot with the given graph
     * @param lot The setup of the lot
     */
    public constructor(lot: IParkingGraph) {
        this.graph = normalizeParkingGraph(lot);
        this.searchGraph = createSpotSearchGraph(this.graph);
        this.pedestrianExits = findPedestrianExits(this.graph);
    }

    // Lot management
    /**
     * Retrieves the graph of the parking lot
     * @returns The graph
     */
    public getGraph(): INormalizedParkingGraph {
        return this.graph;
    }

    /**
     * Retrieves the best available spot dependent on user preferences
     * @param entranceID The ID of the node that is being entered at
     * @param turnCost The cost of turning 90 degrees in relation to driving 1 meter
     * @param walkCost The cost of walking 1 meter in relation to driving 1 meter
     * @returns The ID of the best spot to park at
     */
    public findFreeSpot(
        entranceID: string = "entrance",
        turnCost: number = 5,
        walkCost: number = 5
    ): string[] | undefined {
        return findParkingSpot(this.searchGraph, this.graph, {
            startID: `0-${entranceID}`,
            exitIDs: this.pedestrianExits,
            walkWeight: walkCost,
            turnWeight: turnCost,
        });
    }

    /**
     * Claims the given space such that other bots can't take it
     * @param ID The ID of the space to claim
     */
    public claimSpace(ID: string): void {
        // TODO: implement
    }

    /**
     * Disclaims the parking spot in case the bot cancels
     * @param ID The ID of the space to disclaim
     */
    public disclaimSpace(ID: string): void {
        // TODO: implement
    }

    /**
     * Indicate that a space is taken by a car
     * @param ID The ID of the space
     * @param car The car that took the place
     */
    public takeSpace(ID: string, car: Car): void {
        // TODO: implement
    }

    /**
     * Indicates that a space is no longer taken
     * @param ID The ID of the space
     */
    public releaseSpace(ID: string): void {
        // TODO: implement
    }

    // Bot management
    /**
     * Adds the given bot to the parking lot
     * @param bot The bot to add
     */
    public addBot(bot: Bot): void {
        if (!this.bots.includes(bot)) this.bots.push(bot);
    }

    /**
     * Removes the given bot from the parking lot
     * @param bot The bot to remove
     */
    public removeBot(bot: Bot): void {
        const index = this.bots.indexOf(bot);
        if (index !== -1) this.bots.splice(index, 1);
    }

    /**
     * Sends a given message to all bots on the lot
     * @param message The message to send
     * @param args The arguments to the message
     */
    public broadcast(message: any, ...args: string[]): void {
        this.bots.forEach(conn => conn.emit(message, ...args));
    }
}
