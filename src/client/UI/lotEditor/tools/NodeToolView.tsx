import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {TagSelector} from "../../../components/TagSelector";
import {NodeTool} from "../../../model/lotEditor/NodeTool";
import {IParkingNodeTag, parkingNodeTags} from "../../../../_types/graph/IParkingNodeTag";
import {TextField} from "@fluentui/react";

export const NodeToolView: FC<{nodeTool: NodeTool}> = ({nodeTool}) => {
    const [h] = useDataHook();
    return (
        <Fragment>
            <TextField
                label="Position precision"
                type="number"
                value={nodeTool.getPositionPrecision(h) + ""}
                onChange={(e, v) => v && nodeTool.setPositionPrecision(Number(v))}
            />
            <TagSelector<IParkingNodeTag>
                label="Tags"
                selected={nodeTool.getSelectedTags(h)}
                options={parkingNodeTags}
                onChange={tags => nodeTool.setSelectedTags(tags)}
            />
        </Fragment>
    );
};
