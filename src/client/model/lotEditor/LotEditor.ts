import {IParkingGraph} from "../../../_types/graph/IParkingGraph";
import {GraphFilter} from "../GraphFilter";

export class LotEditor extends GraphFilter {
    /**
     * Creates a new lot creator
     * @param graph The lot to start with
     */
    public constructor(graph?: IParkingGraph) {
        super(graph);
    }
}
