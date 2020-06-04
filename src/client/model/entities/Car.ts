import {ForeignEntity} from "./ForeignEntity";

export class Car extends ForeignEntity {
    /**
     * Creates a new car
     * @param preferences The preferences of the customer
     * @param pos The initial position of the car
     * @param rotation The initial rotation of the car
     */
    public constructor(
        preferences: {walkCost: number; turnCost: number},
        pos?: {x: number; y: number},
        rotation?: number
    );

    /**
     * Creates a controller for an existing car
     * @param ID The ID of the car to control
     */
    public constructor(ID: string);

    public constructor(
        preferences: {walkCost: number; turnCost: number} | string,
        pos: {x: number; y: number} = {x: -Infinity, y: -Infinity},
        rotation: number = 0
    ) {
        if (typeof preferences == "string") {
            super(preferences);
            this.update({...this.get(), helped: true} as any);
        } else {
            super("car", {width: 3, height: 2}, pos, rotation);
            this.update({...this.get(), type: "car", preferences, helped: true} as any);
        }
    }
}
