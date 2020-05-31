import {IForeignEntity} from "../../_types/IForeignEntity";
import {ParkingLot} from "./ParkingLot";
import {Bot} from "./Bot";

/**
 * Manages shared data of foreign entities (people, cars, etc), mostly intended for the simulation
 */
export class ForeignEntityManager {
    protected entities: IForeignEntity[] = [];
    protected lot: ParkingLot;

    /**
     * Creates a new entity manager
     * @param lot The parking lot this manager is for
     */
    public constructor(lot: ParkingLot) {
        this.lot = lot;
    }

    /**
     * Shares the data of this bot with the given bot
     * @param bot The bot to share the data with
     */
    public shareInitialDataWith(bot: Bot): void {
        bot.emit("foreignEntities", this.entities);
        bot.on("foreignEntities/add", entity => this.addEntity(entity));
        bot.on("foreignEntities/update", entity => this.updateEntity(entity));
        bot.on("foreignEntities/remove", entity => this.removeEntity(entity));
    }

    // Getters
    /**
     * Retrieves the entities
     * @returns The entities
     */
    public getEntities(): IForeignEntity[] {
        return this.entities;
    }

    // Setters
    /**
     * Adds an entity
     * @param entity The entity to add
     */
    public addEntity(entity: IForeignEntity): void {
        this.entities.push(entity);
        this.lot.broadcast("foreignEntities/add", entity);
    }

    /**
     * Updates the data of an entity
     * @param entity The entity to update
     */
    public updateEntity(entity: IForeignEntity): void {
        this.entities = this.entities.map(e => (e.ID == entity.ID ? entity : e));
        this.lot.broadcast("foreignEntities/update", entity);
    }

    /**
     * Removes an entity
     * @param entity The entity to remove
     */
    public removeEntity(entity: IForeignEntity): void {
        this.entities = this.entities.filter(e => e.ID != entity.ID);
        this.lot.broadcast("foreignEntities/remove", entity);
    }
}
