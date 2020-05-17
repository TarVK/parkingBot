import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Line} from "../components/pixi/Line";
import {Circle} from "../components/pixi/Circle";
import {GraphFilter} from "../model/GraphFilter";
import {useDataHook} from "model-react";
import {IGraphClickHandler} from "./_types/IGraphClickHandler";

const colors = {
    spot: "#ff00ff",
    entrance: "#00ff00",
    exit: "#ff0000",
    pedestrianEntrance: "#009900",
    pedestrianExit: "#990000",
};
export const FilterableGraphView: FC<{
    graph: GraphFilter;
}> = ({graph}) => {
    const [h] = useDataHook();
    const nodes = graph.getVisibleNodes(h);
    const edges = graph.getVisibleEdges(h);
    return (
        <Fragment>
            {/* Draw all edges */}
            {edges.map(({start, end}) => (
                <Line
                    key={`${start.ID}-${end.ID}`}
                    start={start}
                    end={end}
                    arrowSize={10}
                />
            ))}

            {/* draw all nodes */}
            {nodes.map(node => {
                const color = colors[node.tags[0]] || "#000000";
                if (color)
                    return (
                        <Circle
                            key={node.ID}
                            pos={node}
                            radius={node.tags.length == 0 ? 5 : 10}
                            color={color}
                        />
                    );
            })}
        </Fragment>
    );
};
