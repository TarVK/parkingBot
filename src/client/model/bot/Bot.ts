import {SocketModel} from "../socketUtils/SocketModel";
import {IRoute} from "../_types/IRoute";
import {getSocket} from "../../AsyncSocketClient";
import {SocketField} from "../socketUtils/SocketField";
import {IParkingSpaces} from "../_types/IParkingSpaces";
import {IDataHook} from "model-react";

export class Bot extends SocketModel {
    protected parkingSpaces = new SocketField<IParkingSpaces | null>(
        "parkingSpaces",
        null
    );

    /**
     * Creates a new bot
     */
    private constructor() {
        super();
    }

    // Getters
    /**
     * Retrieves the parking spaces of the lot
     * @param hook The hook to subscribe to changes
     * @returns The parking spaces
     */
    public getParkingSpaces(hook: IDataHook): IParkingSpaces | null {
        return this.parkingSpaces.get(hook);
    }

    // Functionality

    /**
     * Finds and claims the best parking spot based on the given preferences
     * @param walkCost The walk cost
     * @param turnCost The turn cost
     * @returns The routes to and from a parking spot, or undefined if none is available
     */
    public async findAndClaimSpot(
        walkCost: number,
        turnCost: number
    ): Promise<IRoute | undefined> {
        do {
            const paths = (await this.socket.emitAsync("getSpot", {
                walkCost,
                turnCost,
            })) as IRoute;
            if (!paths) return undefined;
            const parkingSpotID = paths[1][0];
            const claimedSpot = this.claimSpot(parkingSpotID);
            if (claimedSpot) return paths;
        } while (true);
    }

    /**
     * Finds the best parking spot based on the given preferences
     * @param walkCost The walk cost
     * @param turnCost The turn cost
     * @returns The routes to and from a parking spot, or undefined if none is available
     */
    protected async findSpot(
        walkCost: number,
        turnCost: number
    ): Promise<IRoute | undefined> {
        return this.socket.emitAsync("getSpot", {walkCost, turnCost});
    }

    /**
     * Claims a parking spot
     * @param spotID The ID of the spot to claim
     * @returns Whether the spot was successfully claimed (must be available)
     */
    protected async claimSpot(spotID: string): Promise<boolean> {
        return this.socket.emitAsync("claimSpace", spotID);
    }

    // Static methods
    /**
     * Creates a new bot and connects it to the lot
     * @returns A new parking bot
     */
    public static async create(): Promise<Bot> {
        // Currently only 1 bot can be created, since it's identified using the socket
        const bot = new Bot();
        await getSocket().emitAsync("addBot");
        return bot;
    }
}
