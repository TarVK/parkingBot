import {jsx} from "@emotion/core";
import {GraphFilter} from "../model/GraphFilter";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Dropdown} from "@fluentui/react";

export const FilterableGraphFilters: FC<{graph: GraphFilter}> = ({graph}) => {
    const [h] = useDataHook();
    const availableNodeTags = graph.getAvailableNodeVisibleTags();
    const availableEdgeTags = graph.getAvailableEdgeVisibleTags();
    const nodeTags = graph.getNodeVisibleTags(h);
    const edgeTags = graph.getEdgeVisibleTags(h);
    return (
        <div>
            <Dropdown
                placeholder="Select filters"
                label="Nodes to display"
                selectedKeys={nodeTags}
                onChange={(e, v) =>
                    v &&
                    graph.setNodeVisibleTags(
                        v.selected
                            ? [...nodeTags, v.text as any]
                            : nodeTags.filter(k => k != v.key)
                    )
                }
                multiSelect
                options={availableNodeTags.map(tag => ({key: tag, text: tag}))}
            />
            <Dropdown
                placeholder="Select filters"
                label="Edges to display"
                selectedKeys={edgeTags}
                onChange={(e, v) =>
                    v &&
                    graph.setEdgeVisibleTags(
                        v.selected
                            ? [...edgeTags, v.text as any]
                            : edgeTags.filter(k => k != v.key)
                    )
                }
                multiSelect
                options={availableEdgeTags.map(tag => ({key: tag, text: tag}))}
            />
        </div>
    );
};
