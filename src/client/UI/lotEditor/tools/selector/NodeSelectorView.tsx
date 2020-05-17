import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {TextField, ActionButton, PrimaryButton} from "@fluentui/react";
import {TagSelector} from "../../../../components/TagSelector";
import {useSyncState} from "../../../../services/useSyncState";
import {useTheme} from "../../../../services/useTheme";
import {NodeSelector} from "../../../../model/lotEditor/selectorTool/NodeSelector";
import {
    IParkingNodeTag,
    parkingNodeTags,
} from "../../../../../_types/graph/IParkingNodeTag";

export const NodeSelectorView: FC<{nodeSelector: NodeSelector}> = ({nodeSelector}) => {
    const theme = useTheme();
    const [h] = useDataHook();
    const [ID, setID] = useSyncState(nodeSelector.getID(h));
    if (nodeSelector.getNode(h) == null) return null;
    return (
        <Fragment>
            <TextField
                label="ID"
                value={ID}
                onChange={(e, v) => v != null && setID(v)}
                onBlur={() => {
                    if (!nodeSelector.setID(ID)) setID(nodeSelector.getID(null));
                }}
            />
            <TagSelector<IParkingNodeTag>
                label="Tags"
                options={parkingNodeTags}
                selected={nodeSelector.getTags(h)}
                onChange={tags => nodeSelector.setTags(tags)}
            />
            <div css={{display: "flex"}}>
                <TextField
                    css={{marginRight: theme.spacing.s1}}
                    label="x coordinate"
                    value={nodeSelector.getX(h) + ""}
                    type="number"
                    onChange={(e, v) => v != null && nodeSelector.setX(Number(v))}
                />
                <TextField
                    css={{marginLeft: theme.spacing.s1}}
                    label="y coordinate"
                    value={nodeSelector.getY(h) + ""}
                    type="number"
                    onChange={(e, v) => v != null && nodeSelector.setY(Number(v))}
                />
            </div>
            <PrimaryButton
                css={{float: "right", marginTop: theme.spacing.m}}
                onClick={() => nodeSelector.deleteNode()}>
                Delete
            </PrimaryButton>
        </Fragment>
    );
};
