export type IParkingNodeTag =
    | "spot" /** A valid parking spot */
    | "entrance" /** The car entrance to the parking lot */
    | "exit" /** The car exit of the parking lot */
    | "pedestrianEntrance" /** The pedestrian entrance to the parking lot */
    | "pedestrianExit" /** The pedestrian exit to the parking lot */
    | "botQueue" /** The place bots can queue up while not used */;

export const parkingNodeTags = [
    "spot",
    "entrance",
    "exit",
    "pedestrianEntrance",
    "pedestrianExit",
    "botQueue",
] as const;
