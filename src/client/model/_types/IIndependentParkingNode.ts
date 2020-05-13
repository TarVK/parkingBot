import {IParkingNodeTag} from "../../../_types/graph/IParkingNodeTag";

export type IIndependentParkingNode = {
    x: number;
    y: number;
    ID: string;
    tags: Readonly<IParkingNodeTag[]>;
};
