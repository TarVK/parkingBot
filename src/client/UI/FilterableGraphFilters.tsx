import {jsx} from "@emotion/core";
import {GraphFilter} from "../model/GraphFilter";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Dropdown} from "@fluentui/react";
import {TagSelector} from "../components/TagSelector";

export const FilterableGraphFilters: FC<{graph: GraphFilter}> = ({graph}) => {
    const [h] = useDataHook();
    const availableNodeTags = graph.getAvailableNodeVisibleTags();
    const availableEdgeTags = graph.getAvailableEdgeVisibleTags();
    const nodeTags = graph.getNodeVisibleTags(h);
    const edgeTags = graph.getEdgeVisibleTags(h);
    return (
        <div>
            <TagSelector
                placeHolder="Select filters"
                label="Nodes to display"
                options={availableNodeTags}
                selected={nodeTags}
                onChange={tags => graph.setNodeVisibleTags(tags)}
            />
            <TagSelector
                placeHolder="Select filters"
                label="Edges to display"
                options={availableEdgeTags}
                selected={edgeTags}
                onChange={tags => graph.setEdgeVisibleTags(tags)}
            />
        </div>
    );
};
