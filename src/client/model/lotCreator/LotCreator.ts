import {Field} from "model-react";
import {IParkingNodeTag} from "../../../_types/graph/IParkingNodeTag";

const hideNodeTags = [
    "spot" as const,
    "entrance" as const,
    "exit" as const,
    "pedestrianEntrance" as const,
    "pedestrianExit" as const,
    "empty" as const,
];
const hideEdgeTags = [
    "carPath" as const,
    "pedestrianPath" as const,
    "botPath" as const,
    "empty" as const,
];
export class LotCreator {
    // Filters
    protected hideNodes = new Field([] as typeof hideNodeTags);
    protected hideEdges = new Field([] as typeof hideEdgeTags);

    // The graph
    protected;
}
