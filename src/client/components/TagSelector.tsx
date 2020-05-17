import {jsx} from "@emotion/core";
import {GraphFilter} from "../model/GraphFilter";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Dropdown} from "@fluentui/react";

export const TagSelector = <T extends string>({
    options,
    selected,
    onChange,
    label = "",
    placeHolder = "",
}: {
    options: T[] | Readonly<T[]>;
    selected: T[] | Readonly<T[]>;
    onChange: (selected: T[]) => void;
    label?: string;
    placeHolder?: string;
}) => (
    <Dropdown
        placeholder={placeHolder}
        label={label}
        selectedKeys={selected as any}
        onChange={(e, v) =>
            v &&
            onChange(
                v.selected
                    ? [...selected, v.text as any]
                    : selected.filter(k => k != v.key)
            )
        }
        multiSelect
        options={(options as T[]).map(tag => ({key: tag, text: tag}))}
    />
);
