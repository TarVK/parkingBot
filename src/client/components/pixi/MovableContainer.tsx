import {jsx} from "@emotion/core";
import {FC, ReactNode, useRef, useState, useEffect} from "react";
import {TransformableContainer} from "./TransformableContainer";

export const MovableContainer: FC<{
    height: number;
    disabled?: boolean;
    initScale?: number;
    initOffset?: {x: number; y: number};
    children: ReactNode;
}> = ({height, initScale = 20, initOffset = {x: 0, y: 0}, children, disabled}) => {
    const [scale, setScale] = useState(initScale);
    const [offset, setOffset] = useState(initOffset);
    const offsetRef = useRef(offset);
    offsetRef.current = offset;

    useEffect(() => {
        if (disabled) return;

        // Drag handler
        let mouseStart = null as null | {x: number; y: number};
        let offsetStart = null as null | {x: number; y: number};
        const downListener = e => {
            mouseStart = {x: e.screenX, y: e.screenY};
            offsetStart = offsetRef.current;
        };
        const upListener = e => {
            mouseStart = null;
        };
        const moveListener = e => {
            if (mouseStart && offsetStart) {
                const dx = e.screenX - mouseStart.x;
                const dy = e.screenY - mouseStart.y;
                setOffset({x: offsetStart.x + dx, y: offsetStart.y - dy});
            }
        };
        window.addEventListener("mousedown", downListener);
        window.addEventListener("mouseup", upListener);
        window.addEventListener("mousemove", moveListener);

        // Scroll handler
        const scrollListener = e => {
            if (e.deltaY > 0) setScale(scale => scale * 0.9);
            else setScale(scale => scale / 0.9);
        };
        window.addEventListener("mousewheel", scrollListener);

        // Cleanup
        return () => {
            window.removeEventListener("mousewheel", scrollListener);
            window.removeEventListener("mousedown", downListener);
            window.removeEventListener("mouseup", upListener);
            window.removeEventListener("mousemove", moveListener);
        };
    }, [disabled]);

    return (
        <TransformableContainer height={height} unitScale={scale} offset={offset}>
            {children}
        </TransformableContainer>
    );
};
