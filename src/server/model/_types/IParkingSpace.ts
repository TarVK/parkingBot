import {Car} from "../Car";

export type IParkingSpace = {
    ID: string;
    isTaken: boolean;
    isClaimed: boolean;
    car: null | Car;
};
