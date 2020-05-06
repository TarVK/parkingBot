import {jsx} from "@emotion/core";
import {utils, Graphics} from "pixi.js";
import {useContext} from "react";
import {createPixiComponent} from "./createPixiComponent";
import {unitToPixelRateContext} from "./TransformableContainer";

export type ILineProps = {
    start: {x: number; y: number};
    end: {x: number; y: number};
    color?: string;
    width?: number;
    arrowSize?: number;
};
export const Line = createPixiComponent<Graphics, ILineProps, {scale: number}>(
    {
        create: props => new Graphics(),
        props: (
            instance,
            {start, end, color = "#000000", width = 2, arrowSize, scale}
        ) => {
            instance
                .clear()
                .lineStyle(width, utils.string2hex(color))
                .moveTo(start.x * scale, start.y * scale)
                .lineTo(end.x * scale, end.y * scale);

            if (arrowSize) {
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const center = {
                    x: (start.x + dx * (3 / 7)) * scale,
                    y: (start.y + dy * (3 / 7)) * scale,
                }; // Not exactly the center, to improve bidirectional readability
                const angle = Math.atan2(dy, dx);
                const angleP1 = angle + ((4 + 1) * Math.PI) / 4;
                const p1 = {
                    x: Math.cos(angleP1) * arrowSize + center.x,
                    y: Math.sin(angleP1) * arrowSize + center.y,
                };
                const angleP2 = angle + ((4 - 1) * Math.PI) / 4;
                const p2 = {
                    x: Math.cos(angleP2) * arrowSize + center.x,
                    y: Math.sin(angleP2) * arrowSize + center.y,
                };

                instance.moveTo(center.x, center.y);
                instance.lineTo(p1.x, p1.y);
                instance.moveTo(center.x, center.y);
                instance.lineTo(p2.x, p2.y);
            }
        },
        hooks: ({Comp, ...props}) => {
            return <Comp {...props} scale={useContext(unitToPixelRateContext)} />;
        },
    },
    "Line"
);
