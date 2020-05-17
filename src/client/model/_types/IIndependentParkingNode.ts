import {IParkingNodeTag} from "../../../_types/graph/IParkingNodeTag";

export type IIndependentParkingNode = Readonly<{
    x: number;
    y: number;
    ID: string;
    tags: Readonly<IParkingNodeTag[]>;
}>;
