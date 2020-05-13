import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {GraphFilter} from "../../model/GraphFilter";
import {Application} from "../../model/Application";
import {getAsync} from "model-react";
import {FilterableGraphView} from "../FilterableGraphView";
import {Stage} from "react-pixi-fiber";
import {TransformableContainer} from "../../components/pixi/TransformableContainer";
import {FilterableGraphFilters} from "../FilterableGraphFilters";

const size = {width: 800, height: 600};
export const LotEditorView: FC = () => {
    const [filterableGraph, setFilterableGraph] = useState(null as null | GraphFilter);
    useEffect(() => {
        getAsync(h => Application.getParkingGraph(h)).then(graph =>
            setFilterableGraph(new GraphFilter(graph))
        );
    }, []);

    if (!filterableGraph) return <div>loading</div>;

    return (
        <div>
            <Stage
                options={{
                    backgroundColor: 0x10bb99,
                    ...size,
                    antialias: true,
                }}>
                <TransformableContainer height={size.height} offset={{x: 100, y: 300}}>
                    <FilterableGraphView graph={filterableGraph} />
                </TransformableContainer>
            </Stage>
            <FilterableGraphFilters graph={filterableGraph} />
        </div>
    );
};
