export type ISearchEdge = {
    end: string;
    weight: number;
    isPedestrianPath: boolean; // Whether this is a path taken by foot
    isCarTurn: boolean; // Whether this is a turn edge that should be taken by a car (which is more difficult)
};
