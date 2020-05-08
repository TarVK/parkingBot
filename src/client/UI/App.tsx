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
    useEffect(() => {
        Application.getParkingSpot().then(path => {
            if (path) setPath(path);
            // console.log(path);
            // console.log(createSpotSearchGraph(Application.getParkingGraph(null) || {}));
        });
    }, []);

    return (
        <Loader>
            {h => {
                const graph = Application.getParkingGraph(h);
                if (!graph) return <div>loading</div>;

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
                        </TransformableContainer>
                    </Stage>
                );
            }}
        </Loader>
    );
};
