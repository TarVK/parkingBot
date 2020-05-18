import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";
import {useResize} from "../services/useResize";
import {useTheme} from "../services/useTheme";
import {MovableContainer} from "../components/pixi/MovableContainer";
import {Stage} from "../components/pixi/Stage";

export const StageContainer: FC<{
    stageContent: ReactNode;
    sidebar: ReactNode;
    moveable?: boolean;
}> = ({stageContent, sidebar, moveable}) => {
    const theme = useTheme();
    const [windowWidth, windowHeight] = useResize();
    const sidebarWidth = 300;

    const stageWidth = windowWidth - sidebarWidth;

    return (
        <div css={{display: "flex", flexDirection: "row", height: "100vh"}}>
            <div css={{flex: 1}} onMouseDown={e => e.preventDefault()}>
                <Stage height={windowHeight} width={stageWidth}>
                    <MovableContainer
                        disabled={!moveable}
                        width={stageWidth}
                        height={windowHeight}
                        initScale={20}
                        initOffset={{x: stageWidth / 2, y: windowHeight / 2}}>
                        {stageContent}
                    </MovableContainer>
                </Stage>
            </div>
            <div
                css={{
                    width: sidebarWidth,
                    boxShadow: theme.effects.elevation16,
                    zIndex: 1,
                    boxSizing: "border-box",
                }}>
                {sidebar}
            </div>
        </div>
    );
};
