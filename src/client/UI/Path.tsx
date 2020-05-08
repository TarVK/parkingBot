import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Line} from "../components/pixi/Line";
import {INormalizedParkingNode} from "../../_types/graph/IParkingNode";

export const Path: FC<{
    parkingGraph: INormalizedParkingGraph;
    path: string[];
    color?: string;
}> = ({parkingGraph, path, color = "#0000ff"}) => {
    let previousNode = undefined as undefined | INormalizedParkingNode;
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
                        arrowSize={10}
                    />
                );
            })}
        </Fragment>
    );
};
