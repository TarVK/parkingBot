import {jsx} from "@emotion/core";
import {Container, Rectangle} from "pixi.js";
import {createContext, ReactNode} from "react";
import {createPixiComponent} from "./createPixiComponent";

export const unitToPixelRateContext = createContext(10); // How many pixels should represent 1 unit of the parking graph

export const TransformableContainer = createPixiComponent<
    Container,
    {
        children: ReactNode;
        height: number;
        unitScale?: number;
        offset?: {x: number; y: number};
    }
>(
    {
        create: ({height}) => {
            const container = new Container();

            container.interactive = true;
            container.buttonMode = true;
            container.hitArea = new Rectangle(-5000, -5000, 10000, 10000);
            container.cursor = "default";

            container.scale.y = -1;
            container.position.y = height;
            return container;
        },
        props: (instance, {offset, height}) => {
            if (offset) {
                instance.position.x = offset.x;
                instance.position.y = -offset.y + height;
            }
        },
        hooks: ({Comp, ...props}) => {
            return (
                <unitToPixelRateContext.Provider value={props.unitScale || 20}>
                    <Comp {...props} />
                </unitToPixelRateContext.Provider>
            );
        },
    },
    "TransformableContainer"
);
