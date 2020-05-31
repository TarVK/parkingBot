import {SocketModel} from "../socketUtils/SocketModel";
import {uuid} from "uuidv4";
import {IDataHook, getAsync} from "model-react";
import {IForeignEntity} from "../../../_types/IForeignEntity";
import {Application} from "../Application";
import {INormalizedParkingGraph} from "../../../_types/graph/IParkingGraph";
import {getMinimumDistance} from "./getMinDistance";

/**
 * A class to represent a foreign entity, providing simple methods to guide it
 */
export class ForeignEntity extends SocketModel {
    protected ID = uuid();
    protected m = Application.getEntityManager();
    protected me: IForeignEntity;
    protected randomOffset: {x: number; y: number};
    protected speed = 3; // Unit=Meters/Second
    protected minDistance = 2; // Unit=Meters
    protected unloadListener = () => this.destroy();
    protected ignoreEntities: string[] = [];

    /**
     * Creates a new foreign entity
     */
    public constructor(
        type: string,
        size: {width: number; height: number},
        pos: {x: number; y: number} = {x: 0, y: 0},
        orientation: number = 0,
        randomOffset: {x: number; y: number} = {x: 0, y: 0}
    ) {
        super();

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
        window.addEventListener("beforeunload", this.unloadListener);
        this.m.addEntity(this.me);
        this.ignoreEntities.push(this.ID);
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
        this.me.pos = pos;
        this.m.updateEntity({
            ...this.get(),
            pos,
        });
    }

    /**
     * Sets the new rotation of the entity
     * @param rotation The rotation in radian (0 is right)
     */
    public setRotation(rotation: number): void {
        this.me.rotation = rotation;
        this.m.updateEntity({...this.get(), rotation});
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
            const curDist = await getMinimumDistance(
                curPos,
                e => !("type" in e) || !this.ignoreEntities.includes(e.ID)
            );
            const newDist = await getMinimumDistance(
                pos.pos,
                e => !("type" in e) || !this.ignoreEntities.includes(e.ID)
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
