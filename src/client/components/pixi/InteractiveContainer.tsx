import {jsx} from "@emotion/core";
import {Container, Rectangle} from "pixi.js";
import {ReactNode, useContext} from "react";
import {createPixiComponent} from "./createPixiComponent";
import {unitToPixelRateContext} from "./TransformableContainer";

export const InteractiveContainer = createPixiComponent<
    Container,
    {
        children: ReactNode;
        onMouseDown: (pos: {x: number; y: number}, button: number) => void;
        onMouseUp: (pos: {x: number; y: number}, button: number) => void;
    }
>(
    {
        create: () => {
            const container = new Container();
            container.interactive = true;
            // container.buttonMode = true;
            container.hitArea = new Rectangle(-5000, -5000, 10000, 10000);
            container.cursor = "default";
            return container;
        },
        props: (instance, {onMouseDown, onMouseUp}) => {
            instance.removeAllListeners();
            instance.on("mousedown", e => {
                onMouseDown(e.data.getLocalPosition(instance), e.data.button);
            });
            instance.on("mouseup", e => {
                onMouseUp(e.data.getLocalPosition(instance), e.data.button);
            });
            instance.on("rightdown", e => {
                onMouseDown(e.data.getLocalPosition(instance), 2);
            });
            instance.on("rightup", e => {
                onMouseUp(e.data.getLocalPosition(instance), 2);
            });
        },
        hooks: ({Comp, onMouseDown, onMouseUp, ...props}) => {
            const unitScale = useContext(unitToPixelRateContext);
            return (
                <Comp
                    onMouseDown={({x, y}, button) =>
                        onMouseDown({x: x / unitScale, y: y / unitScale}, button)
                    }
                    onMouseUp={({x, y}, button) =>
                        onMouseUp({x: x / unitScale, y: y / unitScale}, button)
                    }
                    {...props}
                />
            );
        },
    },
    "InteractiveContainer"
);
