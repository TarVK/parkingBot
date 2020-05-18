import {jsx} from "@emotion/core";
import {FC, Fragment, ReactNode, useContext} from "react";
import {IGraphClickHandler} from "./_types/IGraphClickHandler";
import {InteractiveContainer} from "../components/pixi/InteractiveContainer";
import {GraphFilter} from "../model/GraphFilter";
import {IIndependentParkingNode} from "../model/_types/IIndependentParkingNode";
import {IIndependentParkingEdge} from "../model/_types/IIndependentParkingEdge";
import {unitToPixelRateContext} from "../components/pixi/TransformableContainer";

/**
 * Retrieves the distance from the position to the node
 * @param pos The position
 * @param node The node
 * @returns The distance
 */
function getNodeDistance(
    pos: {x: number; y: number},
    node: {x: number; y: number}
): number {
    const dx = node.x - pos.x;
    const dy = node.y - pos.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Retrieves the distance from the position to the edge
 * @param pos The position
 * @param edge The edge
 * @returns The distance
 */
function getEdgeDistance(
    pos: {x: number; y: number},
    edge: IIndependentParkingEdge
): number {
    // Get data of the edge
    const lDx = edge.end.x - edge.start.x;
    const lDy = edge.end.y - edge.start.y;
    const angle = Math.atan2(lDy, lDx);

    // Get difference between point and edge start
    const pDx = pos.x - edge.start.x;
    const pDy = pos.y - edge.start.y;

    // Rotate the scene such that the line becomes the x axis
    const yDifRotated = pDy * Math.cos(-angle) + pDx * Math.sin(-angle);
    const xDifRotated = pDx * Math.cos(-angle) - pDy * Math.sin(-angle);

    // Check whether the point is withing the line segment
    const beforeTheEnd = xDifRotated * xDifRotated <= lDx * lDx + lDy * lDy;
    if (xDifRotated > 0 && beforeTheEnd) {
        return Math.abs(yDifRotated);
    } else {
        // If not, return min distance to one of the end points
        return Math.min(getNodeDistance(pos, edge.start), getNodeDistance(pos, edge.end));
    }
}

export const GraphClickHandler: FC<{
    onMouseDown: IGraphClickHandler;
    onMouseUp: IGraphClickHandler;
    graph: GraphFilter;
    selectionRange?: number;
    selectionRangePixels?: number;
    children: ReactNode;
}> = ({
    onMouseDown,
    onMouseUp,
    graph,
    children,
    selectionRange = 0,
    selectionRangePixels,
}) => {
    const unitScale = useContext(unitToPixelRateContext);
    if (selectionRangePixels) selectionRange = selectionRangePixels / unitScale;
    const getItems = (pos: {x: number; y: number}) => {
        // Get all visible items
        const visibleEdges = graph.getVisibleEdges(null);
        const visibleNodes = graph.getVisibleNodes(null);

        // Get the distance to all items
        const withDistance: {
            distance: number;
            item: IIndependentParkingEdge | IIndependentParkingNode;
        }[] = [
            ...visibleEdges.map(edge => ({
                item: edge,
                distance: getEdgeDistance(pos, edge),
            })),
            ...visibleNodes.map(node => ({
                item: node,
                distance: getNodeDistance(pos, node) - 5 / unitScale, // Make nodes have an actual size that counts as spot on
            })),
        ];

        // Filter to only select items within distance
        const withinDistance = withDistance.filter(
            ({distance, item}) => distance <= selectionRange
        );

        // Sort the items such that the closest comes first
        const sorted = withinDistance.sort((a, b) => a.distance - b.distance);

        // Return the result
        return sorted.map(({item}) => item);
    };
    return (
        <InteractiveContainer
            onMouseDown={pos => {
                onMouseDown(pos, getItems(pos));
            }}
            onMouseUp={pos => {
                onMouseUp(pos, getItems(pos));
            }}>
            {children}
        </InteractiveContainer>
    );
};
