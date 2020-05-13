import {jsx} from "@emotion/core";
import {FC} from "react";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import {SearchTest} from "./SearchTest";
import {LotEditorView} from "./lotEditor/LotEditorView";

export const App: FC = () => (
    <Router>
        <Switch>
            <Route path="/edit">
                <LotEditorView />
            </Route>
            <Route path="/">
                <SearchTest />
            </Route>
        </Switch>
    </Router>
);
