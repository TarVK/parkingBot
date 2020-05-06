import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Line} from "../components/pixi/Line";
import {Circle} from "../components/pixi/Circle";

const colors = {
    spot: "#ff00ff",
    entrance: "#00ff00",
    exit: "#ff0000",
    pedestrianEntrance: "#009900",
    pedestrianExit: "#990000",
};
export const GraphComp: FC<{parkingGraph: INormalizedParkingGraph}> = ({
    parkingGraph,
}) => {
    return (
        <Fragment>
            {/* Draw all edges */}
            {Object.keys(parkingGraph).map(key => {
                const node = parkingGraph[key];
                return (
                    <Fragment key={key}>
                        {node.edges.map(({end}) => {
                            const endNode = parkingGraph[end];
                            return (
                                <Line
                                    key={`${key}-${end}`}
                                    start={node}
                                    end={endNode}
                                    arrowSize={10}
                                />
                            );
                        })}
                    </Fragment>
                );
            })}

            {/* draw all nodes */}
            {Object.keys(parkingGraph).map(key => {
                const node = parkingGraph[key];
                const color = colors[node.tags[0]];
                if (color)
                    return <Circle key={key} pos={node} radius={10} color={color} />;
            })}
        </Fragment>
    );
};
