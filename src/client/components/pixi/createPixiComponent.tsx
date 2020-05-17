import {jsx} from "@emotion/core";
import {FC, useState} from "react";
import {CustomPIXIComponent} from "react-pixi-fiber";
import {utils, Graphics} from "pixi.js";

/**
 * Creates a new pixi component
 * @param translate The data to translate from react fabric to pixi
 * @param name The name of the component
 * @returns a react component
 */
export const createPixiComponent = <T extends PIXI.DisplayObject, P, S = {}>(
    {
        create,
        props,
        destroy,
        hooks: Hooks,
    }: {
        create: (props: P) => T;
        props?: (instance: T, newProps: P & S, oldProps: P & S) => void;
        destroy?: (instance: T) => void;
        hooks?: FC<P & {Comp: FC<P & S>}>;
    },
    name: string
): FC<P> => {
    const Comp = CustomPIXIComponent<T, P & S>(
        {
            customDisplayObject: create,
            customApplyProps:
                props &&
                ((instance, oldProps, newProps) => props(instance, newProps, oldProps)),
            customWillDetach: destroy,
        },
        name
    );

    if (Hooks) {
        return props => <Hooks {...props} Comp={Comp} />;
    } else return Comp;
};
