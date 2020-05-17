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

    return (
        <div css={{display: "flex", flexDirection: "row", height: "100vh"}}>
            <div css={{flex: 1}} onMouseDown={e => e.preventDefault()}>
                <Stage height={windowHeight} width={windowWidth - sidebarWidth}>
                    <MovableContainer
                        disabled={!moveable}
                        height={windowHeight}
                        initScale={20}
                        initOffset={{x: 100, y: 300}}>
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
