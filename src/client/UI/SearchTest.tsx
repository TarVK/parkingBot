import {jsx} from "@emotion/core";
import {FC, useState, Fragment} from "react";
import {Stage} from "react-pixi-fiber";
import {GraphComp} from "./GraphComp";
import {Path} from "./Path";
import {TransformableContainer} from "../components/pixi/TransformableContainer";
import {Loader, useDataHook, useActionState, LoaderSwitch} from "model-react";
import {Application} from "../model/Application";
import {TextField, PrimaryButton} from "@fluentui/react";

const size = {width: 800, height: 600};
export const SearchTest: FC = () => {
    const [h, s] = useDataHook();
    const [addPath, _, paths] = useActionState<string[] | undefined>(h, false);
    const path = (paths as any) as string[]; // bug:
    const [walkCost, setWalkCost] = useState(1);
    const [turnCost, setTurnCost] = useState(0);

    const createPath = () => {
        console.log(walkCost, turnCost);
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
                                <Path path={path || []} parkingGraph={graph} />
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
