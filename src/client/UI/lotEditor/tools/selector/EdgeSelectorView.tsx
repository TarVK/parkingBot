import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {TextField, PrimaryButton} from "@fluentui/react";
import {EdgeSelector} from "../../../../model/lotEditor/selectorTool/EdgeSelector";
import {
    parkingEdgeTags,
    IParkingEdgeTag,
} from "../../../../../_types/graph/IParkingEdgeTag";
import {TagSelector} from "../../../../components/TagSelector";
import {useSyncState} from "../../../../services/useSyncState";
import {useTheme} from "../../../../services/useTheme";

export const EdgeSelectorView: FC<{edgeSelector: EdgeSelector}> = ({edgeSelector}) => {
    const theme = useTheme();
    const [h] = useDataHook();
    const [start, setStart] = useSyncState(edgeSelector.getStart(h));
    const [end, setEnd] = useSyncState(edgeSelector.getEnd(h));

    if (edgeSelector.getEdge(h) == null) return null;
    return (
        <Fragment>
            <div css={{display: "flex"}}>
                <TextField
                    css={{marginRight: theme.spacing.s1}}
                    label="start ID"
                    value={start}
                    onChange={(e, v) => v != null && setStart(v)}
                    onBlur={() => {
                        if (!edgeSelector.setStart(start))
                            setStart(edgeSelector.getStart(null));
                    }}
                />
                <TextField
                    css={{marginLeft: theme.spacing.s1}}
                    label="end ID"
                    value={end}
                    onChange={(e, v) => v != null && setEnd(v)}
                    onBlur={() => {
                        if (!edgeSelector.setEnd(end)) setEnd(edgeSelector.getEnd(null));
                    }}
                />
            </div>
            <TagSelector<IParkingEdgeTag>
                label="Tags"
                options={parkingEdgeTags}
                selected={edgeSelector.getTags(h)}
                onChange={tags => edgeSelector.setTags(tags)}
            />
            <PrimaryButton
                css={{float: "right", marginTop: theme.spacing.m}}
                onClick={() => edgeSelector.deleteEdge()}>
                Delete
            </PrimaryButton>
        </Fragment>
    );
};
