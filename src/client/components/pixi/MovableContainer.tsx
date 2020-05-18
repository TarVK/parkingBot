import {jsx} from "@emotion/core";
import {FC, ReactNode, useRef, useState, useEffect} from "react";
import {TransformableContainer} from "./TransformableContainer";

export const MovableContainer: FC<{
    height: number;
    width: number;
    disabled?: boolean;
    initScale?: number;
    initOffset?: {x: number; y: number};
    children: ReactNode;
}> = ({height, width, initScale = 20, initOffset = {x: 0, y: 0}, children, disabled}) => {
    const [scale, setScale] = useState(initScale);
    const [offset, setOffset] = useState(initOffset);
    const offsetRef = useRef(offset);
    offsetRef.current = offset;

    useEffect(() => {
        if (disabled) return;

        // Drag handler
        const minDistMove = 20;
        let mouseStart = null as null | {x: number; y: number};
        let offsetStart = null as null | {x: number; y: number};
        let moved = false;
        const downListener = e => {
            if (e.button != 1) return;
            mouseStart = {x: e.screenX, y: e.screenY};
            offsetStart = offsetRef.current;
            moved = false;
        };
        const upListener = e => {
            mouseStart = null;
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        const moveListener = e => {
            if (mouseStart && offsetStart) {
                const dx = e.screenX - mouseStart.x;
                const dy = e.screenY - mouseStart.y;
                if (dx * dx + dy * dy > minDistMove * minDistMove) moved = true;
                setOffset({x: offsetStart.x + dx, y: offsetStart.y - dy});
            }
        };
        window.addEventListener("mousedown", downListener);
        window.addEventListener("mouseup", upListener);
        window.addEventListener("mousemove", moveListener);

        // Scroll handler
        const scrollListener = e => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            // Get the new scaling factor
            const f = 0.9;
            const factor = e.deltaY > 0 ? f : 1 / f;

            // Get the point to scale around
            const mouseX = e.clientX;
            const mouseY = height - e.clientY;

            // Update offset to zoom into the center
            setOffset({
                x: mouseX + (offsetRef.current.x - mouseX) * factor,
                y: mouseY + (offsetRef.current.y - mouseY) * factor,
            });

            // Update the scale
            setScale(scale => scale * factor);
        };
        window.addEventListener("mousewheel", scrollListener, {passive: false});

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
