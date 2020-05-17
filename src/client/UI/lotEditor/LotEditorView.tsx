import {jsx} from "@emotion/core";
import {FC, useState, useEffect, Fragment, useRef} from "react";
import {Application} from "../../model/Application";
import {getAsync, useDataHook} from "model-react";
import {FilterableGraphView} from "../FilterableGraphView";
import {FilterableGraphFilters} from "../FilterableGraphFilters";
import {GraphClickHandler} from "../GraphClickHandler";
import {useTheme} from "../../services/useTheme";
import {StageContainer} from "../StageContainer";
import {LotEditor} from "../../model/lotEditor/LotEditor";
import {ToolsView} from "./tools/ToolsView";
import {IIndependentParkingEdge} from "../../model/_types/IIndependentParkingEdge";
import {IIndependentParkingNode} from "../../model/_types/IIndependentParkingNode";
import {SelectorTool} from "../../model/lotEditor/selectorTool/SelectorTool";
import {EdgeTool} from "../../model/lotEditor/EdgeTool";
import {NodeTool} from "../../model/lotEditor/NodeTool";
import {Circle} from "../../components/pixi/Circle";
import {Line} from "../../components/pixi/Line";

/**
 * Handles clicking on the graph
 * @param down The data of when the mouse was pressed down
 * @param up The data of when the mouse was released
 * @param editor The editor that was clicked in
 */
function onGraphClick(
    down: {
        pos: {x: number; y: number};
        items: (IIndependentParkingEdge | IIndependentParkingNode)[];
    },
    up: {
        pos: {x: number; y: number};
        items: (IIndependentParkingEdge | IIndependentParkingNode)[];
    },
    editor: LotEditor
) {
    const tool = editor.getSelectedTool(null);
    if (tool instanceof SelectorTool) {
        // Cycle through the items within range when clicked
        const currentlySelected = tool.getSelected(null);
        const currentlySelectedIndex = currentlySelected
            ? up.items.findIndex(
                  item =>
                      ("ID" in item &&
                          "ID" in currentlySelected &&
                          item.ID == currentlySelected.ID) ||
                      ("start" in item &&
                          "start" in currentlySelected &&
                          item.start.ID == currentlySelected.start.ID &&
                          item.end.ID == currentlySelected.end.ID)
              )
            : -1;
        const item = up.items[(currentlySelectedIndex + 1) % up.items.length];
        if (item) tool.select(item);
    } else if (tool instanceof EdgeTool) {
        // Get the list of start and end nodes that were pressed
        const startNodes = down.items.filter(
            item => "ID" in item
        ) as IIndependentParkingNode[];
        const endNodes = up.items.filter(
            item => "ID" in item
        ) as IIndependentParkingNode[];
        if (startNodes.length == 0 || endNodes.length == 0) return;

        // Get the closest start and end node
        const startNode = startNodes[0];
        const endNode = endNodes[0];

        // Create the forward edge
        editor.addEdge({
            start: startNode.ID,
            end: endNode.ID,
            tags: tool.getSelectedTags(null),
        });

        // Create the reverse edge if specified
        if (tool.getIsTwoWayEdge(null))
            editor.addEdge({
                start: endNode.ID,
                end: startNode.ID,
                tags: tool.getSelectedTags(null),
            });
    } else if (tool instanceof NodeTool) {
        // Get an available ID
        const graph = editor.getGraph(null);
        let ID = 0;
        while (graph[ID]) ID++;

        // Create a new node at the clicked position
        editor.addNode({
            ID: ID + "",
            ...tool.getRoundedPos(up.pos),
            tags: tool.getSelectedTags(null),
        });
    }
}

export const LotEditorView: FC = () => {
    const mouseDown = useRef<any>();
    const theme = useTheme();
    const [lot, setLot] = useState(null as null | LotEditor);
    useEffect(() => {
        getAsync(h => Application.getParkingGraph(h)).then(graph =>
            setLot(new LotEditor(graph))
        );
    }, []);
    const [h] = useDataHook();

    if (!lot) return <div>loading</div>;

    const selectMode = lot.getSelectedToolName(h) == "selector";
    const selected = selectMode && lot.getSelectorTool().getSelected(h);

    return (
        <StageContainer
            moveable={selectMode}
            stageContent={
                <GraphClickHandler
                    onMouseDown={(pos, items) => (mouseDown.current = {pos, items})}
                    onMouseUp={(pos, items) =>
                        onGraphClick(mouseDown.current, {pos, items}, lot)
                    }
                    graph={lot}
                    selectionRangePixels={10}>
                    <FilterableGraphView graph={lot} />
                    {selected &&
                        ("ID" in selected ? (
                            <Circle pos={selected} radius={12} color="#ffdf00" />
                        ) : (
                            <Line
                                start={selected.start}
                                end={selected.end}
                                width={3}
                                arrowSize={11}
                                color="#ffdf00"
                            />
                        ))}
                </GraphClickHandler>
            }
            sidebar={
                <Fragment>
                    <div
                        css={{
                            marginBottom: theme.spacing.m,
                            background: theme.palette.themeLighter,
                            padding: theme.spacing.m,
                        }}>
                        <FilterableGraphFilters graph={lot} />
                    </div>
                    <div
                        css={{
                            padding: theme.spacing.m,
                        }}>
                        <ToolsView editor={lot} />
                    </div>
                </Fragment>
            }
        />
    );
};
