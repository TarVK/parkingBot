import {jsx} from "@emotion/core";
import {CustomPIXIComponent} from "react-pixi-fiber";
import {utils, Graphics} from "pixi.js";
import {createPixiComponent} from "./createPixiComponent";
import {useContext} from "react";
import {unitToPixelRateContext} from "./TransformableContainer";

export type ICircleProps = {
    pos: {x: number; y: number};
    radius: number;
    color?: string;
};
export const Circle = createPixiComponent<Graphics, ICircleProps, {scale: number}>(
    {
        create: () => new Graphics(),
        props: (instance, {pos, radius, scale, color = "#000000"}) => {
            instance
                .clear()
                .beginFill(utils.string2hex(color))
                .drawCircle(pos.x * scale, pos.y * scale, radius)
                .endFill();
        },
        hooks: ({Comp, ...props}) => {
            return <Comp {...props} scale={useContext(unitToPixelRateContext)} />;
        },
    },
    "Circle"
);
