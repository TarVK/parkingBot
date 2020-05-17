import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {EdgeTool} from "../../../model/lotEditor/EdgeTool";
import {Toggle} from "@fluentui/react";
import {TagSelector} from "../../../components/TagSelector";
import {IParkingEdgeTag, parkingEdgeTags} from "../../../../_types/graph/IParkingEdgeTag";

export const EdgeToolView: FC<{edgeTool: EdgeTool}> = ({edgeTool}) => {
    const [h] = useDataHook();
    return (
        <Fragment>
            <Toggle
                label="Two way edge"
                checked={edgeTool.getIsTwoWayEdge(h)}
                onChange={(e, c) => c != null && edgeTool.setTwoWayEdge(c)}
            />
            <TagSelector<IParkingEdgeTag>
                label="Tags"
                selected={edgeTool.getSelectedTags(h)}
                options={parkingEdgeTags}
                onChange={tags => edgeTool.setSelectedTags(tags)}
            />
        </Fragment>
    );
};
