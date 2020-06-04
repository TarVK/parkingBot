import {SocketModel} from "../socketUtils/SocketModel";
import {IRoute} from "../../../_types/IRoute";
import {getSocket} from "../../AsyncSocketClient";
import {SocketField} from "../socketUtils/SocketField";
import {IParkingSpaces} from "../_types/IParkingSpaces";
import {IDataHook, DataLoader, getAsync, Field} from "model-react";
import {IBotPosition} from "../../../_types/IBotPosition";
import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";
import {wait} from "../../../services/wait";
import {IForeignEntity} from "../../../_types/IForeignEntity";
import {Application} from "../Application";
import {getMinimumDistance, getDistance} from "../entities/getMinDistance";

const speed = 3; // Unit=Meters/Second
const maxFollowDist = 7; // Unit=Meters
const minDistance = 2.5; // Unit=Meters

export class Bot extends SocketModel {
    protected ID: string;
    protected controllable: boolean;
    protected targetID = new Field(null as null | string);
    protected busy = new Field(false);
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
            physical: {x: -1e6, y: -1e6, rotation: 0},
        });
        if (controllable) {
            this.socket.emit("initBot");
            this.socket.on(`bot-${this.ID}/followPath`, async path => {
                this.busy.set(true);
                await this.followPath(path, false, true);
                this.busy.set(false);
            });
        }
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

    /**
     * Sets the target to guide
     * @param ID The ID of the target
     */
    public setTarget(ID: string | null): void {
        this.targetID.set(ID);
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

    /**
     * Retrieves the target entity that this bot should wait for (they should follow it)
     * @param hook The hook to subscribe to changes
     * @returns The targeted entity if available
     */
    public getTarget(hook: IDataHook): null | IForeignEntity {
        const targetID = this.targetID.get(hook);
        if (!targetID) return null;
        const target =
            Application.getEntityManager()
                .getEntities(hook)
                .find(e => e.ID == targetID) || null;
        if (!target && hook && "markIsLoading" in hook) hook.markIsLoading?.();
        return target;
    }

    /**
     * Checks whether the bot is currently busy
     * @param hook The hook to subscribe to changes
     * @returns Whether the bot is busy
     */
    public isBusy(hook: IDataHook): boolean {
        return this.busy.get(hook);
    }

    // Functionality
    /**
     * Follows the specified path
     * @param path The path to follow
     * @param allowLastNoFollow Whether it is allowed that the target doesn't follow the last node
     * @param slowStartup Wait some time before starting driving again after being blocked
     * @returns A promise that resolves when the destination is reached
     */
    protected async followPath(
        path: string[],
        allowLastNoFollow: boolean = true,
        slowStartup: boolean = false
    ): Promise<void> {
        const remainingPath = [...path];
        let nodeID = remainingPath.shift();
        let nextNodeID;
        while (nodeID && (nextNodeID = remainingPath.shift())) {
            await this.moveToNode(
                nodeID,
                nextNodeID,
                allowLastNoFollow && remainingPath.length == 0,
                slowStartup
            );
            nodeID = nextNodeID;
        }
    }

    /**
     * Checks whether this entity can collide with another
     * @param e THe entity to check
     * @returns Whether the entities can collide
     */
    protected canCollideWithEntity(e: IForeignEntity | Bot): boolean {
        return e != this && !("type" in e);
    }

    /**
     * Moves from the start node to the end node
     * @param start The ID of the node to start at
     * @param end  The ID of the node to end at
     * @param allowNoFollow Whether it is allowed that the car doesn't follow
     * @param slowStartup Wait some time before starting driving again after being blocked
     * @returns A promise that resolves when the end is reached
     */
    protected async moveToNode(
        start: string,
        end: string,
        allowNoFollow = false,
        slowStartup: boolean = false
    ): Promise<void> {
        const graph = await getAsync(h => this.graph.get(h));
        if (!graph) return;
        const startNode = graph[start];
        const endNode = graph[end];
        const dx = endNode.x - startNode.x,
            dy = endNode.y - startNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const getPos = (per: number) => ({
            x: startNode.x * (1 - per) + endNode.x * per,
            y: startNode.y * (1 - per) + endNode.y * per,
            rotation: Math.atan2(dy, dx),
        });

        // Sets the position, considering that it shouldn't get too far ahead or run into others
        const setPos = async (prevPer: number, per: number, incr: number) => {
            const newPer = Math.min(per + incr, 1);
            const pos = getPos(newPer);
            const curPos = this.getPosition(null).physical;

            // Make sure the car is following
            const target = await getAsync(h => this.getTarget(h));
            const newTargetDist = !target ? 0 : getDistance(pos, target.pos);
            const oldTargetDist = !target ? 0 : getDistance(curPos, target.pos);

            const inRange =
                newTargetDist < maxFollowDist || newTargetDist < oldTargetDist;
            if (!inRange && !allowNoFollow) return per;

            // Make sure there won't be a collision
            const curDist = await getMinimumDistance(curPos, e =>
                this.canCollideWithEntity(e)
            );
            const newDist = await getMinimumDistance(pos, e =>
                this.canCollideWithEntity(e)
            );
            const noCollide = newDist > minDistance || newDist > curDist;
            if (!noCollide) return per;

            // Move to the position
            this.setPosition({
                physical: pos,
                graph: {
                    start,
                    end,
                    per,
                },
            });

            // If there was no movement in the previous cycle, and we want a slow startup, add a delay
            if (slowStartup && prevPer == per) await wait(1000);
            return newPer;
        };

        // Set initial pos, and create an interval that keeps incrementing till the end is reached
        return new Promise(async (res, rej) => {
            let frequency = 20; // Unit=Times/Second

            const stepMeters = speed / frequency;
            const stepPer = stepMeters / distance;
            let per = 0;
            let prevPer = 0;
            per = await setPos(-1, per, stepPer);

            let prevFinished = true; // Keep track of whether the previous update was processed
            const ID = setInterval(async () => {
                if (!prevFinished) return;
                prevFinished = false;
                const newPer = await setPos(prevPer, per, stepPer);
                prevPer = per;
                per = newPer;

                if (per == 1) {
                    clearInterval(ID);
                    res();
                }
                prevFinished = true;
            }, 1000 / frequency);
        });
    }

    /**
     * Guides an entity to a spot
     * @param targetID The entity to guide
     * @param route The path to guide the target over
     */
    public async guideToSpot(targetID: string, route: IRoute): Promise<void> {
        this.busy.set(true);

        this.setTarget(targetID);
        await this.followPath(route.bot.path[0]);
        this.setTarget(null);

        await wait(3000);

        await this.socket.emitAsync("takeSpace", route.car[3][0]);
        await this.followPath(route.bot.path[1], false, true);

        this.busy.set(false);
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
