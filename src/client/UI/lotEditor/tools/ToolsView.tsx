import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {LotEditor} from "../../../model/lotEditor/LotEditor";
import {useDataHook} from "model-react";
import {Pivot, PivotItem} from "@fluentui/react";
import {useTheme} from "../../../services/useTheme";
import {SelectorToolView} from "./selector/SelectorToolView";
import {EdgeToolView} from "./EdgeToolView";
import {NodeToolView} from "./NodeToolView";

export const ToolsView: FC<{editor: LotEditor}> = ({editor}) => {
    const theme = useTheme();
    const [h] = useDataHook();
    const selectedToolName = editor.getSelectedToolName(h);
    return (
        <Fragment>
            <Pivot
                aria-label="The selected tool"
                selectedKey={selectedToolName}
                onLinkClick={t => t && editor.selectTool(t.props.itemKey as any)}>
                <PivotItem headerText="Selector" itemKey="selector">
                    <div css={{marginTop: theme.spacing.m}}>
                        <SelectorToolView selector={editor.getSelectorTool()} />
                    </div>
                </PivotItem>
                <PivotItem headerText="Node" itemKey="nodeCreator">
                    <div css={{marginTop: theme.spacing.m}}>
                        <NodeToolView nodeTool={editor.getNodeTool()} />
                    </div>
                </PivotItem>
                <PivotItem headerText="Edge" itemKey="edgeCreator">
                    <div css={{marginTop: theme.spacing.m}}>
                        <EdgeToolView edgeTool={editor.getEdgeTool()} />
                    </div>
                </PivotItem>
            </Pivot>
        </Fragment>
    );
};
