import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {IParkingGraph} from "../../_types/graph/IParkingGraph";
import {Line} from "../components/pixi/Line";
import {IParkingNode} from "../../_types/graph/IParkingNode";

export const Path: FC<{
    parkingGraph: IParkingGraph;
    path: string[];
    width?: number;
    color?: string;
}> = ({parkingGraph, path, width = 3, color = "#0000ff"}) => {
    let previousNode = undefined as undefined | IParkingNode;
    return (
        <Fragment>
            {/* Draw all edges */}
            {path.map((key, i) => {
                const node = parkingGraph[key];
                if (!node) return;
                if (!previousNode) {
                    previousNode = node;
                    return undefined;
                }

                const start = previousNode;
                const end = node;
                previousNode = node;
                return (
                    <Line
                        key={`${key}-${i}-path`}
                        start={start}
                        end={end}
                        color={color}
                        arrowSize={2 + width * 2}
                        width={width}
                    />
                );
            })}
        </Fragment>
    );
};
