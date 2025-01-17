import {ForeignEntity} from "./ForeignEntity";
import {IForeignEntity} from "../../../_types/IForeignEntity";
import {Bot} from "../bot/Bot";

const randomOffset = 0.6;
export class Person extends ForeignEntity {
    /**
     * Creates a new person
     * @param pos The initial position of the person
     * @param rotation The initial rotation of the person
     */
    public constructor(
        pos: {x: number; y: number} = {x: -Infinity, y: -Infinity},
        rotation: number = 0
    ) {
        super("person", {width: 0.5, height: 0.5}, pos, rotation, {
            x: Math.random() * randomOffset * 2 - randomOffset,
            y: Math.random() * randomOffset * 2 - randomOffset,
        });
        this.speed = 2 + Math.random() * 0.1;
        this.minDistance = 0.5;
    }

    /** @override */
    protected canCollideWithEntity(e: IForeignEntity | Bot): boolean {
        return super.canCollideWithEntity(e) && (!("type" in e) || e.type != "person");
    }

    /**
     * Adds an entity to the list that this person may come close to
     * @param ID The ID of the entity to add
     */
    public addIgnoreEntity(ID: string): void {
        this.ignoreEntities.push(ID);
    }
}
