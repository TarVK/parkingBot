export type IParkingEdgeTag =
    | "carPath" /** A road path */
    | "pedestrianPath" /** A pedestrian path */
    | "botPath" /** A pedestrian parking bot path */;

export const parkingEdgeTags = ["carPath", "pedestrianPath", "botPath"] as const;
