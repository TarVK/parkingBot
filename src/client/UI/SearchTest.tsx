import {jsx} from "@emotion/core";
import {FC, useState, Fragment} from "react";
import {Stage} from "react-pixi-fiber";
import {GraphComp} from "./GraphComp";
import {Path} from "./Path";
import {TransformableContainer} from "../components/pixi/TransformableContainer";
import {Loader, useDataHook, useActionState, LoaderSwitch} from "model-react";
import {Application} from "../model/Application";
import {TextField, PrimaryButton} from "@fluentui/react";

const colors = ["#000099", "#0000BB", "#0000DD", "#0000FF"];
const size = {width: 800, height: 600};
export const SearchTest: FC = () => {
    const [h, s] = useDataHook();
    const [addPath, _, pathse] = useActionState<
        [string[], string[], string[], string[]] | undefined
    >(h, false);
    const paths = (pathse as any) as undefined | string[][]; // bug: https://github.com/TarVK/model-react/issues/7
    const [walkCost, setWalkCost] = useState(1);
    const [turnCost, setTurnCost] = useState(0);

    const createPath = () => {
        addPath(Application.getParkingSpot(walkCost, turnCost), true);
    };

    return (
        <Loader>
            {h => {
                const graph = Application.getParkingGraph(h);
                if (!graph) return <div>loading</div>;

                return (
                    <Fragment>
                        <Stage
                            options={{
                                backgroundColor: 0x10bb99,
                                ...size,
                                antialias: true,
                            }}>
                            <TransformableContainer
                                height={size.height}
                                offset={{x: 100, y: 300}}>
                                <GraphComp parkingGraph={graph} />
                                {paths &&
                                    paths.map((path, i) => (
                                        <Path
                                            key={i}
                                            path={path || []}
                                            parkingGraph={graph}
                                            color={colors[i]}
                                        />
                                    ))}
                            </TransformableContainer>
                        </Stage>
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
                    </Fragment>
                );
            }}
        </Loader>
    );
};
