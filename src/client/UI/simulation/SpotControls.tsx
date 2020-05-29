import {jsx} from "@emotion/core";
import {FC} from "react";
import {Dropdown, IDropdownOption} from "@fluentui/react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";

export const SpotControls: FC<{spotID: string}> = ({spotID}) => {
    const [h] = useDataHook();
    const bot = Application.getControllableBot(h);
    const spots = bot?.getParkingSpaces(h);
    const spot = spots?.[spotID];
    if (!spot) return null;
    const state = spot.isTaken ? "taken" : spot.isClaimed ? "claimed" : "available";
    const onSelect = async (e, selected: IDropdownOption) => {
        if (selected.key == "available") {
            if (state == "taken") Application.releaseSpace(spotID);
            else if (state == "claimed") Application.disclaimSpace(spotID);
        } else if (selected.key == "claimed") {
            if (state == "taken") await Application.disclaimSpace(spotID);
            Application.claimSpace(spotID);
        } else {
            Application.takeSpace(spotID);
        }
    };
    return (
        <Dropdown
            label="Spot state"
            selectedKey={state}
            onChange={onSelect}
            options={[
                {key: "available", text: "available"},
                {key: "claimed", text: "claimed"},
                {key: "taken", text: "taken"},
            ]}
        />
    );
};
