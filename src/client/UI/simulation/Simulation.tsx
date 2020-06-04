import {jsx} from "@emotion/core";
import {FC, useState, Fragment, useEffect} from "react";
import {Path} from "../Path";
import {useDataHook, useActionState, LoaderSwitch, getAsync} from "model-react";
import {Application} from "../../model/Application";
import {TextField, PrimaryButton} from "@fluentui/react";
import {StageContainer} from "../StageContainer";
import {GraphFilter} from "../../model/GraphFilter";
import {FilterableGraphView} from "../FilterableGraphView";
import {FilterableGraphFilters} from "../FilterableGraphFilters";
import {useTheme} from "../../services/useTheme";
import {TagSelector} from "../../components/TagSelector";
import {Circle} from "../../components/pixi/Circle";
import {GraphClickHandler} from "../GraphClickHandler";
import {IIndependentParkingNode} from "../../model/_types/IIndependentParkingNode";
import {SpotControls} from "./SpotControls";
import {SpotStates} from "./SpotStates";
import {Bots} from "./Bots";
import {ForeignEntities} from "./ForeignEntities";

const colors = ["#FFFF88", "#FFFF22", "#CCCC00", "#999900"];
const pathParts = [
    "car enter",
    "pedestrian exit",
    "pedestrian enter",
    "car exit",
] as const;
export const Simulation: FC = () => {
    const [h] = useDataHook();
    const theme = useTheme();
    const route = Application.getRoute(h);

    const [showPathParts, setShowPathParts] = useState([
        pathParts[0],
        pathParts[3],
    ] as typeof pathParts[number][]);

    const [graph, setGraph] = useState(null as null | GraphFilter);
    useEffect(() => {
        getAsync(h => Application.getParkingGraph(h)).then(graph =>
            setGraph(new GraphFilter(graph))
        );
    }, []);

    const [selectedNodeID, selectNodeID] = useState(null as null | string);
    const [walkCost, setWalkCost] = useState(1.5);
    const [turnCost, setTurnCost] = useState(0);

    const releaseSpots = async () => {
        if (!graph) return;
        const g = await getAsync(h => graph.getGraph(h));
        if (!g) return;
        return Promise.all(
            Object.keys(g)
                .filter(ID => g[ID]?.tags?.includes("spot"))
                .map(ID => Application.releaseSpace(ID))
        );
    };
    const addCustomer = () => {
        Application.addCustomer(walkCost, turnCost);
    };

    //Main loop to look for new customers
    useEffect(() => {
        let stopped = false;
        const check = async () => {
            await Application.lookForCustomers();
            if (!stopped) setTimeout(check, 100);
        };
        check();
        return () => void (stopped = true);
    }, [Application.getControllableBot(h)]);

    if (!graph) return <div>loading</div>;
    return (
        <StageContainer
            moveable
            stageContent={
                <Fragment>
                    <GraphClickHandler
                        graph={graph}
                        onMouseDown={() => {}}
                        onMouseUp={(pos, items) => {
                            const spots = items.filter(
                                item => "ID" in item && item.tags.includes("spot")
                            ) as IIndependentParkingNode[];
                            if (spots.length > 0) selectNodeID(spots[0].ID);
                            else selectNodeID(null);
                        }}>
                        <FilterableGraphView graph={graph} />
                        <SpotStates />
                        {route &&
                            route.car
                                .filter((p, i) => showPathParts.includes(pathParts[i]))
                                .map((path, i) => (
                                    <Path
                                        key={i}
                                        path={path || []}
                                        parkingGraph={graph.getGraph(h)}
                                        color={colors[i]}
                                        width={4}
                                    />
                                ))}
                        {route && (
                            <Circle
                                color={colors[0]}
                                pos={graph.getGraph(h)[route.car[1][0]]}
                                radius={15}
                            />
                        )}
                        <Bots />
                        <ForeignEntities />
                    </GraphClickHandler>
                </Fragment>
            }
            sidebar={
                <Fragment>
                    <div css={{height: "100%", display: "flex", flexDirection: "column"}}>
                        <div
                            css={{
                                background: theme.palette.themeLighter,
                                padding: theme.spacing.m,
                            }}>
                            <FilterableGraphFilters graph={graph} />
                            <TagSelector
                                label="Path to display"
                                options={pathParts}
                                selected={showPathParts}
                                onChange={v => setShowPathParts(v)}
                            />
                        </div>

                        <div
                            css={{
                                padding: theme.spacing.m,
                            }}>
                            <TextField
                                label="walk cost"
                                type="number"
                                value={walkCost + ""}
                                onChange={(e, v) => setWalkCost(Number(v))}
                            />
                            <TextField
                                label="turn cost"
                                type="number"
                                value={turnCost + ""}
                                onChange={(e, v) => setTurnCost(Number(v))}
                            />
                            <PrimaryButton
                                onClick={addCustomer}
                                css={{marginTop: 15, width: "100%"}}>
                                Add customer
                            </PrimaryButton>
                        </div>

                        <div css={{flexGrow: 1}}></div>
                        <div
                            css={{
                                padding: theme.spacing.m,
                            }}>
                            {selectedNodeID != null && (
                                <SpotControls spotID={selectedNodeID} />
                            )}
                            <PrimaryButton
                                onClick={releaseSpots}
                                css={{marginTop: 15, width: "100%"}}>
                                Release all spaces
                            </PrimaryButton>
                        </div>
                    </div>
                </Fragment>
            }
        />
    );
};
