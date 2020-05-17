import {jsx} from "@emotion/core";
import {render, Text} from "react-pixi-fiber";
import {
    FC,
    ReactNode,
    useMemo,
    createContext,
    useState,
    useEffect,
    Fragment,
    useContext,
    useRef,
} from "react";
import {Stage as PixiStage} from "react-pixi-fiber";
import {useTheme} from "../../services/useTheme";
import {utils, Application, Renderer} from "pixi.js";

// For some reason stage rerender resets any internal hooks, so we must only create a single stage instance

export const StageChild = createContext(null as ReactNode);

export const StageInner: FC = () => {
    const children = useContext(StageChild);
    console.log(children, "child");
    return <Fragment>{children}</Fragment>;
};

export const Stage: FC<{height: number; width: number; children: ReactNode}> = ({
    width,
    height,
    children,
}) => {
    const theme = useTheme();
    const [canvas, setCanvas] = useState(null as null | HTMLCanvasElement);
    const [app, setApp] = useState(null as null | Application);
    const renderer = useRef(null as null | Renderer);

    // Create a new app when no app exists yet and the canvas is set
    useEffect(() => {
        if (!canvas || app) return;

        setApp(
            new Application({
                view: canvas,
                backgroundColor: utils.string2hex(theme.palette.themeLight),
                height: height,
                width: width,
                antialias: true,
            })
        );
    }, [canvas]);

    // Rerender whenever the content changes
    useEffect(() => {
        if (!app) return;
        render(children as any, app.stage);
    }, [app, children]);

    // Update the size whenever changed
    useEffect(() => {
        if (!app) return;
        app.renderer.resize(width, height);
    }, [width, height]);

    return (
        <canvas
            css={{width: "100%", height: "100%"}}
            ref={el => el && setCanvas(el)}></canvas>
    );
};
