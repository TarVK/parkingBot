export type IBotPosition = {
    graph: null | {
        start: string;
        end: string;
        per: number;
    };
    physical: {
        x: number;
        y: number;
        rotation: number;
    };
};
