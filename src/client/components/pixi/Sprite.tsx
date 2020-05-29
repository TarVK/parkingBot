import {jsx} from "@emotion/core";
import {Sprite as PixiSprite, Texture} from "pixi.js";
import {createPixiComponent} from "./createPixiComponent";
import {useContext} from "react";
import {unitToPixelRateContext} from "./TransformableContainer";

export type ISpriteProps = {
    pos: {x: number; y: number};
    rotation?: number;
    size: {
        width: number;
        height: number;
    };
    src: string;
};
export const Sprite = createPixiComponent<PixiSprite, ISpriteProps, {scale: number}>(
    {
        create: () => new PixiSprite(),
        props: (instance, {pos, scale, size, src, rotation}, {src: prevSrc}) => {
            if (src != prevSrc) instance.texture = Texture.from(src);
            instance.position.x = pos.x * scale;
            instance.position.y = pos.y * scale;
            if (rotation != null) instance.rotation = rotation;
            instance.width = size.width * scale;
            instance.height = size.height * scale;

            instance.anchor.x = 0.5;
            instance.anchor.y = 0.5;
        },
        hooks: ({Comp, ...props}) => {
            return <Comp {...props} scale={useContext(unitToPixelRateContext)} />;
        },
    },
    "CustomSprite"
);
