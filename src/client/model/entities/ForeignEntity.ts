import {SocketModel} from "../socketUtils/SocketModel";
import {uuid} from "uuidv4";
import {IDataHook, getAsync} from "model-react";
import {IForeignEntity, ICarEntity} from "../../../_types/IForeignEntity";
import {Application} from "../Application";
import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";
import {getMinimumDistance} from "./getMinDistance";
import {Bot} from "../bot/Bot";

/**
 * A class to represent a foreign entity, providing simple methods to guide it
 */
export class ForeignEntity extends SocketModel {
    protected ID = uuid();
    protected m = Application.getEntityManager();
    protected me: IForeignEntity;
    protected randomOffset: {x: number; y: number};
    protected speed = 3; // Unit=Meters/Second
    protected minDistance = 2.4; // Unit=Meters
    protected unloadListener = () => this.destroy();
    protected ignoreEntities: string[] = [];

    /**
     * Creates a new foreign entity
     * @param type The type of entity to create
     * @param size The size of the entity
     * @param pos The position of the entity
     * @param orientation The orientation of the entity
     * @param randomOffset The random offset the entity should have on the graph
     */
    public constructor(
        type: string,
        size: {width: number; height: number},
        pos?: {x: number; y: number},
        orientation?: number,
        randomOffset?: {x: number; y: number}
    );

    /**
     * Creates a controller for a foreign entity
     * @param ID the ID of the entity to control
     */
    public constructor(ID: string);

    /**
     * Creates a new foreign entity
     * @param type The type of entity to create
     * @param size The size of the entity
     * @param pos The position of the entity
     * @param orientation The orientation of the entity
     * @param randomOffset The random offset the entity should have on the graph
     */
    public constructor(
        type: string,
        size?: {width: number; height: number},
        pos: {x: number; y: number} = {x: -Infinity, y: -Infinity},
        orientation: number = 0,
        randomOffset: {x: number; y: number} = {x: 0, y: 0}
    ) {
        super();

        if (size) {
            this.randomOffset = randomOffset;
            this.me = {
                ID: this.ID,
                type,
                size,
                pos: {
                    x: pos.x + randomOffset.x,
                    y: pos.y + randomOffset.y,
                },
                rotation: orientation,
            };
            this.m.addEntity(this.me);
        } else {
            // console.log("Detect");
            this.randomOffset = {x: 0, y: 0};
            const ent = this.m.getEntities(null).find(e => e.ID == type);
            if (!ent) throw Error(`No entity with ID ${type} exists`);
            this.me = ent;
            this.ID = type;
        }

        this.ignoreEntities.push(this.ID);
        window.addEventListener("beforeunload", this.unloadListener);
    }

    // Getters
    /**
     * Retrieves the ID of this entity
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the data of the entity as known by the server
     * @param hook The hook to subscribe to changes
     * @returns The data
     */
    public getLive(hook: IDataHook): IForeignEntity | null {
        return this.m.getEntities(hook).find(e => e.ID == this.ID) || null;
    }

    /**
     * Retrieves the data of the entity as last specified by us
     * @returns The data
     */
    public get(): IForeignEntity {
        return this.me;
    }

    /**
     * Retrieves the graph of the parking lot
     * @param hook The hook to subscribe to changes
     * @returns The graph of the parking lot
     */
    protected getGraph(hook: IDataHook): INormalizedParkingGraph | null {
        return Application.getParkingGraph(hook) || null;
    }

    // Setters
    /**
     * Sets the new position of the entity
     * @param pos The new position
     */
    public setPosition(pos: {x: number; y: number}): void {
        pos = {
            x: pos.x + this.randomOffset.x,
            y: pos.y + this.randomOffset.y,
        };
        this.update({
            ...this.get(),
            pos,
        });
    }

    /**
     * Sets the new rotation of the entity
     * @param rotation The rotation in radian (0 is right)
     */
    public setRotation(rotation: number): void {
        this.update({...this.get(), rotation});
    }

    /**
     * Updates the data of this entity
     * @param newData The new data
     */
    protected update(newData: IForeignEntity): void {
        this.me = newData;
        this.m.updateEntity(newData);
    }

    // Functions
    /**
     * Follows the specified path
     * @param path The path to follow
     * @returns A promise that resolves when the destination is reached
     */
    public async followPath(path: string[]): Promise<void> {
        const remainingPath = [...path];
        let nodeID = remainingPath.shift();
        let nextNodeID;
        while (nodeID && (nextNodeID = remainingPath.shift())) {
            await this.moveToNode(nodeID, nextNodeID);
            nodeID = nextNodeID;
        }
    }

    /**
     * Checks whether this entity can collide with another
     * @param e THe entity to check
     * @returns Whether the entities can collide
     */
    protected canCollideWithEntity(e: IForeignEntity | Bot): boolean {
        return !("type" in e);
    }

    /**
     * Moves from the start node to the end node
     * @param start The ID of the node to start at
     * @param end  The ID of the node to end at
     * @returns A promise that resolves when the end is reached
     */
    public async moveToNode(start: string, end: string): Promise<void> {
        const graph = await getAsync(h => this.getGraph(h));
        if (!graph) return;
        const startNode = graph[start];
        const endNode = graph[end];
        const dx = endNode.x - startNode.x,
            dy = endNode.y - startNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const getPos = (per: number) => ({
            pos: {
                x: startNode.x * (1 - per) + endNode.x * per,
                y: startNode.y * (1 - per) + endNode.y * per,
            },
            rotation: Math.atan2(dy, dx),
        });
        const setPos = async (per: number, incr: number) => {
            const newPer = Math.min(per + incr, 1);
            const pos = getPos(newPer);
            const curPos = this.me.pos;

            // Make sure there won't be a collision
            const curDist = await getMinimumDistance(curPos, e =>
                this.canCollideWithEntity(e)
            );
            const newDist = await getMinimumDistance(pos.pos, e =>
                this.canCollideWithEntity(e)
            );
            const noCollide = newDist > this.minDistance || newDist > curDist;
            if (!noCollide) return per;

            // Move to the position
            this.setPosition(pos.pos);
            this.setRotation(pos.rotation);
            return newPer;
        };

        // Set initial pos, and create an interval that keeps incrementing till the end is reached
        return new Promise((res, rej) => {
            let frequency = 20; // Unit=Times/Second

            const stepMeters = this.speed / frequency;
            const stepPer = stepMeters / distance;
            let per = stepPer;

            setPos(per, 0);
            let prevFinished = true; // Keep track of whether the previous update was processed
            const ID = setInterval(async () => {
                if (!prevFinished) return;
                prevFinished = false;
                per = await setPos(per, stepPer);
                if (per == 1) {
                    clearInterval(ID);
                    res();
                }
                prevFinished = true;
            }, 1000 / frequency);
        });
    }

    /**
     * Disposes of this entity
     */
    public destroy() {
        this.m.removeEntity(this.get());
        window.removeEventListener("beforeunload", this.unloadListener);
    }
}
