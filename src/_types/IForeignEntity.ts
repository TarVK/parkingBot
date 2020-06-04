export type IForeignEntity = IForeignEntityBase | ICarEntity;

export type ICarEntity = {
    type: "car";
    preferences: {walkCost: number; turnCost: number};
    helped: boolean;
} & IForeignEntityBase;

export type IForeignEntityBase = {
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
