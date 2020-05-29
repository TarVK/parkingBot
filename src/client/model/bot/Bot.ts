import {SocketModel} from "../socketUtils/SocketModel";
import {IRoute} from "../../../_types/IRoute";
import {getSocket} from "../../AsyncSocketClient";
import {SocketField} from "../socketUtils/SocketField";
import {IParkingSpaces} from "../_types/IParkingSpaces";
import {IDataHook, DataLoader, getAsync} from "model-react";
import {IBotPosition} from "../../../_types/IBotPosition";
import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";
import {wait} from "../../../services/wait";

const speed = 3; // Unit=Meters/Second
export class Bot extends SocketModel {
    protected ID: string;
    protected controllable: boolean;
    protected graph = new DataLoader<INormalizedParkingGraph | undefined>(
        () => this.socket.emitAsync("getGraph"),
        undefined
    );
    protected parkingSpaces = new SocketField<IParkingSpaces | null>(
        "parkingSpaces",
        null
    );
    protected position: SocketField<IBotPosition>;

    /**
     * Creates a new bot
     * @param ID The ID of the bot
     * @param controllable Whether this bot is created by us, and thus controllable by us
     */
    private constructor(ID: string, controllable: boolean) {
        super();
        this.ID = ID;
        this.controllable = controllable;
        this.position = new SocketField<IBotPosition>(`bot-${this.ID}/pos`, {
            graph: null,
            physical: {x: 0, y: 0, rotation: 0},
        });
    }

    /**
     * Cleans up this bot
     */
    public destroy() {
        this.position.destroy();
        this.parkingSpaces.destroy();
    }

    // Setters
    /**
     * Sets the position of the bot in the parking lot
     * @param position The bot's position
     */
    public setPosition(position: IBotPosition): void {
        this.position.set(position);
    }

    // Getters
    /**
     * Retrieves the ID of this bot
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the parking spaces of the lot
     * @param hook The hook to subscribe to changes
     * @returns The parking spaces
     */
    public getParkingSpaces(hook: IDataHook): IParkingSpaces | null {
        return this.parkingSpaces.get(hook);
    }

    /**
     * Retrieves the position of this bot
     * @param hook The hook to subscribe to changes
     * @returns The position of this bot
     */
    public getPosition(hook: IDataHook): IBotPosition {
        return this.position.get(hook);
    }

    // Functionality
    /**
     * Follows the specified path
     * @param path The path to follow
     * @returns A promise that resolves when the destination is reached
     */
    protected async followPath(path: string[]): Promise<void> {
        const remainingPath = [...path];
        let nodeID = remainingPath.shift();
        let nextNodeID;
        while (nodeID && (nextNodeID = remainingPath.shift())) {
            await this.moveToNode(nodeID, nextNodeID);
            nodeID = nextNodeID;
        }
    }

    /**
     * Moves from the start node to the end node
     * @param start The ID of the node to start at
     * @param end  The ID of the node to end at
     * @returns A promise that resolves when the end is reached
     */
    protected async moveToNode(start: string, end: string): Promise<void> {
        const graph = await getAsync(h => this.graph.get(h));
        if (!graph) return;
        const startNode = graph[start];
        const endNode = graph[end];
        const dx = endNode.x - startNode.x,
            dy = endNode.y - startNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const getLoc = (per: number) => ({
            x: startNode.x * (1 - per) + endNode.x * per,
            y: startNode.y * (1 - per) + endNode.y * per,
            rotation: Math.atan2(dy, dx),
        });
        const setPos = (per: number) => {
            this.setPosition({
                physical: getLoc(per),
                graph: {
                    start,
                    end,
                    per,
                },
            });
        };

        // Set initial pos, and create an interval that keeps incrementing till the end is reached
        return new Promise((res, rej) => {
            let frequency = 20; // Unit=Times/Second

            const stepMeters = speed / frequency;
            const stepPer = stepMeters / distance;
            let per = stepPer;

            setPos(per);
            const ID = setInterval(() => {
                per += stepPer;
                if (per >= 1) {
                    per = 1;
                    clearInterval(ID);
                    res();
                }
                setPos(per);
            }, 1000 / frequency);
        });
    }

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
            const route = (await this.socket.emitAsync("getSpot", {
                walkCost,
                turnCost,
            })) as IRoute;
            if (!route) return undefined;
            const parkingSpotID = route.car[1][0];
            const claimedSpot = this.claimSpot(parkingSpotID);
            if (claimedSpot) {
                this.followPath(route.bot.path[0]).then(async () => {
                    console.log(route.bot);
                    await wait(3000);
                    this.followPath(route.bot.path[1]);
                });
                return route;
            }
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
     * @param ID The ID of the bot to add, or none if the bot should be controllable by us
     * @returns A new parking bot
     */
    public static async create(ID?: string): Promise<Bot> {
        const controllable = ID == null;
        if (!ID) ID = await getSocket().emitAsync("addBot");
        return new Bot(ID as string, controllable);
    }
}
