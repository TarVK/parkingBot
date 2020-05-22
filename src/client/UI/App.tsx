import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import {Simulation} from "./simulation/Simulation";
import {LotEditorView} from "./lotEditor/LotEditorView";
import {NotificationDisplayer} from "../components/NotificationManager/NotificationDisplayer";

export const App: FC = () => (
    <Fragment>
        <Router>
            <Switch>
                <Route path="/edit">
                    <LotEditorView />
                </Route>
                <Route path="/">
                    <Simulation />
                </Route>
            </Switch>
        </Router>
        <NotificationDisplayer />
    </Fragment>
);
