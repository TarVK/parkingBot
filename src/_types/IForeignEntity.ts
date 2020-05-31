export type IForeignEntity = {
    ID: string;
    type: string;
    pos: {
        x: number;
        y: number;
    };
    rotation: number; // 0 == facing right
    size: {
        width: number;
        height: number;
    };
};
