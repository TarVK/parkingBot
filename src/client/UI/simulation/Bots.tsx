import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Sprite} from "../../components/pixi/Sprite";
export const Bots: FC = () => {
    const [h] = useDataHook();
    const bots = Application.getBots(h);
    return (
        <Fragment>
            {bots.map(bot => {
                const pos = bot.getPosition(h).physical;
                return (
                    <Sprite
                        key={bot.getID()}
                        pos={pos}
                        size={{width: 2, height: 1.2}}
                        rotation={pos.rotation}
                        src={"/images/botTop.png"}
                    />
                );
            })}
        </Fragment>
    );
};
