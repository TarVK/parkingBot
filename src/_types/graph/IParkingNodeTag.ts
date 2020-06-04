export type IParkingNodeTag =
    | "spot" /** A valid parking spot */
    | "entrance" /** The car entrance to the parking lot */
    | "exit" /** The car exit of the parking lot */
    | "pedestrianEntrance" /** The pedestrian entrance to the parking lot */
    | "pedestrianExit" /** The pedestrian exit to the parking lot */
    | "botQueue" /** The place bots can queue up while not used */
    | "botSpawn" /** A place that a bot can 'spawn' at, only for simulation */;

export const parkingNodeTags = [
    "spot",
    "entrance",
    "exit",
    "pedestrianEntrance",
    "pedestrianExit",
    "botQueue",
    "botSpawn",
] as const;
