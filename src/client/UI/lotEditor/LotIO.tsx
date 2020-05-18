import {jsx} from "@emotion/core";
import {FC, Fragment, useState} from "react";
import {LotEditor} from "../../model/lotEditor/LotEditor";
import {
    DefaultButton,
    PrimaryButton,
    DialogFooter,
    Dialog,
    TextField,
    MessageBarType,
} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {createToast} from "../../components/NotificationManager/createToast";
import {useDataHook} from "model-react";

/**
 * Handles importing an exporting of graphs
 */
export const LotIO: FC<{editor: LotEditor}> = ({editor}) => {
    const theme = useTheme();
    const [h] = useDataHook();
    const [showImport, setShowImport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [importValue, setImportValue] = useState("");

    return (
        <Fragment>
            <div css={{display: "flex"}}>
                <DefaultButton
                    onClick={() => setShowImport(true)}
                    css={{marginRight: theme.spacing.s1, flexGrow: 1}}>
                    Import
                </DefaultButton>
                <PrimaryButton
                    onClick={() => setShowExport(true)}
                    css={{marginLeft: theme.spacing.s1, flexGrow: 1}}>
                    Export
                </PrimaryButton>
            </div>

            {/* Exporter */}
            <Dialog
                hidden={!showExport}
                onDismiss={() => setShowExport(false)}
                dialogContentProps={{title: "Import lot graph"}}>
                <TextField
                    multiline
                    value={JSON.stringify(editor.getGraph(h), null, 4)}
                    styles={{field: {minHeight: 300}}}
                    readOnly
                />
                <DialogFooter>
                    <DefaultButton onClick={() => setShowExport(false)} text="Close" />
                </DialogFooter>
            </Dialog>

            {/* Importer */}
            <Dialog
                hidden={!showImport}
                onDismiss={() => setShowImport(false)}
                dialogContentProps={{title: "Import lot graph"}}>
                <TextField
                    multiline
                    value={importValue}
                    styles={{field: {minHeight: 300}}}
                    onChange={(e, v) => v && setImportValue(v)}
                />
                <DialogFooter>
                    <DefaultButton onClick={() => setShowImport(false)} text="Cancel" />
                    <PrimaryButton
                        onClick={() => {
                            try {
                                editor.setGraph(JSON.parse(importValue));
                                setImportValue("");
                                setShowImport(false);
                            } catch (e) {
                                createToast(
                                    `Unable to load the given graph`,
                                    MessageBarType.error
                                );
                            }
                        }}
                        text="Import"
                    />
                </DialogFooter>
            </Dialog>
        </Fragment>
    );
};
