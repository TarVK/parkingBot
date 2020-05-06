import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {Stage} from "react-pixi-fiber";
import {GraphComp} from "./GraphComp";
import {Path} from "./Path";
import {TransformableContainer} from "../components/pixi/TransformableContainer";
import {Loader} from "model-react";
import {Application} from "../model/Application";
import {createSpotSearchGraph} from "../../server/services/graph/search/createSpotSearchGraph";

const size = {width: 800, height: 600};
export const App: FC = () => {
    const [path, setPath] = useState([] as string[]);
    const [path2, setPath2] = useState([] as string[]);
    useEffect(() => {
        Application.getParkingSpot().then(spot => {
            if (spot) {
                setPath(spot.spotPath);
                setPath2(spot.exitPath);
            }
        });
    }, []);

    return (
        <Loader>
            {h => {
                const graph = Application.getParkingGraph(h);
                if (!graph) return <div>loading</div>;

                // console.log(createSpotSearchGraph(graph));
                return (
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
                            <Path path={path} parkingGraph={graph} />
                            <Path path={path2} parkingGraph={graph} color="#ff9900" />
                        </TransformableContainer>
                    </Stage>
                );
            }}
        </Loader>
    );
};
