import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {SelectorTool} from "../../../../model/lotEditor/selectorTool/SelectorTool";
import {EdgeSelectorView} from "./EdgeSelectorView";
import {NodeSelectorView} from "./NodeSelectorView";

export const SelectorToolView: FC<{selector: SelectorTool}> = ({selector}) => {
    return (
        <Fragment>
            <EdgeSelectorView edgeSelector={selector.getEdgeSelector()} />
            <NodeSelectorView nodeSelector={selector.getNodeSelector()} />
        </Fragment>
    );
};
