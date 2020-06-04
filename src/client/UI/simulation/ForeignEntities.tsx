import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Circle} from "../../components/pixi/Circle";
import {Sprite} from "../../components/pixi/Sprite";
export const ForeignEntities: FC = () => {
    const [h] = useDataHook();
    const entities = Application.getEntityManager().getEntities(h);
    return (
        <Fragment>
            {[...entities].reverse().map(({ID, pos, rotation, type}) => {
                const time = Date.now() / 1000;
                if (type == "person") {
                    const version = ID.charCodeAt(0) % 7;
                    const frame = Math.floor(time * 3) % 3;
                    return (
                        <Sprite
                            key={ID}
                            pos={pos}
                            size={{width: 1.2, height: 1.2}}
                            rotation={rotation + Math.PI / 2}
                            src={`/images/people/${version}-${frame}.png`}
                        />
                    );
                }
                if (type == "car") {
                    const version = ID.charCodeAt(0) % 6;
                    return (
                        <Sprite
                            key={ID}
                            pos={pos}
                            size={{width: 1.8, height: 4}}
                            rotation={rotation + Math.PI / 2}
                            src={`/images/cars/${version}.png`}
                        />
                    );
                }

                return <Circle key={ID} pos={pos} radius={15} color="#ff0000" />;
            })}
        </Fragment>
    );
};
