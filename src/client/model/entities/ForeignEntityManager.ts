import {SocketModel} from "../socketUtils/SocketModel";
import {Field, IDataHook} from "model-react";
import {IForeignEntity} from "../../../_types/IForeignEntity";

export class ForeignEntityManager extends SocketModel {
    protected entities = new Field([] as IForeignEntity[]);

    /**
     * Creates a new foreign entity manager, which is directly connected to this client's socket.
     * Which essentially means there can only be 1 instance
     */
    public constructor() {
        super();

        // Setup all listeners for events from the API
        this.socket.on("foreignEntities", entities => {
            this.entities.set(entities);
        });
        this.socket.on("foreignEntities/add", entity =>
            this.entities.set([...this.entities.get(null), entity])
        );
        this.socket.on("foreignEntities/update", entity => {
            this.entities.set(
                this.entities.get(null).map(e => (e.ID == entity.ID ? entity : e))
            );
        });
        this.socket.on("foreignEntities/remove", entity =>
            this.entities.set(this.entities.get(null).filter(e => e.ID != entity.ID))
        );
    }

    // Getters
    /**
     * Retrieves the entities
     * @param hook The hook to subscribe to changes
     * @returns The entities
     */
    public getEntities(hook: IDataHook): IForeignEntity[] {
        return this.entities.get(hook);
    }

    // Setters
    /**
     * Adds an entity
     * @param entity The entity to add
     */
    public addEntity(entity: IForeignEntity): void {
        this.socket.emit("foreignEntities/add", entity);
    }

    /**
     * Updates the data of an entity
     * @param entity The entity to update
     */
    public updateEntity(entity: IForeignEntity): void {
        this.socket.emit("foreignEntities/update", entity);
    }

    /**
     * Removes an entity
     * @param entity The entity to remove
     */
    public removeEntity(entity: IForeignEntity): void {
        this.socket.emit("foreignEntities/remove", entity);
    }
}
