import {INormalizedParkingGraph, IParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./Bot";
import {Car} from "./Car";
import {TransformableGraph} from "../services/graph/transformations/TransformableGraph";
import {ParkingSearchGraph} from "../services/graph/search/ParkingSearchGraph";
import {IParkingSpaces} from "./_types/IParkingSpaces";
import {ForeignEntityManager} from "./ForeignEntityManager";
import {IRoute} from "../../_types/IRoute";

export class ParkingLot {
    protected graph: INormalizedParkingGraph;
    protected searchGraph: ParkingSearchGraph;
    protected bots: Bot[] = [];
    protected parkingSpaces: IParkingSpaces = {};
    protected entityManager = new ForeignEntityManager(this);

    /**
     * Creates a new parking lot with the given graph
     * @param lot The setup of the lot
     */
    public constructor(lot: IParkingGraph) {
        this.graph = TransformableGraph.normalizeParkingGraph(lot);
        this.searchGraph = new ParkingSearchGraph(this.graph);
        Object.keys(this.graph)
            .filter(ID => this.graph[ID].tags.includes("spot"))
            .forEach(ID => {
                this.parkingSpaces[ID] = {
                    ID,
                    isClaimed: false,
                    isTaken: false,
                    car: null,
                };
            });
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
    ): IRoute | undefined {
        return this.searchGraph.findParkingSpot({
            startID: entranceID,
            walkWeight: walkCost,
            turnWeight: turnCost,
            parkingSpaces: this.parkingSpaces,
        });
    }

    /**
     * Claims the given space such that other bots can't take it
     * @param ID The ID of the space to claim
     * @returns Whether the space could be claimed
     */
    public claimSpace(ID: string): boolean {
        const spot = this.parkingSpaces[ID];
        if (spot) {
            if (spot.isClaimed || spot.isTaken) return false;
            spot.isClaimed = true;
            this.updateSpaces();
        }
        return true;
    }

    /**
     * Disclaims the parking spot in case the bot cancels
     * @param ID The ID of the space to disclaim
     */
    public disclaimSpace(ID: string): void {
        const spot = this.parkingSpaces[ID];
        if (spot) {
            spot.isClaimed = false;
            this.updateSpaces();
        }
    }

    /**
     * Indicate that a space is taken by a car
     * @param ID The ID of the space
     * @param car The car that took the place
     */
    public takeSpace(ID: string, car: Car): void {
        const spot = this.parkingSpaces[ID];
        if (spot) {
            spot.isTaken = true;
            spot.isClaimed = false;
            spot.car = car;
            this.updateSpaces();
        }
    }

    /**
     * Indicates that a space is no longer taken
     * @param ID The ID of the space
     */
    public releaseSpace(ID: string): void {
        const spot = this.parkingSpaces[ID];
        if (spot) {
            spot.isTaken = false;
            spot.isClaimed = false;
            this.updateSpaces();
        }
    }

    /**
     * Updates the data of the spaces
     */
    protected updateSpaces(): void {
        this.broadcast("parkingSpaces", this.getSerializedSpaces());
    }

    /**
     * Serializes the current parking spaces
     * @returns The serialized spaces
     */
    protected getSerializedSpaces(): any {
        const spaces = {};
        Object.keys(this.parkingSpaces).forEach(ID => {
            spaces[ID] = {...this.parkingSpaces[ID], car: null};
        });
        return spaces;
    }

    // Bot management
    /**
     * Adds the given bot to the parking lot
     * @param bot The bot to add
     */
    public addBot(bot: Bot): void {
        if (this.bots.includes(bot)) return;

        this.broadcast("addBot", bot.getID());

        bot.setLot(this);
        bot.on("initBot", () => {
            // Share data
            bot.emit(
                "bots",
                this.bots.map(b => b.getID())
            );
            bot.emit("parkingSpaces", this.getSerializedSpaces());
            this.bots.forEach(b => {
                b.shareInitialDataWith(bot);
                bot.shareInitialDataWith(b);
            });
            this.entityManager.shareInitialDataWith(bot);

            // Set potion
            const spawnID = Object.keys(this.graph).find(ID =>
                this.graph[ID].tags.includes("botSpawn")
            );
            if (!spawnID) return;
            const path = this.searchGraph.getBotSpawnRoute(spawnID);
            if (!path) return;
            bot.followPath(path);
        });

        this.bots.push(bot);
    }

    /**
     * Removes the given bot from the parking lot
     * @param bot The bot to remove
     */
    public removeBot(bot: Bot): void {
        const index = this.bots.indexOf(bot);
        if (index === -1) return;

        this.bots.splice(index, 1);
        this.broadcast("removeBot", bot.getID());
    }

    /**
     * Sends a given message to all bots on the lot
     * @param message The message to send
     * @param args The arguments to the message
     */
    public broadcast(message: any, ...args: any[]): void {
        this.bots.forEach(conn => conn.emit(message, ...args));
    }
}
