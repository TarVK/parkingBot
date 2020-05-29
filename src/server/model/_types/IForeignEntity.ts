export type IForeignEntity = {
    ID: string;
    pos: {
        x: number;
        y: number;
    };
    orientation: number; // 0 == facing right
    size: {
        width: number;
        height: number;
    };
};
