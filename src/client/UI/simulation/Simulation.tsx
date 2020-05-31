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
    const [h, s] = useDataHook();
    const theme = useTheme();

    const [showPathParts, setShowPathParts] = useState([
        pathParts[0],
        pathParts[3],
    ] as typeof pathParts[number][]);
    const [addPath, _, pathse] = useActionState<
        [string[], string[], string[], string[]] | undefined
    >(h, false);
    const paths = (pathse as any) as null | string[][]; // bug: https://github.com/TarVK/model-react/issues/7

    const [graph, setGraph] = useState(null as null | GraphFilter);
    useEffect(() => {
        getAsync(h => Application.getParkingGraph(h)).then(graph =>
            setGraph(new GraphFilter(graph))
        );
    }, []);

    const [selectedNodeID, selectNodeID] = useState(null as null | string);
    const [walkCost, setWalkCost] = useState(1.5);
    const [turnCost, setTurnCost] = useState(0);

    const createPath = () => {
        addPath(
            getAsync(h => Application.getControllableBot(h))
                .then(bot => bot?.findAndClaimSpot(walkCost, turnCost))
                .then(route => route?.car),
            true
        ).then(path => console.log(path));
    };
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
                        {paths &&
                            paths
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
                        {paths && (
                            <Circle
                                color={colors[0]}
                                pos={graph.getGraph(h)[paths[1][0]]}
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
                        <LoaderSwitch {...s} onLoad="loading">
                            <PrimaryButton onClick={createPath}>
                                create path
                            </PrimaryButton>
                        </LoaderSwitch>
                    </div>

                    <div
                        css={{
                            padding: theme.spacing.m,
                        }}>
                        {selectedNodeID != null && (
                            <SpotControls spotID={selectedNodeID} />
                        )}
                        <PrimaryButton onClick={releaseSpots}>
                            Release all spaces
                        </PrimaryButton>
                        <PrimaryButton onClick={addCustomer}>Add customer</PrimaryButton>
                    </div>
                </Fragment>
            }
        />
    );
};
