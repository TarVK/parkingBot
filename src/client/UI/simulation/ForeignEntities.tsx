import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Circle} from "../../components/pixi/Circle";
export const ForeignEntities: FC = () => {
    const [h] = useDataHook();
    const entities = Application.getEntityManager().getEntities(h);
    return (
        <Fragment>
            {entities.map(({ID, pos, type}) => {
                return (
                    <Circle
                        key={ID}
                        pos={pos}
                        radius={type == "person" ? 3 : 15}
                        color="#ff0000"
                    />
                );
            })}
        </Fragment>
    );
};
