import {IIndependentParkingEdge} from "../../model/_types/IIndependentParkingEdge";
import {IIndependentParkingNode} from "../../model/_types/IIndependentParkingNode";

/**
 * A handler for graph clicks
 */
export type IGraphClickHandler = (
    pos: {x: number; y: number},
    items: (IIndependentParkingEdge | IIndependentParkingNode)[]
) => void;
