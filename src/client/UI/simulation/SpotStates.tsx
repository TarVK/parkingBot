import {jsx} from "@emotion/core";
import {FC, useState, Fragment, useEffect} from "react";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Circle} from "../../components/pixi/Circle";

const colors = {taken: "#52307C", claimed: "#B491C8"};
export const SpotStates: FC = () => {
    const [h] = useDataHook();
    const bot = Application.getControllableBot(h);
    const spots = bot?.getParkingSpaces(h);
    const graph = Application.getParkingGraph(h);
    if (!spots || !graph) return null;
    return (
        <Fragment>
            {Object.keys(spots).map(ID => {
                const node = graph[ID];
                const spotData = spots[ID];
                const state = spotData.isTaken
                    ? "taken"
                    : spotData.isClaimed
                    ? "claimed"
                    : "available";
                if (state == "available") return null;
                return <Circle key={ID} color={colors[state]} pos={node} radius={10} />;
            })}
        </Fragment>
    );
};
