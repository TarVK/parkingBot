export type IParkingNodeTag =
    | "spot" /** A valid parking spot */
    | "entrance" /** The car entrance to the parking lot */
    | "exit" /** The car exit of the parking lot */
    | "pedestrianEntrance" /** The pedestrian entrance to the parking lot */
    | "pedestrianExit" /** The pedestrian exit to the parking lot */;
