import {ForeignEntity} from "./ForeignEntity";

export class Car extends ForeignEntity {
    /**
     * Creates a new car
     * @param pos The initial position of the car
     * @param rotation The initial rotation of the car
     */
    public constructor(pos: {x: number; y: number} = {x: 0, y: 0}, rotation: number = 0) {
        super("car", {width: 3, height: 2}, pos, rotation);
    }
}
